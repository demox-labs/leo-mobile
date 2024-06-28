import {
  executeAuthorization,
  programToId,
  authorizeTransaction,
  decryptRecord,
} from 'modules/leo-sdk-module'
import {
  ALEO_API_BASE_URLS,
  ExecuteTransaction,
  broadcastTransaction,
  delegateTransaction,
  extractMicrocredits,
  getProgram,
} from '@src/lib/aleo-chain'
import { RecordsTable, TransactionsTable, TransitionsTable } from '../db/repo'
import {
  ITransaction,
  ITransactionStatus,
  ITransition,
  ITransitionStatus,
  Transaction,
  Transition,
} from '../db/transaction-types'
import { AleoAccount, AleoChainId } from '../types'
import {
  CREDITS_PROGRAM,
  CREDITS_PROGRAM_ID,
} from '../programs/credits-program'
import { fetchRecordsForProgram } from './fetch'
import { IRecord } from '../db/types'
import { ALEO_DECIMALS } from '@src/lib/fiat-currency/consts'
import { formatBigInt } from '@src/utils/money'
import { retry } from '@src/lib/utility/retry'
import { AleoTransaction } from '@demox-labs/aleo-wallet-adapter-base/dist/transaction'

export const MAX_WAIT_BEFORE_CANCEL = 30 * 60_000 // 30 minutes
const MAX_TRANSACTION_RETRIES = 5
const MAX_BROADCAST_RETRIES = 5
const WAIT_BETWEEN_RETRIES = 30_000 // 5 seconds

export const TransactionProcessingStates = [
  ITransactionStatus.DownloadingProverFiles,
  ITransactionStatus.GeneratingTransaction,
  ITransactionStatus.GeneratingDeployment,
  ITransactionStatus.Broadcasting,
]

/**
 * Update the status of the transaction
 * @param id The id of the transaction to update
 * @throws if the transaction has been cancelled
 */
const updateTransactionStatus = async <K extends keyof ITransaction>(
  id: string,
  status: ITransactionStatus,
  otherValues: Pick<ITransaction, K>,
) => {
  const tx = await TransactionsTable.getById(id)
  if (!tx) throw new Error('No transaction found to update')
  if (
    tx.status === ITransactionStatus.Failed ||
    tx.status === ITransactionStatus.Completed ||
    tx.status === ITransactionStatus.Finalized ||
    tx.status === ITransactionStatus.Rejected
  ) {
    console.trace()
    throw new Error('Transaction already in a finalized state')
  }

  const newTx = Object.assign(tx, otherValues)
  newTx.status = status
  await TransactionsTable.put(newTx)
}

export const getTransactionsInProgress = async () => {
  const transactions = await TransactionsTable.getAnyInStatuses(
    TransactionProcessingStates,
  )
  transactions.sort((tx1, tx2) => tx1.initiatedAt - tx2.initiatedAt)
  return transactions
}

export const getQueuedTransactions = async () => {
  const transactions = await TransactionsTable.getAnyInStatuses([
    ITransactionStatus.Queued,
  ])
  transactions.sort((tx1, tx2) => tx1.initiatedAt - tx2.initiatedAt)
  return transactions
}

export const cancelTransaction = async (tx: ITransaction) => {
  // Cancel the transaction
  const tasks = []
  const dbTx = await TransactionsTable.getById(tx.id)
  if (dbTx) {
    dbTx.completedAt = Date.now() / 1000 // Convert to seconds
    dbTx.status = ITransactionStatus.Failed
    tasks.push(TransactionsTable.put(dbTx))
  }

  // Unlock the records from the transition
  const transitions = await TransitionsTable.getByTransactionDbId(tx.id)
  const recordIds = transitions.map(trans => trans.inputRecordIds).flat()
  for (const recId of recordIds) {
    const record = await RecordsTable.getById(recId)
    if (record) {
      record.locked = 0
      tasks.push(RecordsTable.put(record))
    }
  }

  // Cancel the associated transitions
  for (const transition of transitions) {
    transition.completedAt = Date.now() / 1000 // Convert to seconds
    transition.status = ITransitionStatus.Failed
    tasks.push(TransitionsTable.put(transition))
  }

  await Promise.all(tasks)
}

