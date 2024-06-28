import React, { useLayoutEffect, useState } from 'react'
import CustomizeFeeScreen from '@src/screens/send-tokens/customize-fee'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import { convertStringToBigInt, formatBigInt } from '@src/utils/money'
import useAmount from '@src/hooks/useAmount'
import { useNavigation, useRouter } from 'expo-router'
import { BackButton } from '@src/components/navigation/back-button'

const CustomizeFeeRoute = () => {
  const router = useRouter()
  const navigation = useNavigation()

  const {
    token,
    fee,
    setFee,
    feeType,
    setFeeType,
    privateBalance,
    publicBalance,
    isPrivateFeeOptionDisabled,
    isPublicFeeOptionDisabled,
  } = useSendStateContext()

  const recommendedFee = formatBigInt(fee!)
  const defaultFeeAmount = formatBigInt(fee!)
  const defaultFeeType = feeType!
  const tokenName = token.name.toUpperCase()

  const hasPrivateTokens = privateBalance > 0
  const hasPublicTokens = publicBalance > 0

  const [feeAmount, , setFeeAmount] = useAmount({
    initialValue: defaultFeeAmount,
  })

  const [isPrivate, setIsPrivate] = useState(defaultFeeType === 'private')

  const handleResetState = () => {
    setFeeAmount(defaultFeeAmount)
    router.back()
  }

  const handleConvert = () => {
    router.replace('/convert-token/')
  }

  const handleConfirm = () => {
    const selectedFeeType = isPrivate ? 'private' : 'public'
    setFeeType(selectedFeeType)

    setFee(convertStringToBigInt(feeAmount))
    router.back()
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <BackButton onPress={handleResetState} />,
    })
  }, [])

  return (
    <CustomizeFeeScreen
      recommendedFee={recommendedFee}
      defaultFeeAmount={defaultFeeAmount}
      defaultFeeType={defaultFeeType}
      tokenName={tokenName}
      hasPrivateTokens={hasPrivateTokens}
      hasPublicTokens={hasPublicTokens}
      isPrivate={isPrivate}
      isPrivateFeeOptionDisabled={isPrivateFeeOptionDisabled}
      isPublicFeeOptionDisabled={isPublicFeeOptionDisabled}
      setIsPrivate={setIsPrivate}
      handleConfirm={handleConfirm}
      handleConvert={handleConvert}
    />
  )
}

export default CustomizeFeeRoute
