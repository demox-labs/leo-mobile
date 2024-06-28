import React from 'react'
import { Stack, router } from 'expo-router'
import { DismissButton } from '@src/components/navigation/dismiss-button'
import { BackButton } from '@src/components/navigation/back-button'
import Icon from '@src/components/icons'
import { TouchableOpacity, Linking, View, Text } from 'react-native'

const getHomeOptions = (title: string) => ({
  headerShown: true,
  title,
  headerBackVisible: false,
  navigationBarHidden: true,
  headerTitleStyle: { fontSize: 20 },
  headerShadowVisible: false,
  headerRight: () => <DismissButton onPress={router.back} />,
})

const Layout = () => {
  const onExternalLinkPress = () => {
    Linking.openURL('https://aleoscan.io')
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={getHomeOptions('Stake ALEO')} />
      <Stack.Screen
        name="active-stake"
        options={getHomeOptions('Stake ALEO')}
      />
      <Stack.Screen name="empty-balance" options={getHomeOptions('Buy')} />
      <Stack.Screen
        name="token-details"
        options={{
          ...getHomeOptions('Stake ALEO'),
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>ALEO</Text>
              <Icon name="shield-check-fill" style={{ marginLeft: 5 }} />
            </View>
          ),
          headerLeft: () => <BackButton onPress={router.back} />,
          headerRight: () => (
            <TouchableOpacity onPress={onExternalLinkPress}>
              <Icon name="external-link" />
            </TouchableOpacity>
          ),
          headerBackground: () => <View className="flex-1 bg-primary-50" />,
        }}
      />
    </Stack>
  )
}

export default Layout
