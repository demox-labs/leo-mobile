import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { capitalize } from '@src/utils/strings'
import { Ionicons } from '@expo/vector-icons'

interface FeeInformationProps {
  fee: string
  feeType: string
  disabled?: boolean
  onCustomizeFeePress: () => void
}
const FeeInformation: React.FC<FeeInformationProps> = ({
  fee,
  feeType,
  disabled = false,
  onCustomizeFeePress,
}) => (
  <View
    className={`flex-row items-center justify-between py-2 mb-4 pt-4 ${
      disabled ? 'opacity-30' : ''
    }`}
  >
    <View className="flex-row items-center">
      <View>
        <Text className="ml-2 text-base">Fee</Text>
        <Text className="ml-2 text-sm text-gray-600">
          {capitalize(feeType)}
        </Text>
      </View>
    </View>
    <TouchableOpacity onPress={onCustomizeFeePress} disabled={disabled}>
      <View className="flex-row items-center">
        <View>
          <Text className="text-base mr-2">{fee}</Text>
          <Text className="text-sm mr-2 text-gray-600">ALEO</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={24} color="black" />
      </View>
    </TouchableOpacity>
  </View>
)

export default FeeInformation
