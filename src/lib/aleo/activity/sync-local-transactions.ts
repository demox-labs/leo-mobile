import {
  MAX_TX_PER_REQUEST,
  getDelegatedTransaction,
  getNFTProgramInfo,
  getProgram,
  getProgramType,
  getPublicTransactionsForAddress,
  getTransaction,
  getTransactionIdFromTransition,
} from '@src/lib/aleo-chain/client'
import {
  TransactionsTable,
  RecordsTable,
  TransitionsTable,
  PublicSyncsTable,
} from '../db/repo'
import {
  ITransaction,
  ITransactionStatus,
  ITransition,
  ITransitionStatus,
  Transaction,
  Transition,
} from '../db/transaction-types'
import { AleoChainId } from '../types'
import { IRecord } from '../db/types'
import {
  viewKeyToAddress,
  ownsTransition,
  decryptTransition,
  decryptRecord,
} from 'modules/leo-sdk-module'
import { ALEO_DECIMALS } from '@src/lib/fiat-currency/consts'
import {
  extractMicrocredits,
  extractProgramName,
} from '@src/lib/aleo-chain/helpers'
import { AleoTransition } from '@src/lib/aleo-chain/aleo-types'
import { CREDITS_PROGRAM_ID } from '../programs/credits-program'
import { formatBigInt } from '@src/utils/money'
import { cancelTransaction } from './transactions'

const addRecordToTransition = async (
  chainId: string,
  record: IRecord,
  transition: ITransition,
  viewKey: string,
  isOutput: boolean = true,
) => {
  const transitionRecordIds = isOutput ? 'outputRecordIds' : 'inputRecordIds'
  const timestampProperty = isOutput ? 'timestampCreated' : 'timestampSpent'

  if (transition[transitionRecordIds].indexOf(record.id) === -1) {
    // Associate record with transition
    transition[transitionRecordIds].push(record.id)
    await TransitionsTable.put(transition)

    // Mark transaction as finalized
    let tx = await TransactionsTable.getById(transition.transactionDbId)
    if (tx) {
      let newStatus = ITransactionStatus.Finalized
      let newTransactionId = tx.transactionId
      let newTransactionType = tx.type
      if (transition.isFee) {
        const transactionId = await getTransactionIdFromTransition(
          chainId as AleoChainId,
          transition.transitionId!,
        )
        if (newTransactionId && transactionId !== newTransactionId) {
          newStatus = ITransactionStatus.Rejected
          newTransactionId = transactionId
          newTransactionType = 'fee'
        } else {
          newTransactionId = transactionId
        }
      } else if (!newTransactionId) {
        newTransactionId = await getTransactionIdFromTransition(
          chainId as AleoChainId,
          transition.transitionId!,
        )
      }

      if (
        tx.status !== ITransactionStatus.Finalized &&
        tx.status !== ITransactionStatus.Rejected
      ) {
        tx.status = newStatus
        tx.finalizedAt = record[timestampProperty]
        tx.transactionId = newTransactionId
        tx.type = newTransactionType
      }

      tx = await updateTransactionDisplayMessageAndIcon(tx, viewKey)
      await TransactionsTable.put(tx)
    }
  }
}

