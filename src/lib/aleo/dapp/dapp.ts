import { getData, setData } from '@src/utils/storage'
import { AleoDAppSession, AleoDAppSessions, AleoNetwork } from '../types'
import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base'
import { NETWORKS } from '../networks'
import { fetchChainId } from '../helpers'
import {
  AleoDAppDecryptRequest,
  AleoDAppDecryptResponse,
  AleoDAppDisconnectResponse,
  AleoDAppErrorType,
  AleoDAppGetCurrentPermissionResponse,
  AleoDAppMessageType,
  AleoDAppPermissionRequest,
  AleoDAppPermissionResponse,
  AleoDAppRecordPlaintextsRequest,
  AleoDAppRecordPlaintextsResponse,
  AleoDAppRecordsRequest,
  AleoDAppRecordsResponse,
  AleoDAppSignRequest,
  AleoDAppSignResponse,
  AleoDAppTransactionHistoryRequest,
  AleoDAppTransactionHistoryResponse,
  AleoDAppTransactionRequest,
  AleoDAppTransactionResponse,
  AleoDAppTransactionStatusRequest,
  AleoDAppTransactionStatusResponse,
} from 'leo-wallet-window/src'
import { withUnlocked } from '../store'
import { PendingResponse } from './types'
import { fetchDAppRecordsForProgram } from '../activity/fetch'
import {
  convertDAppTransactionIntoTransaction,
  createTransaction,
  formatDAppDisplayMessages,
  getCompletedAndFinalizedTransactions,
  getTransactionStatus,
  parseAuthorization,
} from '../activity/transactions'
import { formatTransactionStatus } from '../db/transaction-types'
import { authorizeTransaction, programToId } from 'modules/leo-sdk-module'
import { ALEO_DECIMALS } from '@src/lib/fiat-currency/consts'
import { formatBigInt } from '@src/utils/money'

const STORAGE_KEY = 'dapp_sessions'

const VALID_DECRYPT_PERMISSIONS = [
  DecryptPermission.UponRequest,
  DecryptPermission.AutoDecrypt,
  DecryptPermission.OnChainHistory,
]

export async function getCurrentPermission(
  origin: string,
): Promise<AleoDAppGetCurrentPermissionResponse> {
  const currentAccount = await getCurrentAccount()
  const currentAccountPubKey = currentAccount?.publicKey
  const dApp = currentAccountPubKey
    ? await getDApp(origin, currentAccountPubKey)
    : undefined
  const permission = dApp
    ? {
        rpc: await getNetworkRPC(dApp.network),
        publicKey: dApp.publicKey,
        decryptPermission: dApp.decryptPermission,
      }
    : null
  return {
    type: AleoDAppMessageType.GetCurrentPermissionResponse,
    permission,
  }
}

export async function requestPermission(
  origin: string,
  req: AleoDAppPermissionRequest,
): Promise<
  AleoDAppPermissionResponse | PendingResponse<AleoDAppPermissionResponse>
> {
  const network = req?.network
  if (
    ![isAllowedNetwork(network), typeof req?.appMeta?.name === 'string'].every(
      Boolean,
    )
  ) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }
  const currentAccount = await getCurrentAccount()
  const currentAccountPubKey = currentAccount?.publicKey
  const dApp = currentAccountPubKey
    ? await getDApp(origin, currentAccountPubKey)
    : undefined

  if (
    !req.force &&
    dApp &&
    network === dApp.network &&
    req.appMeta.name === dApp.appMeta.name
  ) {
    return {
      type: AleoDAppMessageType.PermissionResponse,
      network: network,
      publicKey: dApp.publicKey,
      decryptPermission: dApp.decryptPermission,
      programs: dApp.programs,
    }
  }

  const onConfirm = async () => {
    await setDApp(origin, {
      network,
      appMeta: { name: origin },
      publicKey: currentAccountPubKey,
      decryptPermission: req.decryptPermission || DecryptPermission.NoDecrypt,
      programs: req.programs,
    } as AleoDAppSession)

    return {
      type: AleoDAppMessageType.PermissionResponse,
      network: network,
      publicKey: currentAccountPubKey,
      decryptPermission: req.decryptPermission,
      programs: req.programs,
    } as AleoDAppPermissionResponse
  }

  return {
    type: 'pending_response',
    onConfirm,
  }
}

