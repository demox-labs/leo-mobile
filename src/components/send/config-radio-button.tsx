import { FontAwesome } from '@expo/vector-icons'
import colors from '@src/utils/colors'
import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'

export interface ConfigRadioButtonProps {
  label: string
  isSelected: boolean
  containerStyle?: string
  onPress: () => void
}
const ConfigRadioButton: React.FC<ConfigRadioButtonProps> = ({
  label,
  isSelected,
  containerStyle,
  onPress,
}) => {
  const backgroundColor = isSelected ? 'bg-primary-500' : 'bg-white'
  const textColor = isSelected ? 'text-white' : 'text-black'

  const circleStyle = `w-6 h-6 rounded-full mr-2 items-center justify-center bg-white ${isSelected ? '' : 'border-[2px] border-black'}`

  return (
    <TouchableOpacity onPress={onPress}>
      <View
        className={`flex-row items-center ${backgroundColor} py-2 px-4 rounded-lg ${containerStyle} min-h-[48px]`}
      >
        <View className={circleStyle}>
          {isSelected ? (
            <FontAwesome name="check" size={13} color={colors.primary['500']} />
          ) : null}
        </View>
        <Text className={`text-base ${textColor}`}>{label}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default ConfigRadioButton
