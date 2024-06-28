import { INFT } from '@src/types/nfts'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

interface NFTItemProps {
  item: INFT
  isSmallScreen: boolean
}

const NFTItem: React.FC<NFTItemProps> = ({ item, isSmallScreen }) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const imageSize = isSmallScreen ? 165 : 175
  const containerSize = isSmallScreen ? imageSize : imageSize + 25

  return (
    <TouchableOpacity
      className={`w-[${containerSize}px] h-[${containerSize}px] justify-center p-3 max-w-[50%]`}
      onPress={() =>
        router.push({
          pathname: '/nfts/nft-details',
          params: { nft: JSON.stringify(item) },
        })
      }
    >
      <View className="relative w-40 h-40 rounded-xl overflow-hidden">
        {isLoading && (
          <View
            className="absolute top-0 right-0 bottom-0 left-0 bg-gray-100 border"
            style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
          />
        )}
        <Image
          source={{ uri: item.imageURI }}
          className={`w-full h-full rounded-xl border ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
          width={imageSize}
          height={imageSize}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
      </View>
      <Text className="mt-1" numberOfLines={1}>
        {item.collectionName} #{item.mintNumber}
      </Text>
    </TouchableOpacity>
  )
}

export default React.memo(NFTItem)
