import React, { useCallback, useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useFonts, Inter_500Medium } from '@expo-google-fonts/inter'
import * as SplashScreen from 'expo-splash-screen'
import { AleoProvider } from '@src/lib/aleo'
import ErrorBoundary from '@src/components/error-boundary'
import { startNetworkLogging } from 'react-native-network-logger'
import { registerDevMenuItems } from 'expo-dev-menu'
import useAppInitialization from '@src/hooks/useAppInitialization'
import InactivityComponent from '@src/components/inactivity-component'
import { DeepLinkingProvider } from '@src/hooks/useDeepLinking'
import { install } from 'react-native-quick-crypto'

install()

SplashScreen.preventAutoHideAsync()
  .then(result =>
    console.log(`SplashScreen.preventAutoHideAsync() succeeded: ${result}`),
  )
  .catch(console.warn)

startNetworkLogging()

const Layout = () => {
  const router = useRouter()
  const [fontsLoaded, fontError] = useFonts({
    Inter_500Medium,
  })
  const appIsReady = useMemo(
    () => fontsLoaded && !fontError,
    [fontsLoaded, fontError],
  )

  useEffect(() => {
    if (!__DEV__) {
      registerDevMenuItems([
        {
          name: 'Storybook',
          callback: () => {
            router.push('/storybook')
          },
        },
        {
          name: 'Network Logger',
          callback: () => {
            router.push('/network-logger')
          },
        },
      ])
    }
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return null
  }

  return (
    <View className="flex-1" onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <AleoProvider>
          <DeepLinkingProvider>
            {!fontsLoaded && !fontError ? null : (
              <InactivityComponent>
                <AppStack />
              </InactivityComponent>
            )}
          </DeepLinkingProvider>
        </AleoProvider>
      </ErrorBoundary>
    </View>
  )
}

const AppStack = () => {
  useAppInitialization()

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          animation: 'none',
        }}
      />
      <Stack.Screen
        name="webview"
        // Do not use presentation: 'fullScreenModal' for webview
        // It causes the webview transition to another screen to be janky
      />
    </Stack>
  )
}

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
}

export default Layout
