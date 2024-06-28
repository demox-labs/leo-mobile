import { View, Text } from 'react-native'
import React from 'react'
import LeoPressable from '@src/components/leo-pressable'
import Icon from '@src/components/icons'

export type NetworkItemProps = {
  title: string
  isSelected?: boolean
  onPress?: () => void
}

export const NetworkItem: React.FC<NetworkItemProps> = ({
  title,
  isSelected,
  onPress,
}) => (
  <LeoPressable
    useDefaultStyles={false}
    onPress={onPress ?? (() => {})}
    className="mb-2 rounded-lg p-2 my-2 flex-row items-center"
  >
    <View className="flex-row items-center gap-2">
      <Icon name="aleo-network-icon" />
      <View className="flex-1">
        <Text className="text-base font-semibold">{title}</Text>
      </View>
      {isSelected ? (
        <Icon name="checkbox-circle-fill" size={24} color="#000" />
      ) : null}
    </View>
  </LeoPressable>
)

type Network = {
  name: string
  id: string
}

interface NetworksScreenProps {
  selectedNetworkId: string
  devnets: Network[]
  testnets: Network[]
  onNetworkSelect: (network: string) => void
}

const NetworksScreen: React.FC<NetworksScreenProps> = ({
  selectedNetworkId,
  devnets,
  testnets,
  onNetworkSelect,
}) => {
  return (
    <View className="flex-1 bg-white p-4 pt-[40px]">
      <Text className="text-gray-600">Devnets</Text>
      {devnets.map(network => (
        <NetworkItem
          key={network.id}
          title={network.name}
          isSelected={selectedNetworkId === network.id}
          onPress={() => onNetworkSelect(network.id)}
        />
      ))}
      <Text className="text-gray-600">Testnets</Text>
      {testnets.map(network => (
        <NetworkItem
          key={network.id}
          title={network.name}
          isSelected={selectedNetworkId === network.id}
          onPress={() => onNetworkSelect(network.id)}
        />
      ))}
    </View>
  )
}

export default NetworksScreen