const updateTransactionDisplayMessageAndIcon = async (
  tx: ITransaction,
  viewKey: string,
) => {
  const aleoTransactionResponse = await getTransaction(
    tx.chainId as AleoChainId,
    tx.transactionId!,
  )
  if (!aleoTransactionResponse) {
    return tx
  }

  const aleoTransaction = aleoTransactionResponse.transaction

  if (aleoTransaction.type === 'deploy') {
    tx.displayMessage = `Deployed ${tx.deployedProgramId!}`
    tx.displayIcon = 'DEPLOY'
  } else if (aleoTransaction.type === 'execute') {
    try {
      const address = await viewKeyToAddress(viewKey)
      const transitions = aleoTransaction.execution.transitions
      const lastTransition = transitions[transitions.length - 1]
      const programId = lastTransition.program
      const functionName = lastTransition.function
      let displayMessage =
        tx.displayMessage || `Executed ${functionName} on ${programId}`
      let displayIcon = tx.displayIcon || 'EXECUTE'

      let decryptedTransition
      let createdTransition = false
      try {
        createdTransition = await ownsTransition(
          viewKey,
          lastTransition.tpk,
          lastTransition.tcm,
        )
        if (createdTransition) {
          const decryptedTransitionStr = await decryptTransition(
            viewKey,
            JSON.stringify(lastTransition),
          )
          decryptedTransition = JSON.parse(decryptedTransitionStr)
        }
      } catch (e) {
        console.log(`Unable to decrypt transition: ${lastTransition.id}`, e)
      }

      // User is the owner of the transition
      if (createdTransition && decryptedTransition) {
        if (
          programId === CREDITS_PROGRAM_ID &&
          (functionName === 'transfer_private' ||
            functionName === 'transfer_private_to_public')
        ) {
          const recipient = decryptedTransition.inputs[1].value
          const amount = formatBigInt(
            decryptedTransition.inputs[2].value.slice(0, -3),
          )
          const credits = amount === '1' ? 'credit' : 'credits'
          if (
            recipient === address &&
            functionName === 'transfer_private_to_public'
          ) {
            displayMessage = `Converted ${amount} ${credits} to public`
            displayIcon = 'CONVERT_PUBLIC_TOKEN'
          } else {
            displayMessage = `Sent ${amount} ${credits} to ${recipient}`
            displayIcon = 'SEND'
          }
        } else if (
          programId === CREDITS_PROGRAM_ID &&
          (functionName === 'transfer_public' ||
            functionName === 'transfer_public_to_private')
        ) {
          const recipient = decryptedTransition.inputs[0].value
          const amount = formatBigInt(
            decryptedTransition.inputs[1].value.slice(0, -3),
          )
          const credits = amount === '1' ? 'credit' : 'credits'
          if (
            recipient === address &&
            functionName === 'transfer_public_to_private'
          ) {
            displayMessage = `Converted ${amount} ${credits} to private`
            displayIcon = 'CONVERT_PRIVATE_TOKEN'
          } else {
            displayMessage = `Sent ${amount} ${credits} to ${recipient}`
            displayIcon = 'SEND'
          }
        } else if (functionName === 'mint') {
          const programType = await getProgramType(
            tx.chainId as AleoChainId,
            programId,
          )
          if (programType === 'nft') {
            const programInfo = await getNFTProgramInfo(
              tx.chainId as AleoChainId,
              programId,
            )
            displayMessage = `Minted ${programInfo.symbol} NFT`
            displayIcon = 'MINT'
          } else {
            displayMessage = `Minted ${programId}`
            displayIcon = 'MINT'
          }
        } else if (functionName === 'convert_private_to_public') {
          const programType = await getProgramType(
            tx.chainId as AleoChainId,
            programId,
          )
          if (programType === 'nft') {
            const programInfo = await getNFTProgramInfo(
              tx.chainId as AleoChainId,
              programId,
            )
            displayMessage = `Converted ${programInfo.symbol} NFT to public`
            displayIcon = 'CONVERT_PUBLIC'
          } else {
            displayMessage = `Converted ${programId} to public`
            displayIcon = 'CONVERT_PUBLIC'
          }
        } else if (functionName === 'convert_public_to_private') {
          const programType = await getProgramType(
            tx.chainId as AleoChainId,
            programId,
          )
          if (programType === 'nft') {
            const programInfo = await getNFTProgramInfo(
              tx.chainId as AleoChainId,
              programId,
            )
            displayMessage = `Converted ${programInfo.symbol} NFT to private`
            displayIcon = 'CONVERT_PRIVATE'
          } else {
            displayMessage = `Converted ${programId} to private`
            displayIcon = 'CONVERT_PRIVATE'
          }
        } else if (
          functionName === 'transfer_private' ||
          functionName === 'transfer_public'
        ) {
          const programType = await getProgramType(
            tx.chainId as AleoChainId,
            programId,
          )
          if (programType === 'nft') {
            const programInfo = await getNFTProgramInfo(
              tx.chainId as AleoChainId,
              programId,
            )
            displayMessage = `Sent ${programInfo.symbol} NFT`
            displayIcon = 'SEND'
          } else {
            displayMessage = `Sent ${programId}`
            displayIcon = 'SEND'
          }
        }
      } else {
        if (
          programId === CREDITS_PROGRAM_ID &&
          (functionName === 'transfer_private' ||
            functionName === 'transfer_public_to_private')
        ) {
          const recordCiphertext = lastTransition.outputs[0].value
          const recordPlaintext = await decryptRecord(viewKey, recordCiphertext)
          const microcredits = extractMicrocredits(recordPlaintext)
          const amount = formatBigInt(microcredits, ALEO_DECIMALS)
          const credits = amount === '1' ? 'credit' : 'credits'
          displayMessage = `Received ${amount} ${credits}`
          displayIcon = 'RECEIVE'
        } else if (
          programId === CREDITS_PROGRAM_ID &&
          (functionName === 'transfer_public' ||
            functionName === 'transfer_private_to_public')
        ) {
          const inputIndex = functionName === 'transfer_public' ? 1 : 2
          const amount = formatBigInt(
            BigInt(lastTransition.inputs[inputIndex].value.slice(0, -3)),
            ALEO_DECIMALS,
          )
          const credits = amount === '1' ? 'credit' : 'credits'
          displayMessage = `Received ${amount} ${credits}`
          displayIcon = 'RECEIVE'
        } else if (
          functionName === 'transfer_private' ||
          functionName === 'transfer_public'
        ) {
          const programType = await getProgramType(
            tx.chainId as AleoChainId,
            programId,
          )
          if (programType === 'nft') {
            const programInfo = await getNFTProgramInfo(
              tx.chainId as AleoChainId,
              programId,
            )
            displayMessage = `Received ${programInfo.symbol} NFT`
            displayIcon = 'RECEIVE'
          } else {
            displayMessage = `Received ${programId}`
            displayIcon = 'RECEIVE'
          }
        }
      }
      tx.displayMessage = displayMessage
      tx.displayIcon = displayIcon
    } catch (e) {
      console.log(
        `Unable to update display message for execute transaction: ${tx.transactionId}`,
        e,
      )
    }
  } else if (aleoTransaction.type === 'fee') {
    tx.displayMessage = 'Transaction rejected'
    tx.displayIcon = 'REJECTED'
  }

  return tx
}