export const getAllUncompletedTransactions = async () => {
  const transactions = await TransactionsTable.getAnyInStatuses([
    ...TransactionProcessingStates,
    ITransactionStatus.Queued,
  ])
  transactions.sort((tx1, tx2) => tx1.initiatedAt - tx2.initiatedAt)
  return transactions
}

const unlockStuckRecords = async () => {
  const inProgressTransactions = await getAllUncompletedTransactions()
  if (inProgressTransactions.length === 0) {
    const lockedRecords = await RecordsTable.getLockedRecords()
    const updateTasks = lockedRecords.map(async record => {
      record.locked = 0
      return RecordsTable.put(record)
    })
    await Promise.all(updateTasks)
  }
}

export const cancelFailedBroadcastTransactions = async () => {
  const transactions = await TransactionsTable.getFailedBroadcastTransactions(
    MAX_WAIT_BEFORE_CANCEL,
  )

  const cancelTransactionUpdates = transactions.map(async tx =>
    cancelTransaction(tx),
  )
  await Promise.all(cancelTransactionUpdates)
}

/**
 * Cancel all of the transactions (& their transitions) that are taking too long to process
 */
export const cancelStuckTransactions = async () => {
  const transactions = await getTransactionsInProgress()
  const cancelTransactionUpdates = transactions
    .filter(tx => {
      return (
        tx.processingStartedAt &&
        Date.now() - tx.processingStartedAt > MAX_WAIT_BEFORE_CANCEL
      )
    })
    .map(async tx => cancelTransaction(tx))

  await Promise.all(cancelTransactionUpdates)
}

export const cancelTransactions = async () => {
  await cancelStuckTransactions()
  await cancelFailedBroadcastTransactions()
  await unlockStuckRecords()
}

export const getCompletedAndFinalizedTransactions = async (
  address: string,
  chainId: string,
  programId?: string | null,
  offset?: number,
  limit?: number,
) => {
  let transactions =
    await TransactionsTable.getCompletedAndFinalizedTransactions(
      chainId,
      address,
    )
  transactions.sort(
    (tx1, tx2) =>
      (tx1.finalizedAt || tx1.completedAt || tx1.initiatedAt) -
      (tx2.finalizedAt || tx2.completedAt || tx2.initiatedAt),
  )

  if (programId) {
    const transactionIds = new Set(transactions.map(tx => tx.id))
    const transitions = await TransitionsTable.getByTransactionDbIds(
      Array.from(transactionIds),
    )
    const transactionIdsToPrograms: { [key: string]: Set<string> } = {}
    for (const ts of transitions) {
      const transitionProgramId = await programToId(ts.id)
      if (!transactionIdsToPrograms[ts.transactionDbId]) {
        transactionIdsToPrograms[ts.transactionDbId] = new Set([
          transitionProgramId,
        ])
      } else {
        transactionIdsToPrograms[ts.transactionDbId].add(transitionProgramId)
      }
    }

    transactions = transactions.filter(tx => {
      if (!transactionIdsToPrograms[tx.id]) {
        return false
      }
      return transactionIdsToPrograms[tx.id].has(programId)
    })
  }

  return transactions.slice(offset, limit)
}

export const getUncompletedTransactions = async (
  address: string,
  chainId: string,
) => {
  let transactions = await TransactionsTable.getAnyInStatuses([
    ITransactionStatus.Queued,
    ...TransactionProcessingStates,
  ])
  transactions.sort((tx1, tx2) => tx1.initiatedAt - tx2.initiatedAt)
  transactions = transactions.filter(
    tx => tx.address === address && tx.chainId === chainId,
  )
  return transactions
}

export const getTransactionStatus = async (id: string) => {
  const tx = await TransactionsTable.getById(id)
  if (!tx) {
    return null
  }
  return tx.status
}

export const cancelTransactionById = async (id: string) => {
  const tx = await TransactionsTable.getById(id)
  if (tx) await cancelTransaction(tx)
}

export const getFunctionNameBasedOnSendReceive = (
  isPrivate: boolean,
  isReceive: boolean,
) => {
  if (isPrivate) {
    return isReceive ? 'transfer_private' : 'transfer_private_to_public'
  } else {
    return isReceive ? 'transfer_public' : 'transfer_public_to_private'
  }
}

