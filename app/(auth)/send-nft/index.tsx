import React, { useCallback, useState } from 'react'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'react-native'
import SendNFTScreen from '@src/screens/nfts/send-nft'
import { SendConfig } from '@src/types/send'
import { DEFAULT_FEES } from '@src/lib/aleo/assets/default-fees'
import { CREDITS_PROGRAM_ID } from '@src/lib/aleo/programs/credits-program'
import { formatBigInt } from '@src/utils/money'

const SendNFTRoute = () => {
  const router = useRouter()
  const { nft } = useLocalSearchParams<{ nft: string }>()
  const nftJSON = JSON.parse(nft ?? '{}')

  const defaultFee = DEFAULT_FEES[CREDITS_PROGRAM_ID].transfer_public
  const recommendedFee = formatBigInt(defaultFee)

  const [fee, setFee] = useState<string | undefined>(formatBigInt(defaultFee))
  const [feeType, setFeeType] = useState<SendConfig | undefined>('public')

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  const onReviewPress = (recipientAddress: string) => {
    router.push({
      pathname: '/send-nft/review',
      params: {
        recipientAddress,
        nft: JSON.stringify(nftJSON),
        fee: fee,
        feeType,
        tokenSymbol: nftJSON.symbol,
      },
    } as never)
  }

  const onFeeDetailsSave = (feeType: SendConfig, feeAmount: string) => {
    setFeeType(feeType)
    setFee(feeAmount)
  }

  return (
    <SendNFTScreen
      fee={fee ?? recommendedFee}
      recommendedFee={recommendedFee}
      feeType={'public'}
      onFeeDetailsSave={onFeeDetailsSave}
      onReviewPress={onReviewPress}
    />
  )
}

export default SendNFTRoute
