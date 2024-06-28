import React from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import {} from // initiatePublicTransferTransaction,
// initiateTransferTransaction,
'@src/lib/aleo/activity/transactions'
import {
  useAccount,
  // useChainId
} from '@src/lib/aleo/ready'
// import { AleoChainId } from '@src/lib/aleo'
import ReviewNFTScreen from '@src/screens/nfts/send-nft/review'

const ReviewRoute = () => {
  const router = useRouter()
  const account = useAccount()
  // const chainId = useChainId()

  const { nft, fee, feeType, recipientAddress, tokenSymbol } =
    useLocalSearchParams<{
      nft: string
      fee: string
      feeType: string
      recipientAddress: string
      tokenSymbol: string
    }>()

  const nftJSON = JSON.parse(nft || '{}')

  const handleConfirm = () => {
    // Perform the send

    // initiatePromise.then(() => {
    //   router.replace('/send-nft/nft-sent')
    // })

    router.replace('/send-nft/nft-sent')
  }

  return (
    <ReviewNFTScreen
      nftImageURL={nftJSON.imageURI}
      nftName={nftJSON.collectionName}
      nftID={nftJSON.recordId}
      fromAccount={account.name}
      toAddress={recipientAddress}
      feeType={capitalize(feeType)}
      feeAmount={fee}
      tokenSymbol={tokenSymbol}
      onConfirm={handleConfirm}
    />
  )
}

export default ReviewRoute
