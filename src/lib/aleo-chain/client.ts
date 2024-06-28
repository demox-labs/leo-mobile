import { JSONRPCClient } from 'json-rpc-2.0'

import {
  AleoTransaction,
  AleoTransactionResponse,
} from 'src/lib/aleo-chain/aleo-types'
import { ISerialNumber, Record } from 'src/lib/aleo/db/types'
import { AleoChainId } from 'src/lib/aleo/types'
import { delay } from 'src/lib/aleo/utils'
import {
  bigIntToString,
  joinBigIntsToString,
  parseStringToBigIntArray,
} from 'src/lib/util'

import {
  IEncryptedRecord,
  IIsOwnerRecordInfo,
  IPublicNFTData,
  ISerialNumberMetadata,
} from './rpc-types'
import pako from 'pako'
import { RecordInfo, RecordInfoList } from './proto/records'
import { CREDITS_PROGRAM_ID } from '../aleo/programs/credits-program'

export const ALEO_API_BASE_URLS = new Map([
  [AleoChainId.Testnet3, 'https://testnet3.aleorpc.com'],
  [AleoChainId.TestnetBeta, 'https://testnetbeta.aleorpc.com'],
  [AleoChainId.Localnet, 'http://localhost:3000'],
])

export const ALEO_REST_API_BASE_URLS = new Map([
  [AleoChainId.Testnet3, 'https://api.explorer.aleo.org/v1'],
  [AleoChainId.TestnetBeta, 'https://api.explorer.aleo.org/v1'],
  [AleoChainId.Localnet, 'http://localhost:3000'],
])

export const ALEO_EXPLORER_BASE_URL = 'https://explorer.hamp.app'
export const ALEO_EXPLORER_TRANSACTION_URL = `${ALEO_EXPLORER_BASE_URL}/transaction?id=`
export const ALEO_EXPLORER_TRANSITION_URL = `${ALEO_EXPLORER_BASE_URL}/transition?id=`
export const ALEO_EXPLORER_BLOCK_URL = `${ALEO_EXPLORER_BASE_URL}/block?h=`

export const getHeight = async (chainId: AleoChainId) => {
  const client = getClient(chainId)
  const height = await client.request('getHeight', {})
  return height
}

const formatRecords = (
  chainId: string,
  records: IEncryptedRecord[],
): Record[] => {
  const formattedRecords = records.map(record => {
    return new Record(
      chainId,
      BigInt(record.height),
      BigInt(record.block_id),
      Number(record.timestamp),
      record.record_ciphertext,
      record.program_id,
      record.block_hash,
      record.transaction_id,
      record.transition_id,
      Number(record.output_index),
      record.function_name,
    )
  })

  return formattedRecords
}

const formatSerialNumberMetadata = (
  chainId: string,
  serialNumberMetadata: ISerialNumberMetadata[],
): ISerialNumber[] => {
  const formattedSerialNumbers = serialNumberMetadata.map(sn => {
    return {
      chainId: chainId,
      serial_number: sn.serial_number,
      program_id: sn.program_id,
      block_id: BigInt(sn.block_id),
      height: BigInt(sn.height),
      transaction_id: sn.transaction_id,
      transition_id: sn.transition_id,
      timestamp_spent: sn.timestamp.toString(),
    } as ISerialNumber
  })

  return formattedSerialNumbers
}

