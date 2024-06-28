import React, { useMemo, useState } from 'react'
import ConvertTokenScreen from '@src/screens/convert-token'
import { convertStringToBigInt, formatBigInt } from '@src/utils/money'
import useAmount from '@src/hooks/useAmount'
import { useBalance } from '@src/lib/aleo/assets/balance'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { DEFAULT_FEES } from '@src/lib/aleo/assets/default-fees'
import { CREDITS_PROGRAM_ID } from '@src/lib/aleo/programs/credits-program'
import { useRouter } from 'expo-router'

const ConvertTokenRoute = () => {
  const router = useRouter()
  const account = useAccount()
  const chainId = useChainId()

  const { data: fetchPublicBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    true,
    false,
    true,
  )
  const publicBalance = fetchPublicBalance ? fetchPublicBalance : BigInt(0)
  const { data: fetchedPrivateBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    false,
    true,
    true,
  )
  const privateBalance = fetchedPrivateBalance ?? BigInt(0)

  const [isPublicToken, setIsPublicToken] = useState(true)
  const availableBalance = isPublicToken ? publicBalance : privateBalance

  const [feeAmount, setFeeAmount] = useState(
    formatBigInt(DEFAULT_FEES[CREDITS_PROGRAM_ID].transfer_private_to_public),
  )
  const [feeType, setFeeType] = useState('public')

  const availableForConversion = useMemo(() => {
    return availableBalance - convertStringToBigInt(feeAmount)
  }, [availableBalance, feeAmount])

  const [amountToConvert, amountBigInt, setAmountToConvert] = useAmount({
    availableBalance: availableForConversion,
  })

  const handleSwitchToken = () => {
    setIsPublicToken(!isPublicToken)
    setAmountToConvert('')
  }

  const handleSaveFeeDetails = (feeType: string, feeAmount: string) => {
    setFeeType(feeType)
    setFeeAmount(feeAmount)
  }

  const handleNext = () => {
    router.push({
      pathname: '/convert-token/review',
      params: {
        amount: amountToConvert,
        feeAmount: feeAmount,
        feeType: feeType,
        convertType: isPublicToken ? 'Public to Private' : 'Private to Public',
      },
    })
  }

  const continueDisabled = amountBigInt === BigInt(0)

  return (
    <ConvertTokenScreen
      publicBalance={publicBalance}
      privateBalance={privateBalance}
      isPublicToken={isPublicToken}
      amountToConvert={amountToConvert}
      convertedValue={amountToConvert} // TODO: This field is redundant as it is exactly the same as the amountToConvert - Remove it and use amountToConvert instead or remove the 2nd field "You will get" from the UI
      feeAmount={feeAmount}
      feeType={feeType}
      isContinueButtonDisabled={continueDisabled}
      onAmountToConvertChange={setAmountToConvert}
      onSwitchToken={handleSwitchToken}
      onFeeDetailsSave={handleSaveFeeDetails}
      onNext={handleNext}
      onCancel={router.back}
    />
  )
}

export default ConvertTokenRoute
