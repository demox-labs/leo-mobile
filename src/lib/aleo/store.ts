import { createStore, createEvent } from 'effector'

import { Vault } from './vault'
import { NETWORKS } from './networks'
import {
  AleoState,
  AleoStatus,
  AleoAccount,
  AleoSettings,
  AleoAccountType,
} from './types'

/**
 * Types
 */
export interface StoreState extends AleoState {
  inited: boolean
  vault: Vault | null
}

export interface UnlockedStoreState extends StoreState {
  vault: Vault
}

/**
 * Events
 */
export const inited = createEvent<boolean>('Inited')

export const unlocked = createEvent<{
  vault: Vault
  accounts: AleoAccount[]
  settings: AleoSettings
  currentAccount: AleoAccount
  ownMnemonic: boolean
}>('Unlocked')

export const locked = createEvent('Locked')

export const accountsUpdated = createEvent<{
  accounts: AleoAccount[]
  currentAccount?: AleoAccount
}>('Accounts updated')

export const currentAccountUpdated = createEvent<AleoAccount>(
  'Current Account Updated',
)

export const settingsUpdated = createEvent<AleoSettings>('Settings updated')

const undeterminedStoreState: StoreState = {
  inited: false,
  vault: null,
  status: AleoStatus.Undetermined,
  accounts: [],
  networks: [],
  settings: {},
  currentAccount: {
    name: 'Watch only',
    publicKey: '',
    viewKey: '',
    type: AleoAccountType.WatchOnly,
    chainId: '0',
  },
  ownMnemonic: null,
}

const lockedStoreState: StoreState = {
  inited: true,
  vault: null,
  status: AleoStatus.Locked,
  networks: NETWORKS,
  settings: {},
  currentAccount: {
    name: 'Watch only',
    publicKey: '',
    viewKey: '',
    type: AleoAccountType.WatchOnly,
    chainId: '0',
  },
  accounts: [],
  ownMnemonic: null,
}

/**
 * Store
 */
export const store = createStore<StoreState>(undeterminedStoreState)
  .on(inited, (state, vaultExist) => ({
    ...state,
    inited: true,
    status: vaultExist ? AleoStatus.Locked : AleoStatus.Idle,
    networks: NETWORKS,
  }))
  .on(
    unlocked,
    (state, { vault, accounts, settings, currentAccount, ownMnemonic }) => ({
      ...state,
      vault,
      status: AleoStatus.Ready,
      accounts,
      settings,
      currentAccount,
      ownMnemonic,
    }),
  )
  // Attention!
  // Security stuff!
  // Don't merge new state to existing!
  // Build a new state from scratch
  // Reset all properties!
  .on(locked, () => lockedStoreState)
  .on(accountsUpdated, (state, { accounts, currentAccount }) => ({
    ...state,
    accounts,
    currentAccount: currentAccount || state.currentAccount,
  }))
  .on(currentAccountUpdated, (state, currentAccount) => ({
    ...state,
    currentAccount,
  }))
  .on(settingsUpdated, (state, settings) => ({
    ...state,
    settings,
  }))

/**
 * Helpers
 */
export function toFront({
  status,
  accounts,
  networks,
  settings,
  currentAccount,
  ownMnemonic,
}: StoreState): AleoState {
  return {
    status,
    accounts,
    networks,
    settings,
    currentAccount,
    ownMnemonic,
  }
}

export function withUnlocked<T>(factory: (state: UnlockedStoreState) => T) {
  const state = store.getState()
  assertUnlocked(state)
  return factory(state)
}

export function withInited<T>(factory: (state: StoreState) => T) {
  const state = store.getState()
  assertInited(state)
  return factory(state)
}

export function assertUnlocked(
  state: StoreState,
): asserts state is UnlockedStoreState {
  assertInited(state)
  if (state.status !== AleoStatus.Ready) {
    throw new Error('Not ready')
  }
}

export function assertInited(state: StoreState) {
  if (!state.inited) {
    throw new Error('Not initialized')
  }
}
