import React from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View,
  Text,
} from 'react-native'
import LeoButton, { LeoButtonProps } from '@src/components/leo-button'
import { SafeAreaView } from 'react-native-safe-area-context'
import useVerticalOffset from '@src/hooks/useVerticalOffset'
import Icon from '@src/components/icons'
import TokenAndUsdAmount from '@src/components/token-and-usd-amount'
import useAmount from '@src/hooks/useAmount'

interface MinimumPurchaseAmountAlertProps {
  usdAmount?: string
}
const MinimumPurchaseAmountAlert: React.FC<MinimumPurchaseAmountAlertProps> = ({
  usdAmount,
}) => {
  if (usdAmount && Number(usdAmount) < 5) {
    return (
      <View className="flex-row items-center justify-center mt-[38px]">
        <Icon name="info" size={16} className="mr-1" color="red-500" />
        <Text className="text-sm text-red-500">Minimum purchase is $5.00</Text>
      </View>
    )
  }
  return null
}

interface AmountScreenProps {
  tokenSymbol: string
  tokenPrice?: number
  onNextPress: (tokenAmount: string) => void
}

const AmountScreen: React.FC<AmountScreenProps> = ({
  tokenSymbol,
  tokenPrice,
  onNextPress,
}) => {
  const verticalOffset = useVerticalOffset()

  const [tokenAmount, , setTokenAmount] = useAmount({
    initialValue: undefined,
  })
  const [usdAmount, , setUSDAmount] = useAmount({
    initialValue: undefined,
  })

  // Button props for the next button
  const nextButtonProps: LeoButtonProps = {
    label: 'Next',
    type: 'primary',
    onPress: () => onNextPress(tokenAmount!),
    className: 'mt-auto mb-5',
    disabled: !tokenAmount || Number(usdAmount) < 15,
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={verticalOffset}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 px-5 pt-8 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1" edges={['bottom']}>
          <TokenAndUsdAmount
            tokenSymbol={tokenSymbol}
            tokenPrice={tokenPrice}
            tokenAmount={tokenAmount}
            setTokenAmount={setTokenAmount}
            usdAmount={usdAmount}
            setUSDAmount={setUSDAmount}
            renderPresetOptions
            className="my-auto"
          />
          <MinimumPurchaseAmountAlert usdAmount={usdAmount} />
          <LeoButton {...nextButtonProps} />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default AmountScreen
