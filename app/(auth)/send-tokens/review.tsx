import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { capitalize } from 'lodash'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import ReviewScreen from '@src/screens/send-tokens/review'
import { formatBigInt } from '@src/utils/money'
import {
  initiatePublicTransferTransaction,
  initiateTransferTransaction,
} from '@src/lib/aleo/activity/transactions'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { AleoChainId } from '@src/lib/aleo'

const ReviewRoute = () => {
  const router = useRouter()
  const account = useAccount()
  const chainId = useChainId()
  const [isLoading, setIsLoading] = useState(false)

  const {
    token,
    amount,
    recipientAddress,
    sendType,
    receivedType,
    fee,
    feeType,
    delegateTransaction,
    setDelegateTransaction,
  } = useSendStateContext()

  const handleConfirm = () => {
    // Perform the confirmation logic here
    let initiatePromise: Promise<void>
    setIsLoading(true)
    if (sendType === 'private') {
      initiatePromise = initiateTransferTransaction(
        account,
        chainId as AleoChainId,
        amount!,
        recipientAddress!,
        fee!,
        feeType === 'private',
        delegateTransaction,
        receivedType === 'private',
      )
    } else {
      initiatePromise = initiatePublicTransferTransaction(
        account,
        chainId as AleoChainId,
        'credits.aleo',
        amount!,
        recipientAddress!,
        fee!,
        feeType === 'private',
        delegateTransaction,
        receivedType === 'private',
      )
    }
    initiatePromise
      .then(() => {
        router.replace('/transaction-initiated')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <ReviewScreen
      isLoading={isLoading}
      amount={formatBigInt(amount!)}
      fromAccount={account.name}
      toAddress={recipientAddress!}
      sendType={`${capitalize(sendType)} to ${capitalize(receivedType)}`}
      feeType={capitalize(feeType)}
      feeAmount={formatBigInt(fee!)}
      tokenSymbol={token.symbol}
      delegateTransaction={delegateTransaction}
      onDelegateTransactionChange={setDelegateTransaction}
      onConfirm={handleConfirm}
    />
  )
}

export default ReviewRoute
