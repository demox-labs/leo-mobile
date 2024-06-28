import React from 'react'

import { Stack, useRouter } from 'expo-router'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import SendStateProvider from '@src/state/context/send-tokens/provider'
import { BackButton } from '@src/components/navigation/back-button'
import { DismissButton } from '@src/components/navigation/dismiss-button'

const CommonModalHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  presentation: 'formSheet',
  gestureEnabled: true,
  headerTitleAlign: 'center',
}

const SendTokensNavigator: React.FC = () => {
  const router = useRouter()

  return (
    <SendStateProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Choose tokens',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="recipient"
          options={{
            title: 'Recipient',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="amount"
          options={{
            title: 'Send tokens',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="address-book"
          options={{
            ...CommonModalHeaderOptions,
            title: 'Address Book',
            presentation: 'modal',
            headerBackVisible: false,
            headerRight: () => <DismissButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="advanced-send"
          options={{
            ...CommonModalHeaderOptions,
            title: 'Advanced send',
            presentation: 'modal',
            headerBackVisible: false,
            headerRight: () => <DismissButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="review"
          options={{
            title: 'Review',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="transaction-details"
          options={{
            title: ' ',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="customize-fee"
          options={{
            title: 'Customize fee',
            headerLeft: () => <BackButton onPress={router.back} />,
          }}
        />
        <Stack.Screen
          name="send-unavailable"
          options={{
            title: 'Send tokens',
            headerLeft: () => (
              <DismissButton onPress={() => router.navigate('/home')} />
            ),
          }}
        />
      </Stack>
    </SendStateProvider>
  )
}

export default SendTokensNavigator
