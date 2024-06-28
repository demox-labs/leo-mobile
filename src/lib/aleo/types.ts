import {
  DecryptPermission,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base'
import { AleoDAppMetadata } from 'leo-wallet-window/src'

export enum AleoChainId {
  Testnet3 = 'testnet3',
  TestnetBeta = 'testnetbeta',
  Localnet = 'localnet',
}

export interface AleoDAppSession {
  network: WalletAdapterNetwork
  appMeta: AleoDAppMetadata
  publicKey: string
  decryptPermission: DecryptPermission
  programs?: string[]
}

export interface AleoState {
  status: AleoStatus
  accounts: AleoAccount[]
  networks: AleoNetwork[]
  settings: AleoSettings
  currentAccount: AleoAccount
  ownMnemonic: boolean | null
}

type NonEmptyArray<T> = [T, ...T[]]

export interface ReadyAleoState extends AleoState {
  status: AleoStatus.Ready
  accounts: NonEmptyArray<AleoAccount>
  networks: NonEmptyArray<AleoNetwork>
  settings: AleoSettings
  currentAccount: AleoAccount
}

export interface AleoSettings {
  customNetworks?: AleoNetwork[]
  contacts?: AleoContact[]
}

export interface AleoContact {
  address: string
  name: string
  addedAt?: number
  accountInWallet?: boolean
}

export enum AleoStatus {
  Undetermined,
  Idle,
  Locked,
  Ready,
}

export interface AleoNetwork {
  id: string
  name: string
  nameI18nKey?: string
  description: string
  descriptionI18nKey?: string
  type: AleoNetworkType
  rpcBaseURL: string
  color: string
  disabled: boolean
  autoSync: boolean
  hidden?: boolean
  hasFaucet: boolean
  ansURL?: string
}

export type AleoNetworkType = 'main' | 'test' | 'dcp'

export interface AleoSettings {
  customNetworks?: AleoNetwork[]
  contacts?: AleoContact[]
}

export type AleoDAppSessions = Record<string, AleoDAppSession[]>

export interface AleoContact {
  address: string
  name: string
  addedAt?: number
  accountInWallet?: boolean
}

export type AleoAccount =
  | AleoHDAccount
  | AleoImportedAccount
  | AleoLedgerAccount
  | AleoManagedKTAccount
  | AleoWatchOnlyAccount

export enum DerivationType {
  ED25519 = 0,
  SECP256K1 = 1,
  P256 = 2,
}

export interface AleoLedgerAccount extends AleoAccountBase {
  type: AleoAccountType.Ledger
  derivationPath: string
}

export interface AleoImportedAccount extends AleoAccountBase {
  type: AleoAccountType.Imported
}

export interface AleoHDAccount extends AleoAccountBase {
  type: AleoAccountType.HD
  hdIndex: number
}

export interface AleoManagedKTAccount extends AleoAccountBase {
  type: AleoAccountType.ManagedKT
  chainId: string
  owner: string
}

export interface AleoWatchOnlyAccount extends AleoAccountBase {
  type: AleoAccountType.WatchOnly
  chainId?: string
}

export interface AleoAccountBase {
  type: AleoAccountType
  name: string
  publicKey: string
  viewKey: string
  privateKey?: string
  hdIndex?: number
  derivationPath?: string
  derivationType?: DerivationType
}

export interface AleoHDAccount extends AleoAccountBase {
  type: AleoAccountType.HD
  hdIndex: number
}

export interface AleoImportedAccount extends AleoAccountBase {
  type: AleoAccountType.Imported
}

export interface AleoWatchOnlyAccount extends AleoAccountBase {
  type: AleoAccountType.WatchOnly
  chainId?: string
}

export interface AleoManagedKTAccount extends AleoAccountBase {
  type: AleoAccountType.ManagedKT
  chainId: string
  owner: string
}

export enum AleoAccountType {
  HD,
  Imported,
  Ledger,
  ManagedKT,
  WatchOnly,
}

export interface Keys {
  privateKey: string
  viewKey: string
}
