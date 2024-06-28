import React, { useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import SendUnavailableScreen from '@src/screens/send-tokens/send-unavailable'
import { StatusBar } from 'react-native'

const ErrorRoute = () => {
  const onBuyTokensPress = () => {
    router.replace('/buy-tokens/')
  }

  const onLearnMorePress = () => {
    // router.push('/send-tokens/learn-more') TODO: Implement this route
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <SendUnavailableScreen
      onBuyTokensPress={onBuyTokensPress}
      onLearnMorePress={onLearnMorePress}
    />
  )
}

export default ErrorRoute
