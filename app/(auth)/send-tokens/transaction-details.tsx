import React from 'react'
import { useRouter } from 'expo-router'
import TransactionDetailsScreen from '@src/screens/send-tokens/review/transaction-details'
import { capitalize } from '@src/utils/strings'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import { formatBigInt } from '@src/utils/money'

const TransactionDetailsRoute = () => {
  const router = useRouter()

  const { token, amount, fee, sendType, receivedType } = useSendStateContext()

  const received = amount! - fee!

  const mockedSteps = [
    {
      step: 1,
      text: `Convert ${formatBigInt(amount!)} ${capitalize(
        sendType,
      )} to ${capitalize(receivedType)}`,
      description: `Fee: ${formatBigInt(fee!)} ${token.symbol}`,
    },
    {
      step: 2,
      text: `Send ${formatBigInt(amount!)} ${capitalize(sendType)} ${
        token.symbol
      }`,
      description: `Fee: ${formatBigInt(fee!)} ${token.symbol}`,
    },
    {
      step: 3,
      text: `User receives ${formatBigInt(received)} ${capitalize(
        receivedType,
      )} ${token.symbol}`,
    },
  ]

  return (
    <TransactionDetailsScreen steps={mockedSteps} onCancelPress={router.back} />
  )
}

export default TransactionDetailsRoute
