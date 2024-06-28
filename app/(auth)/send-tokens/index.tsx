import React, { useCallback } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import { mockedTokensBuyFlow } from '@src/api/mockedData'
import { Token } from '@src/types/tokens'
import { StatusBar } from 'react-native'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import TokenListScreen from '@src/screens/token-list'

const ChooseTokenRoute = () => {
  const router = useRouter()

  const { setToken } = useSendStateContext()

  const handleTokenPress = useCallback((token: Token) => {
    setToken(token)
    router.push('/send-tokens/recipient')
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <TokenListScreen
      tokens={mockedTokensBuyFlow}
      onTokenPress={handleTokenPress}
    />
  )
}

export default ChooseTokenRoute