export async function requestDisconnect(
  origin: string,
): Promise<AleoDAppDisconnectResponse> {
  const currentAccount = await getCurrentAccount()
  const currentAccountPubKey = currentAccount?.publicKey

  if (currentAccountPubKey) {
    const dApp = currentAccountPubKey
      ? await getDApp(origin, currentAccountPubKey)
      : undefined
    if (dApp) {
      await removeDApp(origin, currentAccountPubKey)
      return {
        type: AleoDAppMessageType.DisconnectResponse,
      }
    }
  }
  throw new Error(AleoDAppErrorType.NotFound)
}

export async function requestSign(
  origin: string,
  req: AleoDAppSignRequest,
): Promise<PendingResponse<AleoDAppSignResponse>> {
  if (!req?.sourcePublicKey) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  const onConfirm = async () => {
    const signature = await withUnlocked(async ({ vault }) => {
      const signature = await vault.sign(req.sourcePublicKey!, req.payload)
      return signature
    })
    return {
      type: AleoDAppMessageType.SignResponse,
      signature,
    } as AleoDAppSignResponse
  }

  return {
    type: 'pending_response',
    onConfirm,
  } as PendingResponse<AleoDAppSignResponse>
}

export async function requestDecrypt(
  origin: string,
  req: AleoDAppDecryptRequest,
): Promise<AleoDAppDecryptResponse | PendingResponse<AleoDAppDecryptResponse>> {
  if (!req?.sourcePublicKey || !req?.cipherText) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  if (
    !req.cipherText.startsWith('ciphertext') &&
    !req.cipherText.startsWith('record')
  ) {
    throw new Error(
      `${AleoDAppErrorType.InvalidParams}: ciphertext must start with 'ciphertext' or 'record'`,
    )
  }

  if (req.cipherText.startsWith('ciphertext')) {
    if (
      !req.tpk ||
      !req.programId ||
      !req.functionName ||
      req.index === undefined
    ) {
      throw new Error(
        `${AleoDAppErrorType.InvalidParams}: Must include tpk, programId, functionName, and index`,
      )
    }
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  // Check if the decrypt permission is not in the whitelist
  if (!dApp || !VALID_DECRYPT_PERMISSIONS.includes(dApp.decryptPermission)) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  const plainText = await withUnlocked(async ({ vault }) => {
    const decrypted = await vault.decryptCipherTextOrRecord(
      req.sourcePublicKey!,
      req.cipherText,
      req.tpk,
      req.programId,
      req.functionName,
      req.index,
    )
    return decrypted
  })

  if (
    dApp.decryptPermission === DecryptPermission.AutoDecrypt ||
    dApp.decryptPermission === DecryptPermission.OnChainHistory
  ) {
    return {
      type: AleoDAppMessageType.DecryptResponse,
      plainText,
    }
  } else {
    return {
      type: 'pending_response',
      onConfirm: async () => {
        return {
          type: AleoDAppMessageType.DecryptResponse,
          plainText,
        }
      },
      renderData: {
        plainText,
        cipherText: req.cipherText,
      },
    }
  }
}

export async function requestRecords(
  origin: string,
  req: AleoDAppRecordsRequest,
): Promise<AleoDAppRecordsResponse | PendingResponse<AleoDAppRecordsResponse>> {
  if (!req?.sourcePublicKey || !req?.program) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  const network = await getCurrentAleoNetwork()

  const dAppRecords = await fetchDAppRecordsForProgram(
    network.id,
    req.sourcePublicKey,
    req.program,
    dApp.decryptPermission === DecryptPermission.OnChainHistory,
  )

  if (
    dApp.decryptPermission === DecryptPermission.OnChainHistory ||
    dApp.decryptPermission === DecryptPermission.AutoDecrypt
  ) {
    return {
      type: AleoDAppMessageType.RecordsResponse,
      records: dAppRecords,
    }
  } else {
    return {
      type: 'pending_response',
      onConfirm: async () => {
        return {
          type: AleoDAppMessageType.RecordsResponse,
          records: dAppRecords,
        }
      },
      renderData: {
        records: dAppRecords,
        program: req.program,
      },
    }
  }
}

export async function getRecordPlaintexts(
  origin: string,
  req: AleoDAppRecordPlaintextsRequest,
): Promise<AleoDAppRecordPlaintextsResponse> {
  const currentNetwork = await getCurrentAleoNetwork()

  if (!req?.sourcePublicKey || !req?.program) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp || dApp.decryptPermission !== DecryptPermission.OnChainHistory) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  if (dApp.programs && !dApp.programs.includes(req.program)) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dAppRecords = await fetchDAppRecordsForProgram(
    currentNetwork.id,
    req.sourcePublicKey,
    req.program,
    dApp.decryptPermission === DecryptPermission.OnChainHistory,
  )

  return {
    type: AleoDAppMessageType.RecordPlaintextsResponse,
    records: dAppRecords,
  }
}

