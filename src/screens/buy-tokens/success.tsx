import React from 'react'
import { View, Text } from 'react-native'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'

interface PurchaseSuccessfulScreenProps {
  onDonePress: () => void
}

const PurchaseSuccessfulScreen: React.FC<PurchaseSuccessfulScreenProps> = ({
  onDonePress,
}) => {
  return (
    <View className="flex-1 bg-white p-4 p-b-0 items-center justify-center">
      <View className="mb-8">
        <View className="items-center justify-center mt-[70%] mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="checkbox-circle" size={80} className="absolute" />
        </View>
        <Text className="text-xl font-semibold text-center mb-2">
          Purchase successful
        </Text>
        <Text className="text-center text-base max-w-[285px]">
          Your tokens will be available soon in your wallet.
        </Text>
      </View>
      <LeoButton label="Done" className="mb-5 mt-auto" onPress={onDonePress} />
    </View>
  )
}

export default PurchaseSuccessfulScreen
