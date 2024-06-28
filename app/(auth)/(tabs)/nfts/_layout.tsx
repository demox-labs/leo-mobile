import React, { useCallback } from 'react'

import { Stack, useFocusEffect, useRouter } from 'expo-router'
import { StatusBar } from 'react-native'
import { BackButton } from '@src/components/navigation/back-button'

const NFTsLayout = () => {
  const router = useRouter()
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="nft-details"
        options={{
          headerLeft: () => <BackButton onPress={router.back} />,
          headerShown: true,
          title: 'NFT Details',
        }}
      />
    </Stack>
  )
}

export default NFTsLayout
