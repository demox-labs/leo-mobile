import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { formatBigInt, roundNumberString } from '@src/utils/money'
import Icon from '../icons'
import { Token } from '@src/types/tokens'
import { router } from 'expo-router'

interface TokenItemProps {
  token: Token
  borderVisible?: boolean
  showSymbol?: boolean
  onPress?: () => void
}

const renderIcon = (symbol: string) => {
  switch (symbol) {
    case 'ALEO':
      return <Icon name="aleo-letter" />
  }
}

const TokenItem: React.FC<TokenItemProps> = ({
  token,
  borderVisible = true,
  showSymbol = false,
  onPress = () => router.push('/stake/token-details'),
}) => (
  <TouchableOpacity
    key={token.symbol}
    className={`flex-row justify-between items-center py-2 px-4 ${
      borderVisible ? 'border border-gray-50' : ''
    } rounded-xl w-full`}
    onPress={onPress}
  >
    <View className="flex-row items-center gap-2">
      <View className="flex justify-center items-center w-[40] h-[40] border border-gray-100 rounded-3xl">
        {renderIcon(token.symbol)}
      </View>
      <View className="flex-col">
        <Text className="text-base font-semibold">{token.name}</Text>
        {showSymbol ? (
          <Text className="text-sm text-gray-500">{token.symbol}</Text>
        ) : null}
      </View>
    </View>
    <View className="items-end">
      <Text className="text-base font-semibold">
        {roundNumberString(formatBigInt(token.balance))}
      </Text>
      <Text className="text-sm text-gray-500">
        ~ ${roundNumberString(formatBigInt(token.balance))}
      </Text>
    </View>
  </TouchableOpacity>
)

export default TokenItem
