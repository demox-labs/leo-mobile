import Icon, { IconProps } from '@src/components/icons'
import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'

export interface PaymentMethod {
  id: string
  name: string
  description: string
  iconName: IconProps['name']
}

interface ChooseMethodScreenProps {
  methods: PaymentMethod[]
  onSelectMethod: (methodId: string) => void
}

const ChooseMethodScreen: React.FC<ChooseMethodScreenProps> = ({
  methods,
  onSelectMethod,
}) => {
  const renderItem = ({ item }: { item: PaymentMethod }) => (
    <TouchableOpacity
      className="flex-row items-center pb-4"
      onPress={() => onSelectMethod(item.id)}
    >
      <Icon name={item.iconName} size={32} color="black" />
      <View className="flex-1 ml-2">
        <Text className="font-medium">{item.name}</Text>
        <Text className="text-xs text-gray-600">{item.description}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <FlatList
      data={methods}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      className="bg-white px-5 pt-[63px]"
    />
  )
}

export default ChooseMethodScreen
