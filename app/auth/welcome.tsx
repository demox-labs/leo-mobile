import React from 'react'
import WelcomeScreen from '@src/screens/onboarding/welcome' // Ensure this path is correct
import { useRouter } from 'expo-router'

const WelcomeRoute = () => {
  const router = useRouter()

  const onAlreadyHaveWalletPress = () => {
    router.push('/auth/import-wallet')
  }

  const onNewWalletPress = () => {
    router.push('/auth/back-up-wallet')
  }

  return (
    <WelcomeScreen
      onAlreadyHaveWalletPress={onAlreadyHaveWalletPress}
      onNewWalletPress={onNewWalletPress}
    />
  )
}

export default WelcomeRoute