export const getRecordsForAmount = async (
  amount: bigint,
  publicKey: string,
  chainId: AleoChainId,
) => {
  // Get the unspent records
  let unspentRecords = await fetchRecordsForProgram(
    chainId,
    publicKey,
    CREDITS_PROGRAM_ID,
    false,
  )
  unspentRecords = unspentRecords.filter(rec => rec.locked === 0)
  if (unspentRecords.length === 0) {
    throw Error('No records to spend')
  }

  // Sort records by amount, descending
  unspentRecords.sort((rec1, rec2) =>
    rec1.microcredits! > rec2.microcredits! ? -1 : 1,
  )

  // Get records up until amount
  let sum = BigInt(0)
  const recordsToTransfer: IRecord[] = []
  for (let i = 0; i < unspentRecords.length; i++) {
    if (sum >= amount) break
    if (
      unspentRecords[i].microcredits === undefined ||
      unspentRecords[i].microcredits === BigInt(0)
    )
      continue
    sum += unspentRecords[i].microcredits!
    recordsToTransfer.push(unspentRecords[i])
  }

  if (sum < amount) {
    throw Error('Not enough balance to send transaction')
  }

  return recordsToTransfer
}

export const getRecordForFee = async (
  fee: bigint,
  publicKey: string,
  chainId: AleoChainId,
) => {
  // Get the unspent records
  let unspentRecords = await fetchRecordsForProgram(
    chainId,
    publicKey,
    CREDITS_PROGRAM_ID,
    false,
  )
  unspentRecords = unspentRecords.filter(rec => rec.locked === 0)
  if (unspentRecords.length === 0) {
    unlockStuckRecords()
    throw Error('No records for fee')
  }

  // Sort records by amount, ascending
  unspentRecords.sort((rec1, rec2) =>
    rec1.microcredits! < rec2.microcredits! ? -1 : 1,
  )

  for (let i = 0; i < unspentRecords.length; i++) {
    if (unspentRecords[i].microcredits! >= fee) {
      return unspentRecords[i]
    }
  }

  throw Error('Not enough balance to pay fee')
}

const createFeeTransition = async (
  fee: bigint,
  publicKey: string,
  chainId: AleoChainId,
  viewKey: string,
  transactionId: string,
  isPrivate: boolean,
) => {
  const functionName = isPrivate ? 'fee_private' : 'fee_public'
  const feeInputs = [`${fee.toString()}u64`]
  const inputRecordIds: string[] = []
  if (isPrivate) {
    const feeRecord = await getRecordForFee(fee, publicKey, chainId)
    await RecordsTable.updateRecordLockState([feeRecord.id], true)
    const feePlaintextRecord = await decryptRecord(
      viewKey,
      feeRecord.ciphertext,
    )
    feeInputs.unshift(feePlaintextRecord)
    inputRecordIds.push(feeRecord.id)
  }
  const feeTransition = new Transition(
    publicKey,
    chainId,
    CREDITS_PROGRAM,
    functionName,
    JSON.stringify(feeInputs),
    transactionId,
    0,
    1,
  )

  feeTransition.inputRecordIds = inputRecordIds
  return feeTransition
}

export const parseAuthorization = (authorization: string) => {
  return JSON.parse(authorization, (_key, value) => {
    // Check if the value is a string that looks like a JSON object or array
    if (
      typeof value === 'string' &&
      (value.startsWith('{') || value.startsWith('['))
    ) {
      try {
        // Try to parse the string as JSON
        JSON.parse(value)
        // If the parsing is successful but you want to keep it as a string, return the original string
        return value
      } catch (e) {
        // If parsing fails, it's not JSON, so just return the string as is
        return value
      }
    } else {
      // For non-string values or strings that don't look like JSON, return the value as is
      return value
    }
  })
}

/**
 * Initiate a transfer transaction to later be completed by the generateTransactionsLoop
 * @param account The account sending the transfer
 * @param chainId The chainId to execute the transaction on
 * @param amount The amount of the transfer
 * @param toAddress The recipient of the transfer
 * @param fee The fee to pay for the transaction
 * @param feePrivate Whether the fee should be paid with a private record
 * @param delegate Whether the transaction should be delegated
 * @param receivePrivate Whether the transaction should be received as private
 */