const createNewTransactionFromRecord = async (
  record: IRecord,
  viewKey: string,
  isOutput: boolean = true,
) => {
  const transitionRecordIds = isOutput ? 'outputRecordIds' : 'inputRecordIds'
  const transactionProperty = isOutput ? 'transactionId' : 'transactionIdSpent'
  const transitionProperty = isOutput ? 'transitionId' : 'transitionIdSpent'
  const timestampProperty = isOutput ? 'timestampCreated' : 'timestampSpent'

  const getTransactionResponse = await getTransaction(
    record.chainId as AleoChainId,
    record[transactionProperty]!,
  )
  if (!getTransactionResponse) {
    console.log(
      'Transaction not found while creating new transaction',
      record[transactionProperty],
      record.chainId,
    )
    return
  }
  const aleoTransaction = getTransactionResponse.transaction
  // Create transaction
  let transaction = new Transaction(
    aleoTransaction.type,
    record.address,
    record.chainId,
  )
  transaction.status = ITransactionStatus.Finalized
  transaction.transactionId = record[transactionProperty]
  transaction.initiatedAt = record[timestampProperty] * 1000 // Convert to milliseconds
  transaction.finalizedAt = record[timestampProperty] // Keep in seconds

  const transitions: ITransition[] = []
  if (aleoTransaction.type === 'deploy') {
    const programId = extractProgramName(aleoTransaction.deployment.program)
    transaction.deployedProgramId = programId!
    transaction.deployedEdition = aleoTransaction.deployment.edition
    transaction.deployedProgram = aleoTransaction.deployment.program
  } else if (aleoTransaction.type === 'execute') {
    const aleoTransitions = aleoTransaction.execution.transitions

    for (let i = 0; i < aleoTransitions.length; i++) {
      const aleoTransition = aleoTransitions[i]
      const program = await getProgram(
        aleoTransition.program,
        record.chainId as AleoChainId,
      )
      let inputsJson: string = ''
      const isOwned = await ownsTransition(
        viewKey,
        aleoTransition.tpk,
        aleoTransition.tcm,
      )
      if (isOwned) {
        const decryptedInputs = []
        const decryptedTransition = await decryptTransition(
          viewKey,
          JSON.stringify(aleoTransition),
        )

        const decryptedTransitionJson = JSON.parse(
          decryptedTransition,
        ) as AleoTransition
        for (const input of decryptedTransitionJson.inputs) {
          if (input.type === 'record') {
            // FUTURE, need to get record plaintext from id and tag somehow
            decryptedInputs.push(input.tag)
            continue
          }
          decryptedInputs.push(input.value)
        }
        inputsJson = JSON.stringify(decryptedInputs)
      }
      const transition = new Transition(
        record.address,
        record.chainId,
        program,
        aleoTransition.function,
        inputsJson,
        transaction.id,
        i,
        0,
      )
      transition.transitionId = aleoTransition.id
      transition.status = ITransitionStatus.Completed

      if (aleoTransition.id === record[transitionProperty])
        transition[transitionRecordIds] = [record.id]

      transitions.push(transition)
    }

    // Add transition to transaction
    transaction.transitionIds.push(...transitions.map(ts => ts.id))
  } else if (aleoTransaction.type === 'fee') {
    transaction.status = ITransactionStatus.Rejected
  } else {
    console.info(
      `Unable to handle transaction: ${(aleoTransaction as any).id}`,
      transaction,
    )
  }

  // Create transition for fee
  if (aleoTransaction.fee) {
    const aleoFee = aleoTransaction.fee.transition
    const program = await getProgram(
      aleoFee.program,
      record.chainId as AleoChainId,
    )
    const transition = new Transition(
      record.address,
      record.chainId,
      program,
      aleoFee.function,
      '',
      transaction.id,
      -1,
      1,
    )
    transition.transitionId = aleoFee.id
    transition.status = ITransitionStatus.Completed

    // Should only ever be the input, records for fees are never outputs
    if (aleoFee.id === record[transitionProperty])
      transition[transitionRecordIds] = [record.id]

    transitions.push(transition)

    // Add fee to transaction
    transaction.feeId = transition.id
    const feeAmountIndex = aleoFee.function === 'fee_public' ? 0 : 1
    const feeAmount = BigInt(aleoFee.inputs[feeAmountIndex].value.slice(0, -3))
    transaction.fee = BigInt(feeAmount)
  }
  const insertTransitionTasks = transitions.map(async transition => {
    TransitionsTable.put(transition)
  })
  await Promise.all(insertTransitionTasks)

  transaction = await updateTransactionDisplayMessageAndIcon(
    transaction,
    viewKey,
  )
  await TransactionsTable.put(transaction)
}

