/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import constate from 'constate'
import { useCallback, useEffect, useState } from 'react'
import { Vault } from './vault'
import {
  accountsUpdated,
  currentAccountUpdated,
  inited,
  locked,
  settingsUpdated,
  store,
  toFront,
  unlocked,
  withInited,
  withUnlocked,
} from './store'
import { createQueue } from '../queue'
import { AleoAccountType, AleoSettings, AleoState, AleoStatus } from './types'
import { retryWithTimeout } from '../utility/retry'
import { AutoSync } from './autosync'
import { setData } from '@src/utils/storage'
import { storeUserPassword } from './safe-storage'

const ACCOUNT_NAME_PATTERN = /^.{0,16}$/

const enqueueUnlock = createQueue()
const frontStore = store.map(toFront)

export type ChainApiStatus = 'up' | 'warning' | 'down' | 'unknown'

// Initializes the vault and app store state
export async function init() {
  const vaultExist = await Vault.isExist()
  inited(vaultExist)
}

// Retrieves state from the store and prepares it for
// consumption in the front end
export async function getFrontState(): Promise<AleoState> {
  const state = store.getState()
  if (state.inited) {
    return toFront(state)
  } else {
    await new Promise(r => setTimeout(r, 10))
    return getFrontState()
  }
}

type PriceData = {
  ALEO: number
  USDT: number
  USDC: number
  BTC: number
  ETH: number
}
export async function getPrices(): Promise<PriceData> {
  try {
    const response = await fetch('https://testnetbeta.aleorpc.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getPrices',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`)
    }

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error('Error fetching prices:', error)
    throw error
  }
}

async function fetchStateAsync(maxRetries: number = 0): Promise<AleoState> {
  const state = await retryWithTimeout(
    async () => {
      return await getFrontState()
    },
    3_000,
    maxRetries,
  )

  return state
}

// Custom hook to fetch data for the AleoClientProvider from the store
const useCustomDataFetch = () => {
  const [data, setData] = useState<AleoState>({
    networks: [],
    accounts: [],
    settings: {},
    ownMnemonic: null,
    status: AleoStatus.Undetermined,
    currentAccount: {
      name: 'Watch only',
      publicKey: '',
      viewKey: '',
      type: AleoAccountType.WatchOnly,
      chainId: '0',
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [prices, setPrices] = useState<PriceData | undefined>(undefined)

  // Function to fetch the data
  const fetch = async () => {
    try {
      setLoading(true)
      const result = await fetchStateAsync()
      setData(result)
      setError(null)

      const prices = await getPrices()

      setPrices(prices)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    fetch()
  }, []) // Empty dependency array ensures this runs once on mount

  // Function to allow manual refetching from components
  const refetch = useCallback(() => {
    fetch()
  }, [])

  // Computed 'ready' property
  const ready = useMemo(() => {
    return data !== null && data.status === AleoStatus.Ready
  }, [data])

  return { data, loading, error, refetch, ready, prices }
}

export const [AleoClientProvider, useAleoClient] = constate(() => {
  const { data, loading, error, refetch, ready, prices } = useCustomDataFetch()
  const [chainStatus, setChainStatus] = useState<ChainApiStatus>('unknown')

  useEffect(() => {
    // Fetch chain status every minute
    const fetchChainStatus = async () => {
      try {
        const response = await fetch(
          'https://testnetbeta.aleorpc.com/blockHeightIsCurrent',
        )
        setChainStatus(response.ok ? 'up' : 'down')
      } catch (error) {
        console.log('Failed to get status:', error)
      }
    }

    const statusInterval = setInterval(fetchChainStatus, 5 * 1000)

    fetchChainStatus()

    return () => {
      clearInterval(statusInterval)
    }
  }, [])

  // Subscribe to store updates and refetch data when the store changes
  useEffect(() => {
    const unsubscribe = frontStore.watch(() => {
      refetch()
    })

    return () => unsubscribe() // Cleanup the watcher on unmount
  }, [refetch])

  useEffect(() => {
    if (ready) {
      AutoSync.updateState(data)
    }
  }, [data, ready])

  // Actions to be passed to the front end via the AleoClientProvider

  // Handles the registration of a new wallet by creating a new vault
  // and unlocking it
  // TODO... do we have to use useCallback here?
  const registerWallet = useCallback(
    async (password: string, mnemonic?: string, ownMnemonic?: boolean) => {
      return withInited(async () => {
        await Vault.spawn(password, mnemonic, ownMnemonic)
        await unlock(password)
      })
    },
    [],
  )

  // Handles the unlocking of an existing wallet and gives access
  // to the sensitive data stored in the vault
  const unlock = useCallback(async (password: string) => {
    return withInited(() =>
      enqueueUnlock(async () => {
        await storeUserPassword(password)
        const vault = await Vault.setup(password)
        const accounts = await vault.fetchAccounts()
        const settings = await vault.fetchSettings()
        const currentAccount = await vault.getCurrentAccount()
        const ownMnemonic = await vault.isOwnMnemonic()
        unlocked({ vault, accounts, settings, currentAccount, ownMnemonic })
      }),
    )
  }, [])

  const lock = useCallback(async () => {
    return withInited(async () => {
      locked()
    })
  }, [])

  // Handles the creation of a new account
  const createHDAccount = useCallback(async (name: string) => {
    return withUnlocked(async ({ vault }) => {
      if (name) {
        name = name.trim()
        if (!ACCOUNT_NAME_PATTERN.test(name)) {
          throw new Error(
            'Invalid name. It should be: 1-16 characters, without special',
          )
        }
      }

      const accounts = await vault.createHDAccount(name)
      accountsUpdated({ accounts })
      return accounts[accounts.length - 1]
    })
  }, [])

  // Handles the creation of a new account
  const importAccount = useCallback(async (privateKey: string) => {
    return withUnlocked(async ({ vault }) => {
      const accounts = await vault.importAccount(privateKey)
      accountsUpdated({ accounts })
      return accounts[accounts.length - 1]
    })
  }, [])

  // Handles the editing of an account name
  const editAccountName = useCallback(
    async (accPublicKey: string, name: string) => {
      return withUnlocked(async ({ vault }) => {
        name = name.trim()
        if (!ACCOUNT_NAME_PATTERN.test(name)) {
          throw new Error(
            'Invalid name. It should be: 1-16 characters, without special',
          )
        }

        const updatedAccounts = await vault.editAccountName(accPublicKey, name)
        accountsUpdated(updatedAccounts)
      })
    },
    [],
  )

  // Handles the updating of the current account
  const updateCurrentAccount = useCallback(async (accountPublicKey: string) => {
    return withUnlocked(async ({ vault }) => {
      const currentAccount = await vault.setCurrentAccount(accountPublicKey)
      currentAccountUpdated(currentAccount)
    })
  }, [])

  // Handles the removal of an account
  const removeAccount = useCallback(
    async (accountPublicKey: string, password: string) => {
      return withUnlocked(async () => {
        const accounts = await Vault.removeAccount(accountPublicKey, password)
        accountsUpdated({ accounts })
      })
    },
    [],
  )

  // Handles the revealing of the private key for an account
  const revealPrivateKey = useCallback(
    async (accountPublicKey: string, password: string) => {
      return withUnlocked(() =>
        Vault.revealPrivateKey(accountPublicKey, password),
      )
    },
    [],
  )

  // Handles the revealing of the view key for an account
  const revealViewKey = useCallback(
    async (accountPublicKey: string, password: string) => {
      return withUnlocked(() => Vault.revealViewKey(accountPublicKey, password))
    },
    [],
  )

  // Handles the revealing of the mnemonic for an account
  const revealMnemonic = useCallback(async (password: string) => {
    return withUnlocked(() => Vault.revealMnemonic(password))
  }, [])

  const updateSettings = useCallback(
    async (settings: Partial<AleoSettings>) => {
      return withUnlocked(async ({ vault }) => {
        const updatedSettings = await vault.updateSettings(settings)
        try {
          if (updatedSettings.customNetworks) {
            await setData(
              'custom_networks_snapshot',
              updatedSettings.customNetworks,
            )
          }
        } catch {
          console.log('Error saving custom networks snapshot')
        }
        settingsUpdated(updatedSettings)
      })
    },
    [],
  )

  // TODO actually use this to authorize transactions instead of directly via SDK call
  const authorizeTransaction = useCallback(
    async (
      accPublicKey: string,
      program: string,
      functionName: string,
      inputs: string[],
      feeCredits: number,
      feeRecord?: string,
      imports?: { [key: string]: string },
    ) => {
      return withUnlocked(async ({ vault }) => {
        const auth = await vault.authorize(
          accPublicKey,
          program,
          functionName,
          inputs,
          feeCredits,
          feeRecord,
          imports,
        )
        return auth
      })
    },
    [],
  )

  return {
    data,
    loading,
    error,
    ready,
    chainStatus,
    prices,
    registerWallet,
    unlock,
    lock,
    createHDAccount,
    importAccount,
    editAccountName,
    updateCurrentAccount,
    removeAccount,
    revealPrivateKey,
    revealViewKey,
    revealMnemonic,
    updateSettings,
    authorizeTransaction,
  }
})

export type AleoClient = ReturnType<typeof useAleoClient>