export const initiateTransferTransaction = async (
  account: AleoAccount,
  chainId: AleoChainId,
  amount: bigint,
  toAddress: string,
  fee: bigint,
  feePrivate: boolean,
  delegate: boolean,
  receivePrivate: boolean,
) => {
  const { publicKey, privateKey, viewKey } = account
  const functionName = receivePrivate
    ? 'transfer_private'
    : 'transfer_private_to_public'
  const recordsToTransfer = await getRecordsForAmount(
    amount,
    publicKey,
    chainId,
  )
  await RecordsTable.updateRecordLockState(
    recordsToTransfer.map(rec => rec.id),
    true,
  )

  const transactions: ITransaction[] = []
  const transitions: ITransition[] = []

  // In the future this will change to a single transaction but for now, each transaction only supports 1 transition
  let remainingBalance = amount
  for (let i = 0; i < recordsToTransfer.length; i++) {
    const record = recordsToTransfer[i]

    // Create transaction
    const transaction = new Transaction('execute', publicKey, chainId as string)

    // Create transition
    const plaintextRecord = await decryptRecord(viewKey, record.ciphertext)
    const amountToSend =
      remainingBalance > record.microcredits!
        ? record.microcredits!
        : remainingBalance
    const inputs = [plaintextRecord, toAddress, `${amountToSend.toString()}u64`]
    const transition = new Transition(
      publicKey,
      chainId,
      CREDITS_PROGRAM,
      functionName,
      JSON.stringify(inputs),
      transaction.id,
      0,
      0,
    )
    transition.inputRecordIds.push(record.id)

    // Create transition for fee
    const feeTransition = await createFeeTransition(
      fee,
      publicKey,
      chainId,
      viewKey,
      transaction.id,
      feePrivate,
    )

    const feeRecord = feePrivate
      ? JSON.parse(feeTransition.inputsJson)[0]
      : undefined

    const authJson = await authorizeTransaction(
      privateKey!,
      CREDITS_PROGRAM,
      functionName,
      inputs,
      Number(fee) / 10 ** ALEO_DECIMALS,
      feeRecord,
      '{}',
    )
    const auth = parseAuthorization(authJson)

    // Update fields from authorization
    transaction.authorization = auth.authorization
    transaction.feeAuthorization = auth.fee_authorization
    transaction.delegated = delegate ? 1 : 0
    transition.transitionId = JSON.parse(auth.authorization).transitions[0].id
    feeTransition.transitionId = JSON.parse(
      auth.fee_authorization,
    ).transitions[0].id

    // Add display message to transaction
    const sendingAmount = formatBigInt(amountToSend, ALEO_DECIMALS)
    const creditString = sendingAmount === '1' ? 'credit' : 'credits'
    if (toAddress === publicKey && !receivePrivate) {
      transaction.displayMessage = `Converting ${sendingAmount} ${creditString} to public`
      transaction.displayIcon = 'CONVERT_PUBLIC_TOKEN'
    } else {
      transaction.displayMessage = 'Sending'
      transaction.displayIcon = 'SEND'
    }

    // Add transition to transaction
    transaction.transitionIds.push(transition.id)

    // Add fee transition to transaction
    transaction.fee = fee
    transaction.feeId = feeTransition.id

    transactions.push(transaction)
    transitions.push(transition)
    transitions.push(feeTransition)

    // Change remaining balance
    remainingBalance = remainingBalance - extractMicrocredits(plaintextRecord)
  }
  transactions.map(async tx => {
    await TransactionsTable.put(tx)
  })
  transitions.map(async ts => {
    await TransitionsTable.put(ts)
  })

  if (delegate) {
    await Promise.all(
      transactions.map(async tx => {
        const requestId = await delegateTransaction(
          chainId,
          tx.authorization!,
          CREDITS_PROGRAM,
          functionName,
          tx.feeAuthorization,
          true,
        )
        await updateTransactionStatus(tx.id, ITransactionStatus.Completed, {
          processingStartedAt: Date.now(),
          completedAt: Date.now() / 1000,
          requestId,
        })
      }),
    )
  }
}

