import React from 'react'
import LeoButton from '@src/components/leo-button'
import { useRouter } from 'expo-router'
import { View, Text } from 'react-native'
import Icon from '@src/components/icons'

export default function Page() {
  const router = useRouter()
  return (
    <View className="flex-1 flex flex-col items-center justify-center gap-y-8">
      <Icon name={'danger'} size={64} />
      <Text className="text-2xl">Not Found</Text>
      <LeoButton
        label="Home"
        type="secondary"
        onPress={() => router.replace('/')}
      />
    </View>
  )
}
