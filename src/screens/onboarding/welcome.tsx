import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import useBottomMargin from '@src/hooks/useBottomMargin'

type WelcomeScreenProps = {
  onNewWalletPress: () => void
  onAlreadyHaveWalletPress: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNewWalletPress,
  onAlreadyHaveWalletPress,
}) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView className="flex-1 items-center px-4 bg-white">
      <View className="items-center mt-7">
        <Icon name="leo-logo-and-name-centered" className="mb-12" />
        <View className="items-center justify-center mt-5 mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="encrypted-padlock" className="absolute" />
        </View>
      </View>
      <View className="mb-auto">
        <Text className="text-2xl font-bold mb-1 text-center">
          The wallet built for privacy
        </Text>
        <Text className="text-base mb-5 text-center">
          Private transactions anytime, anywhere
        </Text>
      </View>
      <View className={`mt-auto w-full ${bottomMargin}`}>
        <LeoButton
          label="I already have a wallet"
          type="link"
          onPress={onAlreadyHaveWalletPress}
          className={'mb-4'}
        />
        <LeoButton
          label="Create a new wallet"
          onPress={onNewWalletPress}
          className={'py-2'}
        />
      </View>
    </SafeAreaView>
  )
}

export default WelcomeScreen
