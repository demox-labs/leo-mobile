import React from 'react'
import { View, Switch, Text } from 'react-native'

interface OptionSwitchItemProps {
  title: string
  description: string
  isEnabled?: boolean
  handleToggle?: (isEnabled: boolean) => void
}

const OptionSwitchItem: React.FC<OptionSwitchItemProps> = ({
  title,
  description,
  isEnabled,
  handleToggle,
}) => {
  return (
    <View className="flex-row items-start py-2 mt-4">
      <View className="flex-1 pr-5">
        <Text className="text-lg font-semibold">{title}</Text>
        <Text className="text-sm mt-2">{description}</Text>
      </View>
      <Switch
        trackColor={{ false: '#ccc', true: '#634CFF' }}
        thumbColor="#fff"
        ios_backgroundColor="#ccc"
        onValueChange={handleToggle}
        value={isEnabled}
      />
    </View>
  )
}

export default OptionSwitchItem
