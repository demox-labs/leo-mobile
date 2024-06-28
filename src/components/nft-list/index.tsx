import { View, Text, FlatList, Dimensions, RefreshControl } from 'react-native'
import React from 'react'

import { Feather } from '@expo/vector-icons'
import NFTItem from './nft-Item'
import { INFT } from '@src/types/nfts'
import { uniqueId } from 'lodash'

interface NFTListProps {
  NFTs: INFT[]
  isRefreshing: boolean
  onRefresh: () => void
}

interface RenderItemProps {
  item: INFT
  isSmallScreen: boolean
}
const renderItem = ({ item, isSmallScreen }: RenderItemProps) => (
  <NFTItem key={item.recordId} item={item} isSmallScreen={isSmallScreen} />
)

const keyExtractor = (item: INFT) => item.recordId?.toString() || uniqueId()

const ListEmptyComponent = (
  <View className="flex-1  justify-center py-2 items-center gap-y-4">
    <Feather name="image" size={40} />
    <Text className="text-medium font-bold">No NFTs yet</Text>
    <Text className="text-medium">
      You will see your NFT here once you have one.
    </Text>
  </View>
)

const NFTList: React.FC<NFTListProps> = ({ NFTs, isRefreshing, onRefresh }) => {
  const isSmallScreen = Dimensions.get('window').width < 450

  return (
    <FlatList<INFT>
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
      }}
      numColumns={2}
      data={NFTs}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={({ item }) => renderItem({ item, isSmallScreen })}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    />
  )
}

export default NFTList
