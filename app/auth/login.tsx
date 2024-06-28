import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAleoClient } from '@src/lib/aleo/client'
import LoginScreen from '@src/screens/login'

const LoginRoute = () => {
  const { unlock } = useAleoClient()
  const router = useRouter()
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const onForgotPasswordPress = () => {
    router.push('/auth/forgot-password')
  }

  const onUnlockPress = async (password: string) => {
    try {
      setIsLoading(true)
      await unlock(password)
      router.replace('/home')
    } catch (error) {
      console.log('Error unlocking wallet', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LoginScreen
      onForgotPasswordPress={onForgotPasswordPress}
      onUnlockPress={onUnlockPress}
      isLoading={isLoading}
      isError={isError}
    />
  )
}

export default LoginRoute
