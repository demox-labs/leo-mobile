import React from 'react'
import { View, Text, Image } from 'react-native'
import LeoButton from '@src/components/leo-button'
import { SafeAreaView } from 'react-native-safe-area-context'
import LeoDivider from '@src/components/leo-divider'
import useBottomMargin from '@src/hooks/useBottomMargin'
import EllipsizedAddress from '@src/components/ellipsized-address'

interface ReviewNFTScreenProps {
  nftImageURL: string
  nftName: string
  nftID: string
  fromAccount: string
  toAddress?: string
  feeType: string
  feeAmount?: string
  tokenSymbol?: string
  onConfirm: () => void
}

const ReviewNFTScreen: React.FC<ReviewNFTScreenProps> = ({
  nftImageURL,
  nftName,
  nftID,
  fromAccount,
  toAddress,
  feeType,
  feeAmount,
  tokenSymbol,
  onConfirm,
}) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView className="flex-1 bg-white px-4 " edges={['bottom']}>
      <View className="gap-1 justify-center items-center my-8">
        <Image
          source={{ uri: nftImageURL }}
          className="w-[80px] h-[80px] rounded-lg"
        />
        <Text className="text-xl">{nftName}</Text>
        <Text className="text-xl">#{nftID}</Text>
      </View>

      <View className="flex-row justify-between items-center my-1">
        <Text className="my-1 text-gray-600">From</Text>
        <Text className="my-1">You ({fromAccount})</Text>
      </View>

      <View className="flex-row justify-between items-center mt-1 mb-3">
        <Text className="text-gray-600">To</Text>
        <EllipsizedAddress address={toAddress} className="text-sm w-[80px]" />
      </View>
      <LeoDivider />

      <View className="flex-row justify-between items-start my-1 pb-4">
        <Text className="text-gray-600">Fee type</Text>
        <View className="flex-col items-end">
          <Text>{feeType}</Text>
          <Text className="text-gray-500 text-sm">
            {feeAmount} {tokenSymbol}
          </Text>
        </View>
      </View>
      <LeoDivider />

      <LeoButton
        label="Send"
        onPress={onConfirm}
        className={`mt-auto ${bottomMargin}`}
      />
    </SafeAreaView>
  )
}

export default ReviewNFTScreen
