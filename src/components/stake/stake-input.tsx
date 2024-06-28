import { formatBigInt } from '@src/utils/money'
import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

interface StakeInputProps {
  tokenName: string
  availableAmount: bigint
  value: string
  onChangeText: (text: string) => void
}

const StakeInput: React.FC<StakeInputProps> = ({
  tokenName,
  availableAmount,
  value,
  onChangeText,
}) => {
  return (
    <View>
      <Text className="text-lg font-semibold mb-2">{`Amount of ${tokenName} to stake`}</Text>
      <View className="flex-row items-center justify-center border border-gray-300 rounded-lg px-4 py-2 mb-3">
        <TextInput
          className="flex-1 text-xl justify-center items-center mb-1"
          value={value}
          keyboardType="numeric"
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          className="ml-2 py-2 px-4 bg-gray-100 rounded-md"
          onPress={() => onChangeText(formatBigInt(availableAmount))}
        >
          <Text className=" font-semibold">Max</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600 items-baseline">
        Available:{' '}
        <Text className="text-primary-500">
          {formatBigInt(availableAmount)} {tokenName}
        </Text>
      </Text>
    </View>
  )
}

export default StakeInput