export async function requestTransaction(
  origin: string,
  req: AleoDAppTransactionRequest,
): Promise<PendingResponse<AleoDAppTransactionResponse>> {
  if (!req?.sourcePublicKey || !req?.transaction) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  const currentChainId = (await getCurrentAleoNetwork()).id
  if (req.transaction.chainId !== currentChainId) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const currentAccount = await getCurrentAccount()
  const { transitions, transaction } =
    await convertDAppTransactionIntoTransaction(
      req.transaction,
      currentAccount.viewKey,
      req.transaction.fee,
      req.transaction.feePrivate,
      true,
      false,
    )
  const authJson = await authorizeTransaction(
    currentAccount.privateKey!,
    transitions[0].program,
    transitions[0].functionName,
    JSON.parse(transitions[0].inputsJson),
    req.transaction.fee / 10 ** ALEO_DECIMALS,
    req.transaction.feePrivate
      ? JSON.parse(transitions[1].inputsJson)[0]
      : undefined,
    JSON.stringify(transaction.imports),
  )

  const auth = parseAuthorization(authJson)

  transaction.authorization = auth.authorization
  transaction.feeAuthorization = auth.fee_authorization
  transitions[0].transitionId = JSON.parse(auth.authorization).transitions[0].id
  transitions[1].transitionId = JSON.parse(
    auth.fee_authorization,
  ).transitions[0].id

  const transactionMessages = await formatDAppDisplayMessages([transitions[0]])

  const onConfirm = async () => {
    const transactionId = await createTransaction(
      transaction,
      transitions,
      true,
    ) // TODO: update delegate setting from the Settings

    return {
      type: AleoDAppMessageType.TransactionResponse,
      transactionId,
    } as AleoDAppTransactionResponse
  }

  const programName = await programToId(transitions[0].program)
  const feeVisibility = req.transaction.feePrivate ? 'Private' : 'Public'
  return {
    type: 'pending_response',
    onConfirm,
    renderData: {
      programMessage: `Execute ${transitions[0].functionName} on ${programName}`,
      transactionMessages,
      fee: `${feeVisibility} Fee: ${formatBigInt(transaction.fee)} ALEO`,
    },
  } as PendingResponse<AleoDAppTransactionResponse>
}

export async function requestTransactionStatus(
  origin: string,
  req: AleoDAppTransactionStatusRequest,
): Promise<AleoDAppTransactionStatusResponse> {
  if (!req?.sourcePublicKey || !req?.transactionId) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  const transactionStatus = await getTransactionStatus(req.transactionId)
  if (transactionStatus === null) {
    throw new Error('Transaction not found')
  }

  return {
    type: AleoDAppMessageType.TransactionStatusResponse,
    status: formatTransactionStatus(transactionStatus),
  }
}

