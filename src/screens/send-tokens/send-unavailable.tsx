import React from 'react'
import { View, Text } from 'react-native'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import { SafeAreaView } from 'react-native-safe-area-context'

interface SendUnavailableScreenProps {
  onBuyTokensPress: () => void
  onLearnMorePress: () => void
}

const SendUnavailableScreen: React.FC<SendUnavailableScreenProps> = ({
  onBuyTokensPress,
  // onLearnMorePress,
}) => {
  return (
    <SafeAreaView
      className="flex-1 bg-white p-4 items-center justify-center"
      edges={['bottom']}
    >
      <View className="flex-1 justify-center">
        <View className="items-center justify-center mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="warning-fill" size={80} className="absolute" />
        </View>
        <Text className="text-xl font-semibold text-center mb-2">
          Send unavailable
        </Text>
        <Text className="text-center text-base max-w-[285px]">
          To send private transactions in Aleo, you need 2 private records. Your
          account has only 1. Fund your wallet to continue.
        </Text>
      </View>
      <LeoButton
        label="Buy tokens"
        type="primary"
        className="mb-2 mt-auto"
        onPress={onBuyTokensPress}
      />
      {/* // TODO: Implement the onLearnMorePress function
      <LeoButton
        label="Learn more"
        type="secondary"
        onPress={onLearnMorePress}
      /> */}
    </SafeAreaView>
  )
}

export default SendUnavailableScreen
