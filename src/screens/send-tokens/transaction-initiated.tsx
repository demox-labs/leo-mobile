import { View, Text } from 'react-native'
import React from 'react'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import AnimatedLoading from '@src/components/icons/animated/loading'

interface TransactionInitiatedScreenProps {
  done: boolean
  onDonePress: () => void
}

const TransactionInitiatedScreen: React.FC<TransactionInitiatedScreenProps> = ({
  done,
  onDonePress,
}) => {
  const message = done
    ? 'Transaction is completed'
    : 'Transaction will proceed in the background'

  const icon = done ? (
    <>
      <Icon name="background-circle" size={180} />
      <Icon name="checkbox-circle" size={80} className="absolute" />
    </>
  ) : (
    <AnimatedLoading isLoading={!done} />
  )

  return (
    <View className="flex-col items-center  flex-1 bg-white px-4">
      <View className="flex-1 justify-center items-center">
        <View className="items-center justify-center  mb-6 relative">
          {icon}
        </View>
        <Text className="text-xl font-bold mb-1">Transaction Initiated</Text>
        <Text>{message}</Text>
      </View>

      <LeoButton
        label="Done"
        type="secondary"
        className="mb-14 mt-auto"
        onPress={onDonePress}
      />
    </View>
  )
}

export default TransactionInitiatedScreen
