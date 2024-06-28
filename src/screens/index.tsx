import React from 'react'
import { View, Image } from 'react-native'

export default function RootScreen() {
  return (
    <View className="bg-primary-500 flex-1 items-center justify-center">
      <Image
        source={require('@src/assets/splash.png')}
        className="flex-1"
        resizeMode="contain"
      />
    </View>
  )
}
