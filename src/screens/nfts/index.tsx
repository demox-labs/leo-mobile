import React from 'react'
import { View } from 'react-native'

import NFTList from '@src/components/nft-list'
import { INFT } from '@src/types/nfts'
import AnimatedLoading from '@src/components/icons/animated/loading'

interface NFTsScreenProps {
  nfts: INFT[]
  isLoading: boolean
  isRefreshing: boolean
  onRefresh: () => void
}

const NFTsScreen: React.FC<NFTsScreenProps> = ({
  nfts,
  isLoading,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <View className="flex-1 bg-white p-4">
      {isLoading ? (
        <View className="items-center justify-center mt-[60%] relative">
          <AnimatedLoading isLoading={isLoading} size={50} />
        </View>
      ) : (
        <NFTList
          NFTs={nfts}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  )
}

export default NFTsScreen