/**
 * Initiate a conversion of public to private credits to later be completed by the generateTransactionsLoop
 * @param account The account sending the transfer
 * @param chainId The chainId to execute the transaction on
 * @param programId The programId to execute the transaction for
 * @param amount The amount of the transfer
 * @param toAddress The recipient of the transfer
 * @param fee The fee to pay for the transaction
 * @param feePrivate Whether the fee should be paid with a private record
 * @param delegate Whether the transaction should be delegated
 * @param receivePrivate Whether the transaction should be received as private
 */
export const initiatePublicTransferTransaction = async (
  account: AleoAccount,
  chainId: AleoChainId,
  programId: string,
  amount: bigint,
  toAddress: string,
  fee: bigint,
  feePrivate: boolean,
  delegate: boolean,
  receivePrivate: boolean,
) => {
  const { publicKey, privateKey, viewKey } = account
  const functionName = receivePrivate
    ? 'transfer_public_to_private'
    : 'transfer_public'
  const program = await getProgram(programId, chainId)

  const transitions: ITransition[] = []

  // Create transaction
  const transaction = new Transaction('execute', publicKey, chainId as string)

  // Create transition
  const inputs = [toAddress, `${amount.toString()}u64`]
  const transition = new Transition(
    publicKey,
    chainId,
    program,
    functionName,
    JSON.stringify(inputs),
    transaction.id,
    0,
    0,
  )

  // Create transition for fee
  const feeTransition = await createFeeTransition(
    fee,
    publicKey,
    chainId,
    viewKey,
    transaction.id,
    feePrivate,
  )

  const feeRecord = feePrivate
    ? JSON.parse(feeTransition.inputsJson)[0]
    : undefined
  const authJson = await authorizeTransaction(
    privateKey!,
    CREDITS_PROGRAM,
    functionName,
    inputs,
    Number(fee) / 10 ** ALEO_DECIMALS,
    feeRecord,
    '{}',
  )
  const auth = parseAuthorization(authJson)

  transaction.authorization = auth.authorization
  transaction.feeAuthorization = auth.fee_authorization
  transaction.delegated = delegate ? 1 : 0
  transition.transitionId = JSON.parse(auth.authorization).transitions[0].id
  feeTransition.transitionId = JSON.parse(
    auth.fee_authorization,
  ).transitions[0].id

  // Add display message to transaction
  if (toAddress === publicKey && receivePrivate) {
    transaction.displayMessage = `Converting ${formatBigInt(
      amount,
      ALEO_DECIMALS,
    )} credits to private`
    transaction.displayIcon = 'CONVERT_PRIVATE_TOKEN'
  } else {
    transaction.displayMessage = `Sending ${formatBigInt(
      amount,
      ALEO_DECIMALS,
    )} credits`
    transaction.displayIcon = 'SEND'
  }

  // Add transition to transaction
  transaction.transitionIds.push(transition.id)

  // Add fee transition to transaction
  transaction.fee = fee
  transaction.feeId = feeTransition.id

  transitions.push(transition)
  transitions.push(feeTransition)

  await TransactionsTable.put(transaction)
  transitions.map(async tx => {
    await TransitionsTable.put(tx)
  })

  if (delegate) {
    const requestId = await delegateTransaction(
      chainId,
      transaction.authorization!,
      CREDITS_PROGRAM,
      functionName,
      transaction.feeAuthorization,
      true,
    )
    await updateTransactionStatus(
      transaction.id,
      ITransactionStatus.Completed,
      {
        processingStartedAt: Date.now(),
        completedAt: Date.now() / 1000,
        requestId,
      },
    )
  }
}

const extractImports = (program: string) => {
  const regex = /import\s+([a-zA-Z0-9_\.]+);/g //eslint-disable-line
  let match
  const imports = []

  while ((match = regex.exec(program)) !== null) {
    imports.push(match[1])
  }
  return imports
}

export const resolveImports = async (
  programId: string,
  chainId: string,
  imports: { [key: string]: string } = {},
) => {
  const programString = await getProgram(programId, chainId as AleoChainId)
  const importIds: string[] = extractImports(programString)
  for (let i = 0; i < importIds.length; i++) {
    if (!imports[importIds[i]]) {
      const importProgram = await getProgram(
        importIds[i],
        chainId as AleoChainId,
      )
      imports[importIds[i]] = importProgram
      await resolveImports(importIds[i], chainId, imports)
    }
  }
  return imports
}

