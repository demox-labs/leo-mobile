import React, { useState } from 'react'
// import { useNavigation } from 'expo-router'

import ReviewScreen from '@src/screens/convert-token/review'
import { router, useLocalSearchParams } from 'expo-router'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { AleoChainId } from '@src/lib/aleo/types'
import {
  initiatePublicTransferTransaction,
  initiateTransferTransaction,
} from '@src/lib/aleo/activity/transactions'
import { ALEO_MICROCREDITS_TO_CREDITS } from '@src/lib/fiat-currency/consts'
import useSettingsStore from '@src/state/zustand/settings'

type ReviewRouteParams = {
  amount: string
  feeAmount: string
  convertType: string
  feeType: 'private' | 'public'
}

const ReviewRoute = () => {
  const account = useAccount()
  const chainId = useChainId()
  const { isDelegateTransactionsByDefaultEnabled } = useSettingsStore()
  const [delegateTransaction, setDelegateTransaction] = useState(
    isDelegateTransactionsByDefaultEnabled,
  )
  const [isLoading, setIsLoading] = useState(false)
  // TODO actually use this
  //const { authorizeTransaction } = useAleoClient()

  const { amount, feeAmount, feeType, convertType } =
    useLocalSearchParams<ReviewRouteParams>()

  const amountAsBigInt = BigInt(
    Math.floor(Number(amount) * ALEO_MICROCREDITS_TO_CREDITS),
  )
  const feeAmountAsBigInt = BigInt(
    Math.floor(Number(feeAmount) * ALEO_MICROCREDITS_TO_CREDITS),
  )

  const handleConvertPress = async () => {
    try {
      setIsLoading(true)
      if (convertType == 'Public to Private') {
        await initiatePublicTransferTransaction(
          account,
          chainId as AleoChainId,
          'credits.aleo',
          amountAsBigInt,
          account.publicKey,
          feeAmountAsBigInt,
          feeType === 'private',
          delegateTransaction,
          true,
        )
      } else {
        await initiateTransferTransaction(
          account,
          chainId as AleoChainId,
          amountAsBigInt,
          account.publicKey,
          feeAmountAsBigInt,
          feeType === 'private',
          delegateTransaction,
          false,
        )
      }
    } catch (error: any) {
      console.log(error)
      // TODO handle errors
    }
    // Can reuse the screen for both conversion and sending tokens
    setIsLoading(false)
    router.replace('/transaction-initiated')
  }

  return (
    <ReviewScreen
      isLoading={isLoading}
      fee={{ amount: feeAmount!, type: feeType! }}
      amount={amount!}
      tokenSymbol="ALEO"
      convertType={convertType!}
      onConvertPress={handleConvertPress}
      delegateTransaction={delegateTransaction}
      onDelegateTransactionChange={setDelegateTransaction}
    />
  )
}

export default ReviewRoute
