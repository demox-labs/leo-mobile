import { View, Text } from 'react-native'
import React from 'react'

interface TabsCounterIconProps {
  count: React.ReactNode
}

const TabsCounterIcon: React.FC<TabsCounterIconProps> = ({ count }) => {
  return (
    <View className="h-[24px] w-[24px] border-2 border-black items-center justify-center rounded-sm">
      <Text className="font-semibold">{count}</Text>
    </View>
  )
}

export default TabsCounterIcon
