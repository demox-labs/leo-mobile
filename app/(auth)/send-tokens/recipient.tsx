import React, { useCallback, useEffect } from 'react'
import RecipientScreen from '@src/screens/send-tokens/recipient'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import { StatusBar } from 'react-native'

const RecipientRoute = () => {
  const router = useRouter()
  const { aleoAddress } = useLocalSearchParams<{ aleoAddress: string }>()

  const { recipientAddress, setRecipientAddress } = useSendStateContext()

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  useEffect(() => {
    if (aleoAddress) {
      setRecipientAddress(aleoAddress)
    }
  }, [aleoAddress])

  const onContinuePress = () =>
    router.push({
      pathname: '/send-tokens/amount',
    })

  const onContactsPress = () =>
    router.push({
      pathname: '/send-tokens/address-book',
    })

  const onScanPress = () =>
    router.push({
      pathname: '/qr-code-scanner/',
    })

  return (
    <RecipientScreen
      recipientAddress={recipientAddress}
      onRecipientAddressChange={setRecipientAddress}
      onContinuePress={onContinuePress}
      onCancelPress={router.back}
      onContactsPress={onContactsPress}
      onScanPress={onScanPress}
      isContinueDisabled={!recipientAddress}
    />
  )
}

export default RecipientRoute