export const syncTransactionsFromRecords = async (
  address: string,
  chainId: string,
  viewKey: string,
) => {
  const records = await RecordsTable.getByLocallySyncedTransactions(
    chainId,
    address,
    0,
  )
  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i]
      // Handle adding transition & transaction that created record
      const transition = await TransitionsTable.getByTransitionId(
        record.transitionId,
        chainId,
        address,
      )
      if (transition) {
        await addRecordToTransition(chainId, record, transition, viewKey)
      } else {
        await createNewTransactionFromRecord(record, viewKey)
      }
      // If record spent, handle transition & transaction that spent record
      if (record.transitionIdSpent) {
        const transition_spent = await TransitionsTable.getByTransitionId(
          record.transitionIdSpent,
          chainId,
          address,
        )
        if (transition_spent)
          await addRecordToTransition(
            chainId,
            record,
            transition_spent,
            viewKey,
            false,
          )
        else await createNewTransactionFromRecord(record, viewKey, false)
        // Fully synced, no need to check this record again
        record.locallySyncedTransactions = 1
        await RecordsTable.put(record)
      }
    } catch (e) {
      console.error(
        `Failed to sync transaction from record: ${records[i].id}`,
        e,
      )
    }
  }
}

const addPublicTransactionToDb = async (
  chainId: string,
  address: string,
  viewKey: string,
  transactionId: string,
) => {
  const existingTransaction = await TransactionsTable.getByTransactionId(
    chainId,
    address,
    transactionId,
  )
  if (existingTransaction) return

  const getTransactionResponse = await getTransaction(
    chainId as AleoChainId,
    transactionId,
  )
  const aleoTransaction = getTransactionResponse.transaction

  // Create transaction
  let transaction = new Transaction(aleoTransaction.type, address, chainId)
  transaction.status = ITransactionStatus.Finalized
  transaction.transactionId = transactionId
  transaction.finalizedAt = getTransactionResponse.finalizedAt // Keep in seconds

  const transitions: ITransition[] = []
  if (aleoTransaction.type === 'deploy') {
    const programId = extractProgramName(aleoTransaction.deployment.program)
    transaction.deployedProgramId = programId!
    transaction.deployedEdition = aleoTransaction.deployment.edition
    transaction.deployedProgram = aleoTransaction.deployment.program
  } else if (aleoTransaction.type === 'execute') {
    const aleoTransitions = aleoTransaction.execution.transitions

    for (let i = 0; i < aleoTransitions.length; i++) {
      const aleoTransition = aleoTransitions[i]
      const existingTransition = await TransitionsTable.getByTransitionId(
        aleoTransition.id,
        chainId,
        address,
      )
      if (existingTransition) {
        // Transition already exists, just update the transaction id
        const existingTx = await TransactionsTable.getById(
          existingTransition.transactionDbId,
        )
        if (existingTx) {
          existingTx.transactionId = transactionId
          await TransactionsTable.put(existingTx)
          return
        }
      }
      const program = await getProgram(
        aleoTransition.program,
        chainId as AleoChainId,
      )
      let inputsJson: string = ''
      const isOwned = await ownsTransition(
        viewKey,
        aleoTransition.tpk,
        aleoTransition.tcm,
      )
      if (isOwned) {
        const decryptedInputs = []
        const decryptedTransition = await decryptTransition(
          viewKey,
          JSON.stringify(aleoTransition),
        )
        const decryptedTransitionJson = JSON.parse(
          decryptedTransition,
        ) as AleoTransition
        for (const input of decryptedTransitionJson.inputs) {
          if (input.type === 'record') {
            // FUTURE, need to get record plaintext from id and tag somehow
            decryptedInputs.push(input.tag)
            continue
          }
          decryptedInputs.push(input.value)
        }
        inputsJson = JSON.stringify(decryptedInputs)
      } else {
        const inputs = aleoTransition.inputs.map(input => input.value)
        inputsJson = JSON.stringify(inputs)
      }
      const transition = new Transition(
        address,
        chainId,
        program,
        aleoTransition.function,
        inputsJson,
        transaction.id,
        i,
        0,
      )
      transition.transitionId = aleoTransition.id
      transition.status = ITransitionStatus.Completed

      transitions.push(transition)
    }

    // Add transition to transaction
    transaction.transitionIds.push(...transitions.map(ts => ts.id))
  } else if (aleoTransaction.type === 'fee') {
    transaction.status = ITransactionStatus.Rejected
  } else {
    console.log(
      `Unable to handle transaction: ${(aleoTransaction as any).id}`,
      transaction,
    )
  }

  // Create transition for fee
  if (aleoTransaction.fee) {
    const aleoFee = aleoTransaction.fee.transition
    const program = await getProgram(aleoFee.program, chainId as AleoChainId)
    const transition = new Transition(
      address,
      chainId,
      program,
      aleoFee.function,
      '',
      transaction.id,
      -1,
      1,
    )
    transition.transitionId = aleoFee.id
    transition.status = ITransitionStatus.Completed

    transitions.push(transition)

    // Add fee to transaction
    transaction.feeId = transition.id
    const feeAmountIndex = aleoFee.function === 'fee_public' ? 0 : 1
    const feeAmount = BigInt(aleoFee.inputs[feeAmountIndex].value.slice(0, -3))
    transaction.fee = BigInt(feeAmount)
  }
  const addTransitionsTasks = transitions.map(async transition => {
    TransitionsTable.put(transition)
  })
  await Promise.all(addTransitionsTasks)

  transaction = await updateTransactionDisplayMessageAndIcon(
    transaction,
    viewKey,
  )
  await TransactionsTable.put(transaction)
}