export async function getTransactionHistory(
  origin: string,
  req: AleoDAppTransactionHistoryRequest,
): Promise<AleoDAppTransactionHistoryResponse> {
  const currentChainId = (await getCurrentAleoNetwork()).id

  if (!req?.sourcePublicKey || !req?.program) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const dApp = await getDApp(origin, req.sourcePublicKey)

  if (!dApp || dApp.decryptPermission !== DecryptPermission.OnChainHistory) {
    throw new Error(AleoDAppErrorType.NotGranted)
  }

  if (req.sourcePublicKey !== dApp.publicKey) {
    throw new Error(AleoDAppErrorType.NotFound)
  }

  if (dApp.programs && !dApp.programs.includes(req.program)) {
    throw new Error(AleoDAppErrorType.InvalidParams)
  }

  const transactions = await getCompletedAndFinalizedTransactions(
    req.sourcePublicKey,
    currentChainId!,
    req.program,
  )
  const formattedTransactions = transactions.map(tx => {
    return {
      id: tx.id,
      transactionId: tx.transactionId,
    }
  })

  return {
    type: AleoDAppMessageType.TransactionHistoryResponse,
    transactions: formattedTransactions,
  }
}

export async function getAllDApps() {
  const dAppsSessions: AleoDAppSessions = (await getData(STORAGE_KEY)) || {}
  return dAppsSessions
}

export async function getDApp(
  origin: string,
  publicKey: string,
): Promise<AleoDAppSession | undefined> {
  const sessions = (await getAllDApps())[origin] || []
  return sessions.find(session => session.publicKey === publicKey)
}

export async function setDApp(
  origin: string,
  permissions: AleoDAppSession,
): Promise<AleoDAppSessions> {
  const current = await getAllDApps()
  const currentDAppSessions = current[origin] || []
  const currentDAppSessionIdx = currentDAppSessions.findIndex(
    session => session.publicKey === permissions.publicKey,
  )
  if (currentDAppSessionIdx >= 0) {
    currentDAppSessions[currentDAppSessionIdx] = permissions
  } else {
    currentDAppSessions.push(permissions)
  }

  const newDApps = { ...current, [origin]: currentDAppSessions }
  await setDApps(newDApps)
  return newDApps
}

export async function removeDApp(origin: string, publicKey: string) {
  const { [origin]: permissionsToRemove, ...restDApps } = await getAllDApps()
  const newPermissions = permissionsToRemove.filter(
    session => session.publicKey !== publicKey,
  )
  await setDApps({ ...restDApps, [origin]: newPermissions })
  return restDApps
}

export function cleanDApps() {
  return setDApps({})
}

function setDApps(newDApps: AleoDAppSessions) {
  return setData(STORAGE_KEY, newDApps)
}

export async function getNetworkRPC(net: WalletAdapterNetwork) {
  const targetRpc = NETWORKS.find(n => n.id === net.toString())!.rpcBaseURL

  if (typeof net === 'string') {
    try {
      const current = await getCurrentAleoNetwork()
      const [currentChainId, targetChainId] = await Promise.all([
        fetchChainId(current.rpcBaseURL),
        fetchChainId(targetRpc),
      ])

      return targetChainId === null || currentChainId === targetChainId
        ? current.rpcBaseURL
        : targetRpc
    } catch {
      return targetRpc
    }
  } else {
    return targetRpc
  }
}

function getCurrentAccount() {
  return withUnlocked(async ({ vault }) => {
    const currentAccount = await vault.getCurrentAccount()
    return currentAccount
  })
}

async function getCurrentAleoNetwork(): Promise<AleoNetwork> {
  const networkId = await getData('network_id')
  const customNetworksSnapshot = await getData('custom_networks_snapshot')

  return (
    [...NETWORKS, ...(customNetworksSnapshot ?? [])].find(
      n => n.id === networkId,
    ) ?? NETWORKS[0]
  )
}

function isAllowedNetwork(net: WalletAdapterNetwork) {
  return NETWORKS.some(n => !n.disabled && n.id === net)
}
