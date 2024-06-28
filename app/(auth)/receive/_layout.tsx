import React, { useCallback } from 'react'
import { Stack, useFocusEffect, useRouter } from 'expo-router'
import { Platform, StatusBar } from 'react-native'
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
          title: 'Receive',
          headerBackVisible: false,
          headerRight: () => <DismissButton onPress={router.back} />,
        }}
      />
    </Stack>
  )
}
