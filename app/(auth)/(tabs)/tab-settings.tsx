import React from 'react'
import SettingsScreen from '@src/screens/settings'
import { useFocusEffect } from 'expo-router'
import { StatusBar } from 'react-native'
import { useAccount } from '@src/lib/aleo/ready'

const Settings = () => {
  const account = useAccount()

  useFocusEffect(() => {
    StatusBar.setBarStyle('dark-content')
  })

  return (
    <SettingsScreen
      accountName={account.name}
      accountAddress={account.publicKey}
    />
  )
}

export default Settings
