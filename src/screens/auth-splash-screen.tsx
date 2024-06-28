import React from 'react'
import { View } from 'react-native'

import Icon from '@src/components/icons'

const AuthSplashScreen: React.FC = () => {
  return (
    <View className="flex-1 bg-primary-500 items-center justify-center">
      {/* <StatusBar style="light" /> */}
      <Icon name="auth-splash-icon" className="flex-1 w-100 h-100" />
    </View>
  )
}

export default AuthSplashScreen
