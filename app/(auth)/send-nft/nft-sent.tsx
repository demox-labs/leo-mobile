import React from 'react'
import { useRouter } from 'expo-router'
import NFTSentScreen from '@src/screens/nfts/send-nft/sent'

const TransactionDetailsRoute = () => {
  const router = useRouter()

  const onDonePress = () => {
    router.replace('/home')
  }

  return <NFTSentScreen onDonePress={onDonePress} />
}

export default TransactionDetailsRoute