export const getNFTProgramInfo = async (
  chainId: AleoChainId,
  programId: string,
) => {
  const client = getClient(chainId)
  const transactions = await client.request('transactionsForProgram', {
    programId,
    functionName: 'initialize_collection',
    page: 0,
    maxTransactions: 1000,
  })
  const transactionIds = transactions.map(
    (transactionId: any) => transactionId.transaction_id,
  )

  const getTransactionResponse = await getTransaction(
    chainId,
    transactionIds[0],
  )
  const transaction = getTransactionResponse.transaction as AleoTransaction
  if (transaction.type !== 'execute') {
    return {
      symbol: '',
      baseUri: '',
    }
  }

  const symbol = bigIntToString(
    BigInt(transaction.execution.transitions[0].inputs[1].value.slice(0, -4)),
  )
  let urlBigInts = parseStringToBigIntArray(
    transaction.execution.transitions[0].inputs[2].value,
  )
  let baseUri = joinBigIntsToString(urlBigInts)

  const updatedBaseUriTxs = await client.request('transactionsForProgram', {
    programId,
    functionName: 'update_base_uri',
    page: 0,
    maxTransactions: 1000,
  })

  if (updatedBaseUriTxs.length > 0) {
    const updateBaseUriResponse = await getTransaction(
      chainId,
      updatedBaseUriTxs[updatedBaseUriTxs.length - 1].transaction_id,
    )
    const updatedBaseUriTx =
      updateBaseUriResponse.transaction as AleoTransaction
    if (updatedBaseUriTx.type === 'execute') {
      urlBigInts = parseStringToBigIntArray(
        updatedBaseUriTx.execution.transitions[0].inputs[0].value,
      )
      baseUri = joinBigIntsToString(urlBigInts)
    }
  }
  return {
    symbol,
    baseUri,
  }
}

export const getProgramType = async (
  chainId: AleoChainId,
  programId: string,
) => {
  const client = getClient(chainId)
  const programInfoMap = await client.request('getProgramTypes', {
    programs: [programId],
  })
  return programInfoMap[programId] || 'untyped'
}

export const getProgramTypes = async (
  chainId: AleoChainId,
  programIds: string[],
): Promise<{ [key: string]: string }> => {
  const client = getClient(chainId)
  const programInfoMap = await client.request('getProgramTypes', {
    programs: programIds,
  })
  return programInfoMap
}

const RECORDS_PER_REQUEST = 10_000
export const getAllRecords = async (
  chainId: AleoChainId,
  startBlock: number,
  endBlock: number,
  page?: number,
): Promise<Record[]> => {
  const pageNum = page || 0
  const client = getClient(chainId)
  const records = await client.request('records/all', {
    start: startBlock,
    end: endBlock,
    page: pageNum,
    recordsPerRequest: RECORDS_PER_REQUEST,
  })

  const formattedRecords = formatRecords(chainId, records as IEncryptedRecord[])

  return formattedRecords
}

