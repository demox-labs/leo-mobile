import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

interface RadioButtonProps {
  isSelected: boolean
  label: string
  onPress: () => void
}
const RadioButton: React.FC<RadioButtonProps> = ({
  isSelected,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center mb-3">
      <View
        className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center ${
          isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
        }`}
      >
        {isSelected ? (
          <View className="m-1 w-2 h-2 bg-white rounded-full" />
        ) : null}
      </View>
      <Text>{label}</Text>
    </TouchableOpacity>
  )
}

export default RadioButton
