import React, { useCallback } from 'react'
import FaucetScreen from '@src/screens/faucet'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Platform, StatusBar } from 'react-native'

const FaucetRoute = () => {
  const { aleoAddress } = useLocalSearchParams<{ aleoAddress: string }>()

  if (!aleoAddress) {
    throw new Error('aleoAddress is required')
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  return <FaucetScreen aleoAddress={aleoAddress} />
}

export default FaucetRoute
