import React from 'react'

import { Stack, useNavigation } from 'expo-router'
import customHeaderOptions from '@src/components/navigation/custom-header-options'

const AuthNavigator = () => {
  const navigation = useNavigation()

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="auth-splash" />
      <Stack.Screen
        name="back-up-wallet"
        options={customHeaderOptions({
          navigation,
          dotsIndicatorConfig: { activeDotIndex: 0, dotsLength: 3 },
        })}
      />
      <Stack.Screen
        name="create-password"
        options={{ headerLeft: () => null, headerBackVisible: false }}
      />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen
        name="get-started"
        options={{ headerShown: false, title: '' }}
      />
      <Stack.Screen
        name="import-wallet"
        options={customHeaderOptions({
          navigation,
          dotsIndicatorConfig: { activeDotIndex: 0, dotsLength: 2 },
        })}
      />
      <Stack.Screen name="login" />
      <Stack.Screen
        name="verify-seed-phrase"
        options={{
          ...customHeaderOptions({
            navigation,
            dotsIndicatorConfig: { activeDotIndex: 1, dotsLength: 3 },
          }),
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  )
}

export default AuthNavigator
