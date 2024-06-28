import React, { useCallback } from 'react'
import AccountsScreen from '@src/screens/accounts'
import { useRouter } from 'expo-router'
import { useAccount, useRelevantAccounts } from '@src/lib/aleo/ready'
import { useAleoClient } from '@src/lib/aleo/client'

const AccountsRoute = () => {
  const router = useRouter()
  const { updateCurrentAccount } = useAleoClient()
  const account = useAccount()
  const allAccounts = useRelevantAccounts()

  const onImportAccountPress = useCallback(() => {
    router.push('/accounts/import')
  }, [])

  const onCreateAccountPress = useCallback(() => {
    router.push('/accounts/create')
  }, [])

  const onAccountPress = async (accountAddress: string) => {
    try {
      // no need to switch to the same account
      if (account.publicKey === accountAddress) return

      await updateCurrentAccount(accountAddress)
      router.dismiss()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AccountsScreen
      currentAccountAddress={account.publicKey}
      accounts={allAccounts}
      onImportAccountPress={onImportAccountPress}
      onCreateAccountPress={onCreateAccountPress}
      onAccountPress={onAccountPress}
    />
  )
}

export default AccountsRoute