const RECORD_INFOS_PER_REQUEST = 5_000
export const getIsOwnerCheckRecordInfos = async (
  chainId: AleoChainId,
  startBlock: number,
  endBlock: number,
  page?: number,
  recordsPerRequest = RECORD_INFOS_PER_REQUEST,
): Promise<IIsOwnerRecordInfo[]> => {
  const pageNum = page || 0
  const apiUrl = ALEO_API_BASE_URLS.get(chainId)! + '/record-infos'
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'records/isOwnerProtoBuf',
      params: {
        start: startBlock,
        end: endBlock,
        page: pageNum,
        recordsPerRequest: recordsPerRequest,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`)
  }

  // Get the response as an ArrayBuffer
  const arrayBuffer = await response.arrayBuffer()

  // Decompress the data
  const decompressedData = pako.inflate(new Uint8Array(arrayBuffer))

  // Deserialize the data using Protobuf
  const recordList = RecordInfoList.decode(new Uint8Array(decompressedData))

  // Now you have access to the array of RecordInfo objects
  const recordInfos = recordList.records.map((recordInfo: RecordInfo) => {
    return {
      nonce_x: recordInfo.nonceX,
      nonce_y: recordInfo.nonceY,
      owner_x: recordInfo.ownerX,
      output_index: recordInfo.outputIndex.toString(),
      transition_id: recordInfo.transitionId,
    } as IIsOwnerRecordInfo
  })

  return recordInfos
}

export const getRecordsByTransitionAndIndex = async (
  chainId: AleoChainId,
  recordInfo: [string, number][],
): Promise<Record[]> => {
  const client = getClient(chainId)
  const records = await client.request('records/byTransitionAndIndex', {
    recordInfo: recordInfo,
  })

  const formattedRecords = formatRecords(chainId, records as IEncryptedRecord[])

  return formattedRecords
}

export const getSerialNumbers = async (
  chainId: AleoChainId,
  serialNumbers: string[],
): Promise<ISerialNumber[]> => {
  const client = getClient(chainId)
  const serialNumberMetadata = await client.request('serialNumbers', {
    serialNumbers: serialNumbers,
  })

  const formattedSerialNumbers = formatSerialNumberMetadata(
    chainId,
    serialNumberMetadata,
  )
  return formattedSerialNumbers
}

const programCache: { [key: string]: string } = {}
/**
 * @param programId program id to fetch. e.g. program.aleo
 * @param chainId
 * @returns aleo instructions for program as a single string
 */
export async function getProgram(
  programId: string,
  chainId: AleoChainId,
): Promise<string> {
  if (programCache[programId]) {
    return programCache[programId]
  }

  const client = getClient(chainId)
  const program = await client.request('program', {
    id: programId,
  })

  programCache[programId] = program

  return program
}

export interface ILog {
  level: string
  message: string
  meta: object
}

export const sendLog = async (chainId: AleoChainId, log: ILog) => {
  const apiUrl = ALEO_API_BASE_URLS.get(chainId)!
  await fetch(`${apiUrl}/log`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ ...log }),
  })
}

export const getChainStatus = async (chainId: AleoChainId) => {
  const client = getClient(chainId)
  const chainStatus = await client.request('chainStatus', {})
  return chainStatus
}

export const getClient = (chainId: AleoChainId) => {
  const apiUrl = ALEO_API_BASE_URLS.get(chainId)!
  const client = new JSONRPCClient((jsonRPCRequest: any) =>
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ ...jsonRPCRequest }),
    }).then((response: any) => {
      if (response.status === 200) {
        // Use client.receive when you received a JSON-RPC response.
        return response
          .json()
          .then((jsonRPCResponse: any) => client.receive(jsonRPCResponse))
      } else if (jsonRPCRequest.id !== undefined) {
        return Promise.reject(new Error(response.statusText))
      }
    }),
  )
  return client
}

export async function broadcastTransaction(
  chainId: AleoChainId,
  transaction: string,
) {
  const apiUrl = ALEO_API_BASE_URLS.get(chainId)!
  const broadcastUrl = `${apiUrl}/aleo/transaction/broadcast`
  const response = await fetch(broadcastUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: transaction,
  })

  if (!response.ok)
    throw new Error(`Broadcast failed with status ${response.status}`)

  const transactionId = await response.json()
  return transactionId
}

const transactionCache: { [key: string]: string } = {}

export async function getTransaction(
  chainId: AleoChainId,
  transactionId: string,
): Promise<AleoTransactionResponse> {
  const client = getClient(chainId)
  if (transactionCache[transactionId]) {
    return JSON.parse(transactionCache[transactionId])
  }
  try {
    const aleoTransaction = (await client.request('aleoTransaction', {
      id: transactionId,
    })) as AleoTransactionResponse
    if (aleoTransaction)
      transactionCache[transactionId] = JSON.stringify(aleoTransaction)
    return aleoTransaction
  } catch {
    throw new Error('Transaction not found')
  }
}

export async function getTransactionIdFromTransition(
  chainId: AleoChainId,
  transitionId: string,
): Promise<string> {
  const client = getClient(chainId)
  try {
    const aleoTxId = (await client.request('getTransactionId', {
      transition_id: transitionId,
    })) as string
    return aleoTxId
  } catch {
    throw new Error('Transaction not found')
  }
}

export async function getMappingValue(
  chainId: AleoChainId,
  mappingKey: string,
  programId: string = 'credits.aleo',
  mappingName: string = 'account',
): Promise<string> {
  const client = getClient(chainId)
  const response = (await client.request('getMappingValue', {
    program_id: programId,
    mapping_name: mappingName,
    key: mappingKey,
  })) as string

  return response
}

export async function getPublicBalance(
  chainId: AleoChainId,
  publicKey: string,
  programId: string = CREDITS_PROGRAM_ID,
): Promise<bigint> {
  // Attempt to get the balance using the mapping value first
  try {
    const balanceString = await getMappingValue(
      chainId,
      publicKey,
      programId,
      'account',
    )
    return parseBalanceString(balanceString)
  } catch (error) {
    console.error(
      'Error getting balance from getMappingValue, trying direct API call',
      error,
    )
  }

  // Fallback to direct API call if the above method fails
  const apiUrl = ALEO_REST_API_BASE_URLS.get(chainId)!
  try {
    const response = await fetch(
      `${apiUrl}/testnet/program/${programId}/mapping/account/${publicKey}`,
    )
    if (response.ok) {
      const balanceString = await response.json()
      return parseBalanceString(balanceString)
    }
  } catch (error) {
    // console.error('Error getting balance from direct API call', error)
  }

  // Return 0 if both methods fail
  return BigInt(0)
}

function parseBalanceString(balanceString: string): bigint {
  try {
    // Assuming the balance string format needs parsing similar to the original approach
    return BigInt(balanceString.slice(0, -3))
  } catch (e: any) {
    return BigInt(0)
  }
}

export const getPublicNfts = async (
  chainId: AleoChainId,
  address: string,
): Promise<IPublicNFTData[]> => {
  const client = getClient(chainId)
  try {
    const publicNfts: IPublicNFTData[] = await client.request(
      'getPublicNFTsForAddress',
      { address: address },
    )
    return publicNfts
  } catch (e: any) {
    return []
  }
}

export const getProvingFileS3Url = async (
  chainId: AleoChainId,
  fileName: string,
): Promise<string> => {
  const client = getClient(chainId)
  try {
    const s3Url: string = await client.request('getProvingFileUrl', {
      fileName: fileName,
    })
    return s3Url
  } catch (e: any) {
    console.log(`Error fetching proving file url for ${fileName}: ${e}`)
    return ''
  }
}

export const MAX_TX_PER_REQUEST = 100_000
export const getPublicTransactionsForAddress = async (
  chainId: AleoChainId,
  address: string,
  start: number,
  end: number,
  page: number = 0,
): Promise<string[]> => {
  const client = getClient(chainId)
  try {
    const publicTransactions = await client.request(
      'getPublicTransactionsForAddress',
      {
        address,
        start,
        end,
        page,
        transactionsPerRequest: MAX_TX_PER_REQUEST,
      },
    )
    return publicTransactions.map((tx: any) => tx.transaction_id)
  } catch (e: any) {
    console.log(
      `Error fetching public transactions for ${address}, ${chainId}, ${start}, ${end}, ${page}: ${e}`,
    )
    return []
  }
}

export const delegateTransaction = async (
  chainId: AleoChainId,
  authorization: string,
  program: string,
  functionName: string,
  feeAuthorization?: string,
  broadcast: boolean = false,
  imports = {},
): Promise<string> => {
  const client = getClient(chainId)
  try {
    const requestId = await client.request('generateTransaction', {
      authorization,
      program,
      fee_authorization: feeAuthorization,
      function: functionName,
      broadcast,
      imports,
    })

    return requestId
  } catch (e: any) {
    console.log(`Error delegating transaction: ${e}`)
    throw new Error('Error delegating transaction')
  }
}

type GeneratedTransactionResponse = {
  transaction: string
  status: string
  error: string
  updated_at: string
}

export const getDelegatedTransaction = async (
  chainId: AleoChainId,
  requestId: string,
): Promise<GeneratedTransactionResponse> => {
  const client = getClient(chainId)
  try {
    const transaction = (await client.request('getGeneratedTransaction', {
      request_id: requestId,
    })) as GeneratedTransactionResponse
    return transaction
  } catch {
    throw new Error('Transaction not found')
  }
}

export const pollDelegatedTransaction = async (
  chainId: AleoChainId,
  requestId: string,
  retryTime: number = 1000,
): Promise<GeneratedTransactionResponse> => {
  const transaction = await getDelegatedTransaction(chainId, requestId)
  if (transaction.status === 'Failed' || transaction.status === 'Completed') {
    return transaction
  }
  await delay(retryTime)
  return await pollDelegatedTransaction(chainId, requestId)
}