export const formatDAppDisplayMessages = async (transitions: Transition[]) => {
  const messages = await Promise.all(
    transitions.map(async ts => {
      const tsTexts: string[] = []
      const inputs = JSON.parse(ts.inputsJson) as string[]
      return tsTexts.concat(
        ...inputs.map((inp, i) => `${i + 1}. ${inp.replace(/\n/g, '')}`),
      )
    }),
  )
  return messages.flat()
}

const areStringsEqualIgnoringSpaces = (str1: string, str2: string): boolean => {
  const normalize = (str: string) => str.replace(/\s+/g, '')
  return normalize(str1) === normalize(str2)
}

const tryFetchRecordsFromInputs = async (
  inputs: any[],
  aleoTx: AleoTransaction,
  viewKey: string,
): Promise<any[]> => {
  const result = []
  const transformedInputs = []
  const inputRecordIds = []
  for (let i = 0; i < inputs.length; i++) {
    // Accounts for records passed in as objects in the input
    if (inputs[i]['id']) {
      const record = await RecordsTable.getById(inputs[i].id)
      if (!record) {
        unlockStuckRecords()
        throw new Error('Unspent record not found')
      }
      inputRecordIds.push(record.id)
      const plaintextRecord = await decryptRecord(viewKey, record.ciphertext)
      transformedInputs.push(plaintextRecord)
      await RecordsTable.updateRecordLockState([record.id], true)
    } else {
      // Accounts for records passed in as strings in the input
      try {
        const record = inputs[i]
        const allRecords = await RecordsTable.getByChainIdAndAddress(
          aleoTx.chainId,
          aleoTx.address,
        )
        const matchingRecords = allRecords.filter(async rec => {
          return areStringsEqualIgnoringSpaces(
            record,
            await decryptRecord(viewKey, rec.ciphertext),
          )
        })

        if (matchingRecords.length === 1) {
          inputRecordIds.push(matchingRecords[0].id)
          transformedInputs.push(record)
          await RecordsTable.updateRecordLockState(
            [matchingRecords[0].id],
            true,
          )
        } else {
          unlockStuckRecords()
          throw new Error(
            'Input record does not match any record in the database',
          )
        }
      } catch {
        transformedInputs.push(inputs[i])
      }
    }
  }
  result.push(transformedInputs)
  result.push(inputRecordIds)
  return result
}

export const convertDAppTransactionIntoTransaction = async (
  aleoTx: AleoTransaction,
  viewKey: string,
  fee: number,
  feePrivate: boolean,
  includeFeeTransition: boolean = true,
  onlyExecute: boolean = false,
) => {
  const transaction = new Transaction(
    'execute',
    aleoTx.address,
    aleoTx.chainId,
    BigInt(0),
  )
  const transitions: Transition[] = []
  let imports: { [key: string]: string } = {}
  for (let i = 0; i < aleoTx.transitions.length; i++) {
    const aleoTs = aleoTx.transitions[i]
    // Fetch the program from on-chain. Shouldn't trust DApp to provide
    const programString = await getProgram(
      aleoTs.program,
      aleoTx.chainId as AleoChainId,
    )
    imports = await resolveImports(aleoTs.program, aleoTx.chainId, imports)

    const [transformedInputs, inputRecordIds] = await tryFetchRecordsFromInputs(
      aleoTs.inputs,
      aleoTx,
      viewKey,
    )

    const transition = new Transition(
      aleoTx.address,
      aleoTx.chainId,
      programString,
      aleoTs.functionName,
      JSON.stringify(transformedInputs),
      transaction.id,
      i,
      0,
    )
    transition.inputRecordIds = inputRecordIds
    transitions.push(transition)
    transaction.transitionIds.push(transition.id)
  }

  // Create transition for fee
  const txFee = BigInt(Math.floor(fee))
  if (includeFeeTransition) {
    const feeTransition = await createFeeTransition(
      txFee,
      aleoTx.address,
      aleoTx.chainId as AleoChainId,
      viewKey,
      transaction.id,
      feePrivate,
    )
    transitions.push(feeTransition)
    transaction.feeId = feeTransition.id
    transaction.imports = imports
  }

  transaction.imports = imports

  // Add fee transition to transaction
  transaction.fee = txFee

  // Set display message, overwrite until the last transition
  const lastAleoTransition = aleoTx.transitions[aleoTx.transitions.length - 1]
  transaction.displayMessage = `Executing ${lastAleoTransition.functionName} - ${lastAleoTransition.program}`
  transaction.onlyExecute = onlyExecute ? 1 : 0
  return { transaction, transitions }
}

