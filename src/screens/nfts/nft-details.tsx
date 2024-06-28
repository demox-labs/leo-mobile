import React, { useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  ListRenderItem,
  Linking,
  TouchableOpacity,
} from 'react-native'

import { router, useLocalSearchParams } from 'expo-router'

import { INFTAttribute } from '@src/types/nfts'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'

type ImageItem = {
  type: 'image'
  imageURI: string // URL to the image
}

type LeoButtonItem = {
  type: 'sendButton'
}

type NameItem = {
  type: 'name'
  collectionName: string
  mintNumber: string
}

type CollectionDescriptionItem = {
  type: 'description'
  description: string
}

type VisibilityItem = {
  type: 'visibility'
  isPrivate: boolean
}

type AttributesItem = {
  type: 'attributes'
  attributes: INFTAttribute[]
}

type NFTIDItem = {
  type: 'nftID'
  id: string
}

type CollectionSourceItem = {
  type: 'collectionSource'
  sourceLink: string
}

type NFTDetailItem =
  | ImageItem
  | LeoButtonItem
  | NameItem
  | CollectionDescriptionItem
  | VisibilityItem
  | AttributesItem
  | NFTIDItem
  | CollectionSourceItem

const ImageItemComponent = ({ imageURI }: { imageURI: string }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <View className="relative w-full h-96 my-3 rounded-xl">
      {true && (
        <View
          className="absolute top-0 right-0 bottom-0 left-0 bg-gray-100 rounded-xl border"
          style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
        />
      )}
      <Image
        source={{ uri: imageURI }}
        className={`absolute top-0 right-0 bottom-0 left-0 w-full h-96 object-cover rounded-xl border ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  )
}

const NFTDetails = () => {
  const { nft } = useLocalSearchParams<{ nft: string }>()
  const nftJSON = JSON.parse(nft!)

  const openURL = (url: string) => {
    // Check if the link is supported
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url)
        } else {
          console.log(`Don't know how to open this URL: ${url}`)
        }
      })
      .catch(err => console.error('An error occurred', err))
  }

  const renderItem: ListRenderItem<NFTDetailItem> = ({ item }) => {
    switch (item.type) {
      case 'image':
        return <ImageItemComponent imageURI={item.imageURI} />
      case 'sendButton':
        return (
          <LeoButton
            label="Send NFT"
            onPress={() => {
              router.push({
                pathname: '/send-nft',
                params: {
                  nft: JSON.stringify(nftJSON),
                },
              } as never)
            }}
            className="w-full my-2"
          />
        )
      case 'name':
        return (
          <Text className="text-xl font-bold mb-2">
            {item.collectionName} #{item.mintNumber}
          </Text>
        )
      case 'description':
        return (
          <Text className="text-base mb-5">
            {nftJSON.collectionDescription}
          </Text>
        )
      case 'visibility':
        return (
          <View className="flex-row mb-5">
            <Icon
              name={`image-${item.isPrivate ? 'private' : 'public'}`}
              width={24}
              height={24}
            />
            <Text className="text-base ml-2">{`${
              item.isPrivate ? 'Private' : 'Public'
            } NFT`}</Text>
          </View>
        )
      case 'attributes':
        return (
          <View className="justify-between mb-5">
            <Text className="text-lg text-gray-600 mb-2">Attributes</Text>
            {item.attributes.map((attribute, index) => {
              return (
                <View className="flex-row justify-between mb-2" key={index}>
                  <Text className="text-base text-gray-400">
                    {attribute.trait_type}
                  </Text>
                  <Text className="text-base text-gray-400">
                    {attribute.value}
                  </Text>
                </View>
              )
            })}
          </View>
        )
      case 'nftID':
        return (
          <View className="flex-row justify-between mb-5">
            <Text className="text-lg text-gray-600">NFT ID</Text>
            <Text className="text-lg text-gray-600">{item.id}</Text>
          </View>
        )
      case 'collectionSource':
        return (
          <View className="flex-row justify-between mb-5">
            <Text className="text-lg text-gray-600">Source</Text>
            <TouchableOpacity onPress={() => openURL(item.sourceLink)}>
              <Text className="text-lg text-primary-500">Source Link</Text>
            </TouchableOpacity>
          </View>
        )
      default:
        return null
    }
  }

  const nftDetails: NFTDetailItem[] = [
    {
      type: 'image',
      imageURI: nftJSON.imageURI,
    },
    // {
    //   type: 'sendButton',
    // },
    {
      type: 'name',
      collectionName: nftJSON.collectionName,
      mintNumber: nftJSON.mintNumber,
    },
    {
      type: 'description',
      description: nftJSON.collectionDescription,
    },
    {
      type: 'visibility',
      isPrivate: nftJSON.isPrivate,
    },
    {
      type: 'attributes',
      attributes: nftJSON.attributes,
    },
    {
      type: 'nftID',
      id: nftJSON.tokenId,
    },
    {
      type: 'collectionSource',
      sourceLink: nftJSON.sourceLink,
    },
  ]

  return (
    <View className="bg-white flex-1 pl-3 pr-0">
      <FlatList<NFTDetailItem>
        data={nftDetails}
        renderItem={renderItem}
        className="px-0"
        contentContainerStyle={{
          paddingRight: 12,
        }}
      />
    </View>
  )
}

export default NFTDetails
