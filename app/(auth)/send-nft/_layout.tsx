import React from 'react'

import { Stack, useRouter } from 'expo-router'
import SendStateProvider from '@src/state/context/send-tokens/provider'
import { BackButton } from '@src/components/navigation/back-button'

const SendTokensNavigator: React.FC = () => {
  const router = useRouter()

  return (
    <SendStateProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Send NFT',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="review"
          options={{
            title: 'Review & Send NFT',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="nft-sent"
          options={{
            title: '',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
      </Stack>
    </SendStateProvider>
  )
}

export default SendTokensNavigator