const fetchAndAddPublicTransactionsToDb = async (
  chainId: string,
  viewKey: string,
  address: string,
  startBlock: number,
  endBlock: number,
  page = 0,
) => {
  const transactions = await getPublicTransactionsForAddress(
    chainId as AleoChainId,
    address,
    startBlock,
    endBlock,
    page,
  )
  const uniqueTransactions = new Set(transactions)
  const tasks = Array.from(uniqueTransactions).map(transactionId =>
    addPublicTransactionToDb(chainId, address, viewKey, transactionId),
  )
  await Promise.all(tasks)

  return transactions
}

const MAX_BLOCKS_PUBLIC_TRANSACTIONS = 50_000
export const syncPublicTransactions = async (
  chainId: string,
  address: string,
  viewKey: string,
  currentBlock: number,
) => {
  const lastSync = (
    await PublicSyncsTable.getByChainIdAndAddress(chainId, address)
  )[0]
  if (!lastSync) {
    const startBlock = 0
    const endBlock = Math.min(currentBlock, MAX_BLOCKS_PUBLIC_TRANSACTIONS)
    const transactions = await fetchAndAddPublicTransactionsToDb(
      chainId,
      viewKey,
      address,
      startBlock,
      endBlock,
    )
    const rangeComplete = transactions.length < MAX_TX_PER_REQUEST
    await PublicSyncsTable.insertNew({
      chainId,
      address,
      startBlock,
      endBlock,
      page: 0,
      rangeComplete,
    })
  } else {
    if (lastSync.rangeComplete && lastSync.endBlock === currentBlock) return

    if (lastSync.rangeComplete) {
      const startBlock = lastSync.endBlock
      const endBlock = Math.min(
        currentBlock,
        lastSync.endBlock + MAX_BLOCKS_PUBLIC_TRANSACTIONS,
      )
      const transactions = await fetchAndAddPublicTransactionsToDb(
        chainId,
        viewKey,
        address,
        startBlock,
        endBlock,
      )
      const rangeComplete = transactions.length < MAX_TX_PER_REQUEST
      await PublicSyncsTable.update(lastSync.id, {
        chainId,
        address,
        startBlock,
        endBlock,
        page: 0,
        rangeComplete,
      })
    } else {
      const startBlock = lastSync.startBlock
      const endBlock = lastSync.endBlock
      const page = lastSync.page + 1
      const transactions = await fetchAndAddPublicTransactionsToDb(
        chainId,
        viewKey,
        address,
        startBlock,
        endBlock,
        page,
      )
      const rangeComplete = transactions.length < MAX_TX_PER_REQUEST
      await PublicSyncsTable.update(lastSync.id, {
        chainId,
        address,
        startBlock: lastSync.startBlock,
        endBlock: lastSync.endBlock,
        page,
        rangeComplete,
      })
    }
  }
  const updatedLastSync = (
    await PublicSyncsTable.getByChainIdAndAddress(chainId, address)
  )[0]
  if (!updatedLastSync) throw new Error('Public Sync failed')
  if (
    !updatedLastSync.rangeComplete ||
    updatedLastSync.endBlock !== currentBlock
  ) {
    await syncPublicTransactions(chainId, address, viewKey, currentBlock)
  }
}

