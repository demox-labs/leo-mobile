import React, { useLayoutEffect } from 'react'
import AccountSettingsScreen from '@src/screens/settings/account-settings'
import { useAccount } from '@src/lib/aleo/ready'
import { useNavigation } from 'expo-router'

const SettingsAccountRoute = () => {
  const account = useAccount()
  const navigation = useNavigation()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerTitle: account.name,
    })
  }, [navigation, account.name])

  return (
    <AccountSettingsScreen
      accountName={account.name}
      accountAddress={account.publicKey}
    />
  )
}

export default SettingsAccountRoute
