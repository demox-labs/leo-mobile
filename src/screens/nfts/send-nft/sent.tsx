import { View, Text } from 'react-native'
import React from 'react'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import useBottomMargin from '@src/hooks/useBottomMargin'
import { SafeAreaView } from 'react-native-safe-area-context'

interface NFTSentScreenProps {
  onDonePress: () => void
}

const NFTSentScreen: React.FC<NFTSentScreenProps> = ({ onDonePress }) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView
      className="flex-col items-center  flex-1 bg-white px-4"
      edges={['bottom']}
    >
      <View className="flex-1 justify-center items-center">
        <View className="items-center justify-center  mb-6 relative">
          <Icon name="background-circle" size={180} />
          <Icon name="checkbox-circle" size={80} className="absolute" />
        </View>
        <Text className="text-xl font-bold mb-1">NFT Successfully Sent</Text>
        <Text>Your NFT has been securely transferred.</Text>
      </View>

      <LeoButton
        label="Done"
        type="secondary"
        className={`mt-auto ${bottomMargin}`}
        onPress={onDonePress}
      />
    </SafeAreaView>
  )
}

export default NFTSentScreen
