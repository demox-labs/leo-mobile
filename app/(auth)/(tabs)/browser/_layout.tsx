import React, { useCallback } from 'react'

import { Stack, useFocusEffect } from 'expo-router'
import { StatusBar } from 'react-native'

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
}

const NFTsLayout = () => {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="browser-webview"
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
    </Stack>
  )
}

export default NFTsLayout
