import { View, Text } from 'react-native'
import React from 'react'
import LeoButton from '@src/components/leo-button'
import TransactionStep from '@src/components/send/transaction-step'
import { SafeAreaView } from 'react-native-safe-area-context'

interface TransactionStepProps {
  step: number
  text: string
  description?: string
}
interface TransactionDetailsScreenProps {
  steps: TransactionStepProps[]
  onCancelPress: () => void
}

const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> = ({
  steps,
  onCancelPress,
}) => {
  return (
    <SafeAreaView className="flex-col items-center justify-center flex-1 bg-white p-5">
      <View className="flex-row justify-start w-full">
        <Text className="text-lg font-bold mb-5">Transaction breakdown</Text>
      </View>

      <View className="flex-row justify-start w-full">
        <View className="flex-col mt-4">
          {steps.map(step => (
            <TransactionStep
              key={step.step}
              step={step.step}
              text={step.text}
              description={step.description}
              containerStyle="mb-5"
            />
          ))}
        </View>
      </View>

      <LeoButton
        label="Cancel"
        type="secondary"
        className="mt-auto"
        onPress={onCancelPress}
      />
    </SafeAreaView>
  )
}

export default TransactionDetailsScreen
