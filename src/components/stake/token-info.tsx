import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { formatBigInt } from '@src/utils/money'
import { TokenInfoData } from '@src/types/home'
import Icon from '@src/components/icons'
import { TokenScreenHandlers } from '@src/screens/stake/token-details'

export interface TokenInfoProps {
  tokenInfo: TokenInfoData
  useSafeAreaView: boolean
  handlers: TokenScreenHandlers
}

const TokenInfo: React.FC<TokenInfoProps> = ({
  tokenInfo,
  useSafeAreaView,
  handlers,
}) => {
  const TokenInfoView = useSafeAreaView ? SafeAreaView : View

  const { name, balance } = tokenInfo

  const { onSendPress, onReceivePress, onConvertPress } = handlers

  return (
    <TokenInfoView className="px-4 bg-primary-50 rounded-b-3xl pb-[10px] w-full">
      <View className="flex-row items-baseline mt-5">
        <Text className="text-4xl font-bold">
          {formatBigInt(balance.total)}
        </Text>
        <Text className="ml-2 text-lg">{name}</Text>
      </View>

      <View className="flex-row my-5">
        <View>
          <Text className="color-gray-600">Private</Text>
          <Text className="font-bold">{formatBigInt(balance.private)}</Text>
        </View>

        <View className="ml-10">
          <Text className="color-gray-600">Public</Text>
          <Text className="font-bold">{formatBigInt(balance.public)}</Text>
        </View>
      </View>

      {/* Send, Receive and Convert buttons */}
      <View className="flex-row justify-around mt-5">
        <TouchableOpacity className="items-center" onPress={onSendPress}>
          <Icon name="send-button" className="mb-2" />
          <Text>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={onReceivePress}>
          <Icon name="receive-button" className="mb-2" />
          <Text>Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={onConvertPress}>
          <Icon name="convert-button" className="mb-2" />
          <Text>Convert</Text>
        </TouchableOpacity>
      </View>
    </TokenInfoView>
  )
}

export default TokenInfo
