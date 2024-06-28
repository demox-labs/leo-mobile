import React, { useCallback } from 'react'
import { Platform, Share, StatusBar } from 'react-native'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import Clipboard from '@react-native-clipboard/clipboard'
import Receive from '@src/screens/receive'
import { useAccount } from '@src/lib/aleo/ready'

const ReceiveRoute = () => {
  const { aleoAddress } = useLocalSearchParams<{ aleoAddress: string }>()
  const account = useAccount()
  const [copyPressed, setCopyPressed] = React.useState(false)

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  const onSharePress = async () => {
    try {
      await Share.share({
        message: aleoAddress!,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred')
      }
    }
  }

  const onCopyPress = () => {
    Clipboard.setString(aleoAddress!)
    setCopyPressed(true)
  }

  return (
    <Receive
      aleoAddress={aleoAddress || account.publicKey || 'https://example.com'}
      copyPressed={copyPressed}
      onSharePress={onSharePress}
      onCopyPress={onCopyPress}
    />
  )
}

export default ReceiveRoute
