import constate from 'constate'
import { useAleoClient } from './client'
import { AleoAccountType, AleoContact } from './types'
import { useEffect, useMemo } from 'react'
import { usePassiveStorage } from '@src/utils/storage'

export const [
  ReadyAleoProvider,
  useAllNetworks,
  setNetworkId,
  useNetwork,
  useAllAccounts,
  useAccount,
  useSettings,
  useOwnMnemonic,
] = constate(
  useReadyAleo,
  v => v.allNetworks,
  v => v.setNetworkId,
  v => v.network,
  v => v.allAccounts,
  v => v.account,
  v => v.settings,
  v => v.ownMnemonic,
)

function useReadyAleo() {
  const { data } = useAleoClient()

  const {
    networks: allNetworks,
    accounts: allAccounts,
    settings,
    currentAccount: account,
    ownMnemonic,
  } = data

  const accountPk = account?.publicKey

  /**
   * Networks
   */

  const defaultNet = allNetworks.length > 0 ? allNetworks[0] : { id: '0' }
  const [networkId, setNetworkId] = usePassiveStorage(
    'network_id',
    defaultNet.id,
  )

  useEffect(() => {
    if (allNetworks.every(a => a.id !== networkId)) {
      setNetworkId(defaultNet.id)
    }
  }, [allNetworks, networkId, setNetworkId, defaultNet])

  const network = useMemo(
    () => allNetworks.find(n => n.id === networkId) ?? defaultNet,
    [allNetworks, networkId, defaultNet],
  )

  return {
    allNetworks,
    setNetworkId,
    network,
    allAccounts,
    account,
    accountPk,
    settings,
    ownMnemonic,
  }
}

export function useChainId() {
  return useNetwork().id
}

export function useRelevantAccounts(withExtraTypes = true) {
  const allAccounts = useAllAccounts()
  const account = useAccount()
  const { updateCurrentAccount } = useAleoClient()

  const relevantAccounts = useMemo(
    () =>
      allAccounts.filter(acc => {
        switch (acc.type) {
          case AleoAccountType.ManagedKT:
            return withExtraTypes

          case AleoAccountType.WatchOnly:
            return withExtraTypes

          default:
            return true
        }
      }),
    [allAccounts, withExtraTypes],
  )

  useEffect(() => {
    if (relevantAccounts.every(a => a.publicKey !== account?.publicKey)) {
      updateCurrentAccount(relevantAccounts[0].publicKey)
    }
  }, [relevantAccounts, account, updateCurrentAccount])

  return useMemo(() => relevantAccounts, [relevantAccounts])
}

export function useFilteredContacts() {
  const { updateSettings } = useAleoClient()
  const settings = useSettings()
  const accounts = useRelevantAccounts()

  const settingContacts = useMemo(
    () => settings?.contacts ?? [],
    [settings?.contacts],
  )
  const accountContacts = useMemo<AleoContact[]>(
    () =>
      accounts.map(acc => ({
        address: acc.publicKey,
        name: acc.name,
        accountInWallet: true,
      })),
    [accounts],
  )

  const allContacts = useMemo(() => {
    const filteredSettingContacts = settingContacts.filter(
      contact =>
        !accountContacts.some(
          intersection => contact.address === intersection.address,
        ),
    )

    if (filteredSettingContacts.length !== settingContacts.length) {
      updateSettings({ contacts: filteredSettingContacts })
    }

    return [...filteredSettingContacts, ...accountContacts]
  }, [settingContacts, accountContacts, updateSettings])

  return { contacts: settingContacts, allContacts }
}
