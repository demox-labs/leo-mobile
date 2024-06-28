import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import useBottomMargin from '@src/hooks/useBottomMargin'

type GetStartedScreenProps = {
  onGetStartedPress: () => void
  onJoinDiscordPress: () => void
  onFollowTwitterPress: () => void
}

const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onGetStartedPress,
  onJoinDiscordPress,
  onFollowTwitterPress,
}) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView className="flex-1 items-center justify-center px-4 bg-white">
      <View className="flex-1 justify-center items-center">
        <View className="items-center justify-center mt-20 mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="checkbox-circle" size={80} className="absolute" />
        </View>
        <Text className="text-xl font-bold mb-1">Your wallet is ready!</Text>
        <Text className="text-base mb-3">
          You can now fully enjoy your wallet.
        </Text>

        <TouchableOpacity
          onPress={onJoinDiscordPress}
          className="flex-row items-center justify-between py-5 border-t border-gray-200 w-full"
        >
          <View>
            <Text className="font-semibold text-black">
              Join our Leo Wallet Discord
            </Text>
            <Text className="text-sm text-gray-500">
              Connect with our community, get updates.
            </Text>
          </View>
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFollowTwitterPress}
          className="flex-row items-center justify-between py-5 border-t border-gray-200 w-full"
        >
          <View>
            <Text className="font-semibold text-black">
              Follow us on Twitter
            </Text>
            <Text className="text-sm text-gray-500">
              Stay connected with us for the latest news.
            </Text>
          </View>
          <Icon name="chevron-right" size={24} />
        </TouchableOpacity>
      </View>

      <LeoButton
        label="Get Started"
        onPress={onGetStartedPress}
        className={bottomMargin}
      />
    </SafeAreaView>
  )
}

export default GetStartedScreen
