import { AntDesign } from '@expo/vector-icons'
import Header from '@src/components/header'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'
import React, { useRef } from 'react'
import { View, Text, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomizeFeeModal from '@src/components/customize-fee-modal'
import { ActionSheetRef } from 'react-native-actions-sheet'
import { convertStringToBigInt, formatBigInt } from '@src/utils/money'

import LeoDivider from '@src/components/leo-divider'
import FeeInformation from '@src/components/fee-information'
import { SendConfig } from '@src/types/send'

interface ConvertTokenScreenProps {
  publicBalance: bigint
  privateBalance: bigint
  isPublicToken: boolean
  amountToConvert: string
  convertedValue: string // TODO: This field is redundant as it is exactly the same as the amountToConvert - Remove it and use amountToConvert instead or remove the 2nd field "You will get" from the UI
  feeAmount: string
  feeType: string
  isContinueButtonDisabled: boolean
  onAmountToConvertChange: (value: string) => void
  onSwitchToken: () => void
  onFeeDetailsSave: (feeType: string, feeAmount: string) => void
  onNext: () => void
  onCancel: () => void
}

const ConvertTokenScreen: React.FC<ConvertTokenScreenProps> = ({
  publicBalance,
  privateBalance,
  isPublicToken,
  amountToConvert,
  convertedValue,
  feeAmount,
  feeType,
  isContinueButtonDisabled,
  onAmountToConvertChange,
  onSwitchToken,
  onFeeDetailsSave,
  onNext,
  onCancel,
}) => {
  const customizeFeeModalRef = useRef<ActionSheetRef>(null)

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="px-4 flex-1 bg-white">
        <Header title="Convert" />
        <LeoInput
          label="Amount to convert"
          placeholder="0"
          help={`Available: ${
            isPublicToken
              ? formatBigInt(publicBalance)
              : formatBigInt(privateBalance)
          } ALEO`}
          rightLabel={isPublicToken ? 'Public ALEO' : 'Private ALEO'}
          onChangeText={onAmountToConvertChange}
          value={amountToConvert}
          customStyles={{ wrapper: 'mt-10' }}
          keyboardType="numeric"
        />

        <LeoButton className="my-7" type="secondary" onPress={onSwitchToken}>
          <View className="my-7 h-full items-center justify-center flex-row">
            <AntDesign name="arrowup" size={22} />
            <Text className="text-center text-base font-medium mx-3">
              Switch
            </Text>
            <AntDesign name="arrowdown" size={22} />
          </View>
        </LeoButton>

        <LeoInput
          label="You will get"
          placeholder="0"
          rightLabel={isPublicToken ? 'Private ALEO' : 'Public ALEO'}
          value={convertedValue}
          keyboardType="numeric"
          editable={false}
        />

        <View className="flex-1 justify-end">
          <LeoDivider />

          <FeeInformation
            fee={feeAmount}
            feeType={feeType}
            onCustomizeFeePress={() => customizeFeeModalRef.current?.show()}
            disabled={!convertStringToBigInt(amountToConvert)}
          />

          <View className="flex-row gap-2 mb-5">
            <LeoButton
              fullWidth={false}
              label="Cancel"
              type="secondary"
              onPress={onCancel}
            />
            <LeoButton
              fullWidth={false}
              label="Next"
              onPress={onNext}
              disabled={isContinueButtonDisabled}
            />
          </View>
        </View>

        <CustomizeFeeModal
          flow="convert"
          tokenName="ALEO"
          ref={customizeFeeModalRef}
          onSave={onFeeDetailsSave}
          defaultFeeAmount={feeAmount}
          defaultFeeType={feeType as SendConfig}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default ConvertTokenScreen
