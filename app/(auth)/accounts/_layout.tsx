import React, { useCallback } from 'react'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import { Platform, StatusBar } from 'react-native'
import { BackButton } from '@src/components/navigation/back-button'
import { DismissButton } from '@src/components/navigation/dismiss-button'

export default function Root() {
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(
        Platform.OS === 'ios' ? 'light-content' : 'dark-content',
      )
    }, []),
  )

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Accounts',
          headerBackVisible: false,
          headerRight: () => <DismissButton onPress={router.back} />,
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          headerLeft: () => <BackButton onPress={router.back} />,
          title: 'Import Account',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerLeft: () => <BackButton onPress={router.back} />,
          title: 'Create or restore account',
        }}
      />
    </Stack>
  )
}
