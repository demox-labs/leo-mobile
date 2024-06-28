import React, { useEffect, useLayoutEffect, useState } from 'react'
import NFTsScreen from '@src/screens/nfts'
import { INFT } from '@src/types/nfts'
import {
  fetchPublicNFTs,
  fetchRecordsAsNFTs,
} from '@src/lib/aleo/activity/fetch'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { AleoChainId } from '@src/lib/aleo/types'
import { useNavigation } from 'expo-router'
import { View, Text } from 'react-native'

// const MockNFTS: INFT[] = [
//   {
//     recordId: '1',
//     tokenId: 'abc123',
//     programId: 'program1',
//     symbol: 'NFTSYMB',
//     imageURI:
//       'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg?t=st=1719444465~exp=1719448065~hmac=ba74712cc2f062f4c3c73aace44ad1fb29ea1a78ebfb8b10a4fd2d7b43965694&w=1060',
//     timestamp: 1622548800000,
//     edition: 'First Edition',
//     transactionId: 'txn123',
//     isPrivate: false,
//     collectionDescription: 'A collection of digital art',
//     collectionName: 'Digital Art Collection',
//     collectionLink: 'https://example.com/collection/digital-art',
//     sourceLink: 'https://source.example.com/nft1',
//     explorerLink: 'https://explorer.example.com/txn123',
//     mintNumber: 1,
//     attributes: [
//       { trait_type: 'Color', value: 'Blue' },
//       { trait_type: 'Size', value: 'Large' },
//     ],
//   },
//   {
//     recordId: '2',
//     tokenId: 'def456',
//     programId: 'program2',
//     symbol: 'NFTICO',
//     imageURI:
//       'https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149622021.jpg?t=st=1719444465~exp=1719448065~hmac=ba74712cc2f062f4c3c73aace44ad1fb29ea1a78ebfb8b10a4fd2d7b43965694&w=1060',
//     timestamp: 1625130800000,
//     edition: 'Second Edition',
//     transactionId: 'txn456',
//     isPrivate: true,
//     collectionDescription: 'A collection of rare items',
//     collectionName: 'Rare Items Collection',
//     collectionLink: 'https://example.com/collection/rare-items',
//     sourceLink: 'https://source.example.com/nft2',
//     explorerLink: 'https://explorer.example.com/txn456',
//     mintNumber: 2,
//     attributes: [
//       { trait_type: 'Material', value: 'Gold' },
//       { trait_type: 'Weight', value: '2kg' },
//     ],
//   },
// ]
const NFTsRoute = () => {
  const navigation = useNavigation()

  const chainId = useChainId()
  const account = useAccount()
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [nfts, setNfts] = useState<INFT[]>([])

  const handleRefresh = () => {
    if (refreshing) {
      return
    }
    getNfts(false)
  }

  const getNfts = async (isInitialLoad: boolean) => {
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    let privateNFTs: INFT[] = []
    let publicNFTs: INFT[] = []
    try {
      privateNFTs =
        (await fetchRecordsAsNFTs(
          chainId as AleoChainId,
          account.publicKey,
          account.viewKey,
        )) ?? []
    } catch (err) {
      console.log('Failed to fetch private NFTs: ', err)
    }
    try {
      publicNFTs =
        (await fetchPublicNFTs(chainId as AleoChainId, account.publicKey)) ?? []
    } catch (err) {
      console.log('Failed to fetch public NFTs: ', err)
    }

    setNfts([...privateNFTs, ...publicNFTs])
    if (isInitialLoad) {
      setLoading(false)
    } else {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    getNfts(true)
  }, [chainId, account.publicKey])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerTitle: () => (
        <View className="flex-row w-full">
          <Text className="text-black-800 font-bold text-2xl">NFTs</Text>
          <View className="bg-gray-100 ml-3 px-3 rounded-lg items-center justify-center">
            <Text className="font-bold">{nfts.length}</Text>
          </View>
        </View>
      ),
    })
  }, [navigation, nfts.length])

  return (
    <NFTsScreen
      nfts={nfts ?? []}
      isLoading={loading}
      isRefreshing={refreshing}
      onRefresh={handleRefresh}
    />
  )
}

export default NFTsRoute
