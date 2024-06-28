import React from 'react'
import { SendConfig } from '@src/types/send'
import ConfigRadioButton from './config-radio-button'
import { View, Text } from 'react-native'

interface ConfigBoxProps {
  label: string
  type: SendConfig
  toggle: () => void
}
const ConfigBox: React.FC<ConfigBoxProps> = ({ label, type, toggle }) => (
  <View className="mb-4 items-center gap-2">
    <Text>{label}</Text>
    <View className="border p-2 rounded-xl border-gray-100 gap-2">
      <ConfigRadioButton
        label="Private"
        isSelected={type === 'private'}
        onPress={toggle}
        containerStyle="mb-1"
      />
      <ConfigRadioButton
        label="Public"
        isSelected={type === 'public'}
        onPress={toggle}
      />
    </View>
  </View>
)

export default ConfigBox
