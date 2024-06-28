import React from 'react'
import { View, Text } from 'react-native'

interface TransactionStepProps {
  step: number
  text: string
  description?: string
  containerStyle?: string
}
const TransactionStep: React.FC<TransactionStepProps> = ({
  step,
  text,
  description,
  containerStyle = '',
}) => (
  <View className={`flex-row items-center ${containerStyle}`}>
    <View className="flex justify-center items-center w-[32] h-[32] bg-gray-50 rounded-3xl">
      <Text>{step}</Text>
    </View>
    <View className="flex-col justify-center items-start">
      <Text className="ml-2">{text}</Text>
      {description ? (
        <Text className="text-sm text-gray-500 ml-2">{description}</Text>
      ) : null}
    </View>
  </View>
)

export default TransactionStep