export const syncTransactionsWithoutRecords = async (
  address: string,
  chainId: string,
  viewKey: string,
) => {
  const completedTransactions = await TransactionsTable.getCompleted(
    chainId,
    address,
  )
  const finalizeTasks = []
  for (let i = 0; i < completedTransactions.length; i++) {
    let tx = completedTransactions[i]
    try {
      if (tx.transactionId) {
        const aleoTx = await getTransaction(
          tx.chainId as AleoChainId,
          tx.transactionId!,
        )
        if (!aleoTx)
          throw new Error(`Failed to get transaction: ${tx.transactionId}`)

        tx.status = ITransactionStatus.Finalized
        tx.finalizedAt = Date.now() / 1000 // Convert to seconds
        tx = await updateTransactionDisplayMessageAndIcon(tx, viewKey)
        finalizeTasks.push(TransactionsTable.put(tx))
      }
    } catch (e) {
      console.log(`Failed to finalize transaction: ${tx.transactionId}`, e)
      const txAgeInSeconds = Date.now() / 1000 - tx.completedAt!
      if (txAgeInSeconds > 60 * 5) {
        console.log(`Cancelling transaction: ${tx.transactionId}`)
        await cancelTransaction(tx)
      }
    }
  }
  await Promise.all(finalizeTasks)
}

export const updateDelegatedTransactions = async (
  chainId: string,
  address: string,
) => {
  const transactions = await TransactionsTable.getCompletedDelegated(
    chainId,
    address,
  )

  const tasks = transactions.map(async tx => {
    if (tx.transactionId) return

    const delegatedTx = await getDelegatedTransaction(
      chainId as AleoChainId,
      tx.requestId!,
    )
    if (delegatedTx.status === 'Failed') {
      tx.status = ITransactionStatus.Failed
      await TransactionsTable.put(tx)
    } else if (
      !tx.transactionId &&
      (delegatedTx.status === 'Completed' ||
        delegatedTx.status === 'Broadcasted')
    ) {
      tx.transactionId = JSON.parse(delegatedTx.transaction).id
      tx.json = delegatedTx.transaction
      await TransactionsTable.put(tx)
    }
  })
  await Promise.all(tasks)
}
