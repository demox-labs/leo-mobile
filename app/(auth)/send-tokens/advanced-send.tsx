import React, { useCallback, useState } from 'react'
import { useFocusEffect, useRouter } from 'expo-router'
import AdvancedSendScreen from '@src/screens/send-tokens/advanced-send'
import { SendConfig } from '@src/types/send'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import { DEFAULT_FEES } from '@src/lib/aleo/assets/default-fees'
import { getFunctionNameBasedOnSendReceive } from '@src/lib/aleo/activity/transactions'
import { Platform, StatusBar } from 'react-native'

const AdvancedSendRoute: React.FC = () => {
  const router = useRouter()

  const {
    token,
    sendType: contextSendType,
    receivedType: contextReceivedType,
    setSendType: updateSendType,
    setReceivedType: updateReceivedType,
    setFee: updateFee,
    privateBalance,
    publicBalance,
  } = useSendStateContext()

  const [sendType, setSendType] = useState<SendConfig>(contextSendType)
  const [receivedType, setReceivedType] =
    useState<SendConfig>(contextReceivedType)

  const toggleSentType = () => {
    setSendType(prev => (prev === 'private' ? 'public' : 'private'))
  }
  const toggleReceivedType = () => {
    setReceivedType(prev => (prev === 'private' ? 'public' : 'private'))
  }

  const handleConfirm = () => {
    updateSendType(sendType)
    updateReceivedType(receivedType)
    const creditsFunctionName = getFunctionNameBasedOnSendReceive(
      sendType === 'private',
      receivedType === 'private',
    )
    updateFee(DEFAULT_FEES['credits.aleo'][creditsFunctionName])
    router.back()
  }

  const handleConvert = () => {
    router.replace('/convert-token/')
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  return (
    <AdvancedSendScreen
      sendType={sendType}
      receivedType={receivedType}
      hasNoPrivateTokens={privateBalance === BigInt(0)}
      hasNoPublicTokens={publicBalance === BigInt(0)}
      toggleSentType={toggleSentType}
      toggleReceivedType={toggleReceivedType}
      tokenFee={BigInt(50_000)} // TODO: Update this later with the proper value
      tokenName={token.name.toLocaleUpperCase()}
      onConfirm={handleConfirm}
      handleConvert={handleConvert}
    />
  )
}

export default AdvancedSendRoute
