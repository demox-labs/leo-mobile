import React, { useMemo, useState } from 'react'
import RemoveAccountScreen from '@src/screens/settings/remove-account'

import { useAleoClient } from '@src/lib/aleo/client'
import { useAccount, useRelevantAccounts } from '@src/lib/aleo/ready'
import { useRouter } from 'expo-router'
import { resyncAccount } from '@src/lib/aleo/activity/sync/sync'

const SettingsRemoveAccount = () => {
  const router = useRouter()
  const account = useAccount()
  const allAccounts = useRelevantAccounts()
  const { removeAccount, updateCurrentAccount, loading } = useAleoClient()
  const [isLoading, setIsLoading] = useState(loading)

  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const baseHDAccount = useMemo(
    () => allAccounts.find(acc => acc.hdIndex === 0),
    [allAccounts],
  )

  const onPasswordChange = (text: string) => {
    setErrorMessage('')
    setPassword(text)
  }

  const onRemoveAccount = async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')

      await removeAccount(account.publicKey, password)
      // TODO: Eventually, when we support multiple chains,
      // we should delete the account from all chains
      await resyncAccount(account.publicKey, 'testnetbeta')

      if (baseHDAccount) await updateCurrentAccount(baseHDAccount?.publicKey)

      router.back()
    } catch (err: any) {
      setErrorMessage(err.message)
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RemoveAccountScreen
      name={account.name}
      publicKey={account.publicKey}
      isLoading={isLoading}
      error={errorMessage}
      password={password}
      isBaseHdAccount={account.hdIndex === 0}
      onPasswordChange={onPasswordChange}
      onRemoveAccount={onRemoveAccount}
    />
  )
}

export default SettingsRemoveAccount
