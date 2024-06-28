import LeoButton from '@src/components/leo-button'

import React, { Ref, useState } from 'react'
import { View, Text } from 'react-native'
import ActionSheet, {
  ActionSheetProps,
  ActionSheetRef,
} from 'react-native-actions-sheet'

import LeoInput from '@src/components/leo-input'
import RadioButton from '@src/components/leo-radio-button'
import { convertStringToBigInt } from '@src/utils/money'
import useAmount from '@src/hooks/useAmount'
import { SendConfig } from '@src/types/send'
// import LeoToast from './leo-toast'

interface CustomizeFeeModalProps extends ActionSheetProps {
  flow: 'send' | 'convert' | 'send-nft'
  defaultFeeAmount: string
  defaultFeeType: SendConfig
  recommendedFee?: string
  tokenName: string
  onSave: (feeType: SendConfig, feeAmount: string) => void
}

const CustomizeFeeModal = React.forwardRef(
  (props: CustomizeFeeModalProps, ref: Ref<ActionSheetRef>) => {
    const {
      flow,
      defaultFeeAmount,
      defaultFeeType,
      recommendedFee,
      tokenName,
      onSave,
    } = props

    const [isPrivate, setIsPrivate] = useState(defaultFeeType === 'private')

    const [feeAmount, , setFeeAmount] = useAmount({
      initialValue: defaultFeeAmount,
    })

    const handleResetState = () => {
      setFeeAmount(defaultFeeAmount)
    }

    const handleSave = () => {
      onSave(isPrivate ? 'private' : 'public', feeAmount)
      ;(ref as React.RefObject<ActionSheetRef>).current?.hide()
    }

    const feeAmountHasChanged = feeAmount !== defaultFeeAmount
    const feeTypeHasChanged = isPrivate !== (defaultFeeType === 'private')
    const valuesHaveNotChanged = !feeAmountHasChanged && !feeTypeHasChanged
    const isNotValidFee = !convertStringToBigInt(feeAmount)
    const isSaveButtonDisabled = isNotValidFee || valuesHaveNotChanged

    return (
      <ActionSheet
        {...props}
        ref={ref}
        useBottomSafeAreaPadding
        snapPoints={[110]}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="mt-3 px-5">
          <View className="w-full">
            <Text className="font-semibold text-lg mb-5">
              Customize transaction fee
            </Text>

            <Text className="font-semibold text-medium mb-5">Fee type</Text>
            <RadioButton
              isSelected={isPrivate}
              label="Private"
              onPress={() => setIsPrivate(true)}
            />
            <RadioButton
              isSelected={!isPrivate}
              label="Public"
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
          </View>

          {/* TODO: Uncomment when ready */}
          {/* <LeoToast
            show={flow === 'send'}
            type="info"
            message={`Insufficient credits will automatically trigger a conversion with an associated fee of ${recommendedFee} ${tokenName}.`}
          /> */}

          <View
            className={`flex-row gap-2 mb-5  ${flow === 'send' ? 'mt-14' : ''}`}
          >
            <LeoButton
              fullWidth={false}
              label="Cancel"
              type="secondary"
              onPress={() => {
                handleResetState()
                ;(ref as React.RefObject<ActionSheetRef>).current?.hide()
              }}
            />
            <LeoButton
              fullWidth={false}
              label="Save"
              disabled={isSaveButtonDisabled}
              onPress={handleSave}
            />
          </View>
        </View>
      </ActionSheet>
    )
  },
)

CustomizeFeeModal.displayName = 'CustomizeFeeModal'

export default CustomizeFeeModal
