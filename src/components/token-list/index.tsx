import { View, Text } from 'react-native'
import React from 'react'
import { Token } from '@src/types/tokens'
import TokenItem from './token-item'

interface TokenListProps {
  tokens: Token[]
}

const TokenList: React.FC<TokenListProps> = ({ tokens }) => {
  return (
    <View className="px-4 py-2">
      <Text className="text-lg font-bold mb-4">Tokens</Text>
      {tokens
        ? tokens.map(token => <TokenItem key={token.id} token={token} />)
        : null}
    </View>
  )
}

export default TokenList
