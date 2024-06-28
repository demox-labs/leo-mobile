import React from 'react'
import { View, Text } from 'react-native'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'

interface ErrorScreenProps {
  onTryAgainPress: () => void
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ onTryAgainPress }) => {
  return (
    <View className="flex-1 bg-white p-4 p-b-0 items-center justify-center">
      <View className="mb-8">
        <View className="items-center justify-center mt-[70%] mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="warning-fill" size={80} className="absolute" />
        </View>
        <Text className="text-xl font-semibold text-center mb-2">
          Purchase Failed
        </Text>
        <Text className="text-center text-base max-w-[285px]">
          There was an issue processing your transaction. Please try again later
          or contact support for assistance.
        </Text>
      </View>
      <LeoButton
        label="Try again"
        type="secondary"
        className="mb-5 mt-auto"
        onPress={onTryAgainPress}
      />
    </View>
  )
}

export default ErrorScreen
