import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { DismissButton } from '@src/components/navigation/dismiss-button'

export default function Root() {
  const router = useRouter()

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTransparent: true,
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Scan QR-Code',
          headerBackVisible: false,
          headerRight: () => (
            <DismissButton
              onPress={router.back}
              iconOptions={{
                color: '#fff',
              }}
            />
          ),
        }}
      />
    </Stack>
  )
}
