import React from 'react'
import GetStartedScreen from '@src/screens/onboarding/get-started'
import { router } from 'expo-router'
import { Linking } from 'react-native'

const GetStartedRoute = () => {
  const onGetStartedPress = () => {
    router.replace('/home')
  }

  const onJoinDiscordPress = () => {
    Linking.openURL('https://discord.com/invite/cpCrGwfWCs')
  }

  const onFollowTwitterPress = () => {
    Linking.openURL('https://twitter.com/theLeoWallet')
  }

  return (
    <GetStartedScreen
      onGetStartedPress={onGetStartedPress}
      onJoinDiscordPress={onJoinDiscordPress}
      onFollowTwitterPress={onFollowTwitterPress}
    />
  )
}

export default GetStartedRoute
