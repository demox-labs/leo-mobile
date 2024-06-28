import React, { useCallback, useEffect } from 'react'
import { Tabs } from 'expo-router/tabs'
import { Platform, View } from 'react-native'
import { useRouter } from 'expo-router'
import * as LocalAuthentication from 'expo-local-authentication'
import Icon, { IconNamesUnion } from '@src/components/icons'
import { fetchBiometricAuthEnabled } from '@src/lib/aleo/safe-storage'
import { StorageKeys, getData } from '@src/utils/storage'
import useIsSmallScreen from '@src/hooks/useIsSmallScreen'

enum TabName {
  Home = 'home',
  Activities = 'activities',
  Nfts = 'nfts',
  Browser = 'browser',
  Settings = 'settings',
}

const TabsLayout: React.FC = () => {
  const router = useRouter()

  const isSmallScreen = useIsSmallScreen()

  const renderIcon = useCallback((tabName: TabName, isFocused: boolean) => {
    const name = isFocused ? `${tabName}-selected` : tabName
    const tabContainerStyles = isFocused
      ? 'bg-gray-25 h-[54px] w-[54px] justify-center items-center rounded-full'
      : ''

    return (
      <View className={tabContainerStyles}>
        <Icon name={name as IconNamesUnion} />
      </View>
    )
  }, [])

  const enrollBiometricAuth = useCallback(async () => {
    const hasAskedForBiometricAuth = await getData(
      StorageKeys.HAS_ASKED_FOR_BIOMETRIC_AUTH,
    )

    if (hasAskedForBiometricAuth) {
      return
    }

    const biometricAuthEnabled = await fetchBiometricAuthEnabled()

    const supportedAuthTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync()

    if (supportedAuthTypes.length && !biometricAuthEnabled) {
      router.push('/biometric-auth-enroll')
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      enrollBiometricAuth()
    }, 5000)
  }, [])

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: isSmallScreen ? 70 : 86,
          paddingTop: isSmallScreen ? 0 : 20,
          paddingHorizontal: 24,
          paddingBottom: isSmallScreen ? 0 : Platform.OS === 'ios' ? 40 : 20,
        },
        headerTitleStyle: {
          textTransform: 'capitalize',
          textAlign: 'left',
          fontSize: 22,
          fontWeight: 'bold',
        },
        headerTitleAlign: 'left',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          href: '/home',
          tabBarIcon: ({ focused }) => renderIcon(TabName.Home, focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          href: '/activities',
          tabBarIcon: ({ focused }) => renderIcon(TabName.Activities, focused),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="nfts"
        options={{
          href: '/nfts',
          tabBarIcon: ({ focused }) => renderIcon(TabName.Nfts, focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="browser"
        options={{
          href: '/browser',
          tabBarIcon: ({ focused }) => renderIcon(TabName.Browser, focused),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tab-settings"
        options={{
          href: '/tab-settings',
          tabBarIcon: ({ focused }) => renderIcon(TabName.Settings, focused),
          headerShown: true,
          title: 'Settings',
        }}
      />
    </Tabs>
  )
}

export default TabsLayout