export const createTransaction = async (
  transaction: Transaction,
  transitions: Transition[],
  delegate: boolean,
) => {
  // Lock the records
  const recordIds = transitions.map(ts => ts.inputRecordIds).flat()
  await RecordsTable.updateRecordLockState(recordIds, true)

  // Create the transaction
  transaction.delegated = delegate ? 1 : 0
  const createTransactions = TransactionsTable.put(transaction)
  const createTransitions = transitions.map(ts => TransitionsTable.put(ts))

  await Promise.all([createTransactions, ...createTransitions])

  if (delegate && transaction.onlyExecute === 0) {
    const requestId = await delegateTransaction(
      transaction.chainId as AleoChainId,
      transaction.authorization!,
      transitions[0].program,
      transitions[0].functionName,
      transaction.feeAuthorization,
      true,
      transaction.imports,
    )
    await updateTransactionStatus(
      transaction.id,
      ITransactionStatus.Completed,
      {
        processingStartedAt: Date.now(),
        completedAt: Date.now(),
        requestId,
      },
    )
  }

  return transaction.id
}

const generateTransaction = async (tx: ITransaction) => {
  // Download the prover files
  const transitions = await TransitionsTable.getByTransactionDbId(tx.id)
  const feeTransition = transitions.find(ts => ts.isFee)

  // Generate the transitions
  await updateTransactionStatus(
    tx.id,
    ITransactionStatus.GeneratingTransaction,
    { processingStartedAt: Date.now() },
  )
  const executeTransition = transitions.find(ts => !ts.isFee)!
  const authorization = tx.authorization!
  const apiUrl = ALEO_API_BASE_URLS.get(tx.chainId! as AleoChainId)!

  // If onlyExecute, don't broadcast the transaction
  if (tx.onlyExecute === 1) {
    const transactionJSON = await executeAuthorization(
      authorization,
      null,
      executeTransition.program,
      tx.imports! as any, // TODO: for some reason this is already a string
      executeTransition.functionName,
      apiUrl,
    )

    await updateTransactionStatus(tx.id, ITransactionStatus.Finalized, {
      json: transactionJSON,
    })
    return
  }

  const feeAuthorization = tx.feeAuthorization!
  const transactionJSON = await retry(
    async () =>
      executeAuthorization(
        authorization,
        feeAuthorization,
        executeTransition.program,
        tx.imports! as any, // TODO: for some reason this is already a string
        executeTransition.functionName,
        apiUrl,
      ),
    MAX_TRANSACTION_RETRIES,
  )

  const aleoTransaction: ExecuteTransaction = JSON.parse(transactionJSON)

  // Update the transitions with the generated transition ids
  executeTransition.completedAt = Date.now() / 1000 // Convert to seconds
  executeTransition.transitionId = aleoTransaction.execution.transitions[0].id
  executeTransition.status = ITransitionStatus.Completed
  feeTransition!.completedAt = Date.now() / 1000 // Convert to seconds
  feeTransition!.transitionId = aleoTransaction.fee.transition.id
  feeTransition!.status = ITransitionStatus.Completed

  await TransitionsTable.put(executeTransition)
  await TransitionsTable.put(feeTransition!)

  // Broadcast Transaction
  await updateTransactionStatus(tx.id, ITransactionStatus.Broadcasting, {
    json: transactionJSON,
  })

  const transactionId = await retry(
    () => broadcastTransaction(tx.chainId as AleoChainId, transactionJSON),
    MAX_BROADCAST_RETRIES,
    WAIT_BETWEEN_RETRIES,
  )

  updateTransactionStatus(tx.id, ITransactionStatus.Completed, {
    transactionId,
    completedAt: Date.now() / 1000,
  })
}

export const safeGenerateTransaction = async (tx: ITransaction) => {
  try {
    await generateTransaction(tx)
  } catch (e) {
    console.log('generateTransaction error', e)
    await updateTransactionStatus(tx.id, ITransactionStatus.Failed, {
      completedAt: Date.now() / 1000,
    })
  }
}
