import React from 'react'
import { ScrollView } from 'react-native'
import { Token } from '@src/types/tokens'
import { SafeAreaView } from 'react-native-safe-area-context'
import TokenItem from '@src/components/token-list/token-item'

interface TokenListProps {
  tokens: Token[]
  onTokenPress: (token: Token) => void
}

const TokenListScreen: React.FC<TokenListProps> = ({
  tokens,
  onTokenPress,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="px-2">
        {tokens.map(token => (
          <TokenItem
            key={token.id}
            token={token}
            borderVisible={false}
            showSymbol
            onPress={() => onTokenPress(token)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default TokenListScreen
