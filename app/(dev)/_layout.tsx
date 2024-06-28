import React from 'react'

import { Redirect, Stack } from 'expo-router'
import { isProduction } from '@src/utils/app'

const AuthNavigator = () => {
  if (isProduction) {
    return <Redirect href="/" />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="storybook" options={{ headerShown: true }} />
      <Stack.Screen name="sdk-example" options={{ headerShown: true }} />
      <Stack.Screen name="db-example" options={{ headerShown: true }} />
    </Stack>
  )
}

export default AuthNavigator
