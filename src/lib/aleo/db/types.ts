import uuid from 'react-native-uuid'

const RECORD_NAMESPACE = '2677c729-bccd-48b6-a410-edea2fc5dd11'

export interface IDappRecord {
  id: string
  owner: string
  program_id: string
  microcredits?: string
  spent: boolean
  data: any
}

export interface IOwnedRecord {
  id: string
  chainId: string
  address: string
  transitionId: string
  outputIndex: number
  synced: boolean
}

export class OwnedRecord implements IOwnedRecord {
  id: string
  address: string
  chainId: string
  transitionId: string
  outputIndex: number
  synced: boolean

  constructor(
    address: string,
    chainId: string,
    transition_id: string,
    output_index: number,
    synced: boolean,
  ) {
    this.id = uuid
      .v5(
        `${address}-${chainId}-${transition_id}-${output_index}`,
        RECORD_NAMESPACE,
      )
      .toString()
    this.address = address
    this.chainId = chainId
    this.transitionId = transition_id
    this.outputIndex = output_index
    this.synced = synced
  }
}

export interface IRecord {
  id: string
  chainId: string
  address: string
  microcredits?: bigint
  blockHeightCreated: bigint
  blockIdCreated: bigint
  // represented as a bigint on-chain, but stored as a string to be indexed by dexie
  timestampCreated: number
  serialNumber: string
  ciphertext: string
  programId: string
  blockHeightSpent: bigint
  blockIdSpent: bigint
  // Representing on chain values
  blockHash: string
  transactionId: string
  transitionId: string
  transactionIdSpent?: string
  transitionIdSpent?: string
  // represented as a bigint on-chain, but stored as a string to be indexed by dexie
  timestampSpent: number
  // stored as 0 (unspent) or 1 (spent) because Dexie cannot index booleans
  spent: number
  locked: number
  locallySyncedTransactions: number

  // Used to figure out the name of the record
  outputIndex: number
  functionName: string
}

// implementation class to give records default values
export class Record implements IRecord {
  id: string
  chainId: string
  address: string
  microcredits?: bigint
  blockHeightCreated: bigint
  blockIdCreated: bigint
  timestampCreated: number
  serialNumber: string
  ciphertext: string
  programId: string
  blockHeightSpent: bigint
  blockIdSpent: bigint
  timestampSpent: number
  blockHash: string
  transactionId: string
  transitionId: string
  spent: number
  locked: number
  locallySyncedTransactions: number
  outputIndex: number
  functionName: string

  constructor(
    chainId: string,
    blockHeightCreated: bigint,
    blockIdCreated: bigint,
    timestampCreated: number,
    ciphertext: string,
    programId: string,
    blockHash: string,
    transactionId: string,
    transitionId: string,
    outputIndex: number,
    functionName: string,
  ) {
    this.id = uuid.v5(`${ciphertext}-${chainId}`, RECORD_NAMESPACE).toString()
    this.chainId = chainId
    this.address = ''
    this.microcredits = BigInt(0)
    this.blockHeightCreated = blockHeightCreated
    this.blockIdCreated = blockIdCreated
    this.timestampCreated = timestampCreated
    this.serialNumber = ''
    this.ciphertext = ciphertext
    this.programId = programId
    this.blockHeightSpent = BigInt(-1)
    this.blockIdSpent = BigInt(-1)
    this.timestampSpent = -1
    this.blockHash = blockHash
    this.transactionId = transactionId
    this.transitionId = transitionId
    this.spent = 0
    this.locked = 0
    this.locallySyncedTransactions = 0
    this.outputIndex = outputIndex
    this.functionName = functionName
  }
}

export interface IRecordSync {
  chainId: string
  address: string
  startBlock: number
  endBlock: number
  page: number
  rangeComplete: boolean
}

export interface IDBRecordSync extends IRecordSync {
  id: number
}

export interface IPublicSync {
  chainId: string
  address: string
  startBlock: number
  endBlock: number
  page: number
  rangeComplete: boolean
}

export interface IDBPublicSync extends IPublicSync {
  id: number
}

export interface ISerialNumberSync {
  chainId: string
  page: number
}

export interface IDBSerialNumberSync extends ISerialNumberSync {
  id: number
}

export interface ISerialNumber {
  chainId: string
  serial_number: string
  program_id: string
  block_id: bigint
  height: bigint
  transaction_id: string
  transition_id: string
  timestamp_spent: string
}

export interface IAccountCreationBlockHeight {
  chainId: string
  address: string
  blockHeight: number
}

export enum ITokenType {
  Fungible,
  Collectible,
}

export enum ITokenStatus {
  Idle,
  Enabled,
  Disabled,
  Removed,
}

export interface IAccountToken {
  type: ITokenType
  chainId: string
  account: string
  tokenSlug: string
  status: ITokenStatus
  addedAt: number
  latestBalance?: string
  latestUSDBalance?: string
}

export type FileSourceType = 'native' | 'dapp' | 'uploaded'

export interface IKeyFile {
  name: string
  bytes: Uint8Array
  sourceType: FileSourceType
  lastUsed: number
  url?: string
  functionName?: string
}
