import LeoButton from '@src/components/leo-button'

import React from 'react'
import {
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native'

import LeoInput from '@src/components/leo-input'
import { convertStringToBigInt } from '@src/utils/money'
import useAmount from '@src/hooks/useAmount'
import { SendConfig } from '@src/types/send'
import { SafeAreaView } from 'react-native-safe-area-context'
import LeoToast from '@src/components/leo-toast'
import { capitalize } from '@src/utils/strings'
import LeoPressable from '@src/components/leo-pressable'
import Icon from '@src/components/icons'
import useBottomMargin from '@src/hooks/useBottomMargin'

interface NoTokensAlertProps {
  show: boolean
  alertType: 'private' | 'public'
  handleConvert: () => void
}
const NoTokensAlert: React.FC<NoTokensAlertProps> = ({
  show,
  alertType,
  handleConvert,
}) => {
  if (!show) return null

  const convertFrom = alertType === 'public' ? 'Public' : 'Private'
  const convertTo = alertType === 'public' ? 'Private' : 'Public'
  const message = `You have no ${convertFrom} tokens. Convert ${convertTo} tokens to ${convertFrom} to use them as Fee.`

  return (
    <LeoToast show type="warning" className="mb-4">
      <Text className={'flex-1 text-sm ml-3 max-w-[283px]'}>
        {message}
        <Pressable onPress={handleConvert}>
          <Text className={'text-blue-600'}>Convert now.</Text>
        </Pressable>
      </Text>
    </LeoToast>
  )
}

interface FeeOptionsProps {
  option: 'private' | 'public'
  onPress: () => void
  selected?: boolean
  disabled?: boolean
}
const FeeOptions: React.FC<FeeOptionsProps> = ({
  option,
  onPress,
  selected,
  disabled,
}) => {
  const optionTitle = capitalize(option) + ' Fee'
  const optionDescription =
    option === 'private'
      ? 'Het heeft niet alleen vijf eeuwen overleefd maar is ook, vrijwel onveranderd.'
      : 'Aldus PageMaker die versies van Lorem Ipsum   vijf eeuwen overleefd maar is ook, vrijwel.'

  const optionTitleTextStyles = `${disabled ? 'text-gray-400' : 'text-black'} `
  const optionDescriptionTextStyles = `${disabled ? 'text-gray-400' : 'text-gray-500'} text-sm max-w-[286px]`
  const containerStyles = `${selected ? 'border-black' : 'border-gray-100'} border border-solid flex mt-5 border-1 p-4 rounded-lg`

  return (
    <LeoPressable
      className={containerStyles}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="flex-row justify-between">
        <Text className={optionTitleTextStyles}>{optionTitle}</Text>
        {selected ? (
          <Icon name="checkbox-circle-fill" color="black" size={20} />
        ) : null}
      </View>
      <Text className={optionDescriptionTextStyles}>{optionDescription}</Text>
    </LeoPressable>
  )
}

interface CustomizeFeeScreenProps {
  recommendedFee?: string
  defaultFeeAmount: string
  defaultFeeType: SendConfig
  tokenName: string
  hasPrivateTokens: boolean
  hasPublicTokens: boolean
  isPrivate: boolean
  isPrivateFeeOptionDisabled: boolean
  isPublicFeeOptionDisabled: boolean
  setIsPrivate: (isPrivate: boolean) => void
  handleConvert: () => void
  handleConfirm: () => void
}
const CustomizeFeeScreen: React.FC<CustomizeFeeScreenProps> = ({
  recommendedFee,
  defaultFeeAmount,
  defaultFeeType,
  tokenName,
  hasPrivateTokens,
  hasPublicTokens,
  isPrivate,
  isPrivateFeeOptionDisabled,
  isPublicFeeOptionDisabled,
  setIsPrivate,
  handleConfirm,
  handleConvert,
}) => {
  const bottomMargin = useBottomMargin()

  const [feeAmount, , setFeeAmount] = useAmount({
    initialValue: defaultFeeAmount,
  })

  const feeAmountHasChanged = feeAmount !== defaultFeeAmount
  const feeTypeHasChanged = isPrivate !== (defaultFeeType === 'private')
  const valuesHaveNotChanged = !feeAmountHasChanged && !feeTypeHasChanged
  const isNotValidFee = !convertStringToBigInt(feeAmount)
  const isSaveButtonDisabled = isNotValidFee || valuesHaveNotChanged

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 pt-3 px-5 bg-white" edges={['bottom']}>
        <ScrollView className="flex-1">
          <NoTokensAlert
            show={!hasPrivateTokens}
            alertType="private"
            handleConvert={handleConvert}
          />

          <NoTokensAlert
            show={!hasPublicTokens}
            alertType="public"
            handleConvert={handleConvert}
          />

          <FeeOptions
            option="private"
            disabled={isPrivateFeeOptionDisabled}
            selected={isPrivate}
            onPress={() => setIsPrivate(true)}
          />
          <FeeOptions
            option="public"
            disabled={isPublicFeeOptionDisabled}
            selected={!isPrivate}
            onPress={() => setIsPrivate(false)}
          />

          <LeoInput
            label="Fee"
            help={`Recommended Fee: ${recommendedFee} ${tokenName}`}
            onChangeText={setFeeAmount}
            value={feeAmount}
            placeholder="0"
            customStyles={{ wrapper: 'my-5' }}
            rightLabel="ALEO"
            keyboardType="numeric"
          />
        </ScrollView>

        <LeoButton
          label="Confirm"
          disabled={isSaveButtonDisabled}
          onPress={handleConfirm}
          className={`mt-auto ${bottomMargin}`}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default CustomizeFeeScreen
