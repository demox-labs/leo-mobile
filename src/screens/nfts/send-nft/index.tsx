import { Keyboard, TouchableWithoutFeedback } from 'react-native'
import React, { useRef, useState } from 'react'
import LeoDivider from '@src/components/leo-divider'
import FeeInformation from '@src/components/fee-information'
import LeoInput from '@src/components/leo-input'
import LeoButton from '@src/components/leo-button'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'
import { ActionSheetRef } from 'react-native-actions-sheet'
import CustomizeFeeModal from '@src/components/customize-fee-modal'
import { SendConfig } from '@src/types/send'

interface SendNFTScreenProps {
  fee: string
  recommendedFee: string
  feeType: SendConfig
  onFeeDetailsSave: (feeType: SendConfig, feeAmount: string) => void
  onReviewPress: (recipiendAddress: string) => void
}

const SendNFTScreen: React.FC<SendNFTScreenProps> = ({
  fee,
  recommendedFee,
  feeType,
  onFeeDetailsSave,
  onReviewPress,
}) => {
  const customizeFeeModalRef = useRef<ActionSheetRef>(null)

  const [recipientAddress, setRecipientAddress] = useState('')

  const bottomMargin = useBottomMargin()

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        edges={['bottom']}
        className="flex flex-1 p-4 pb-0 bg-white"
      >
        <LeoInput
          label="Enter recipient Address"
          placeholder="Address"
          value={recipientAddress}
          onChangeText={setRecipientAddress}
        />
        <LeoDivider className="mt-auto" />
        <FeeInformation
          fee={fee}
          feeType={feeType}
          onCustomizeFeePress={() => customizeFeeModalRef.current?.show()}
        />
        <LeoButton
          label="Review"
          onPress={() => onReviewPress(recipientAddress)}
          disabled={!recipientAddress || !fee}
          className={`mt-4 ${bottomMargin}`}
        />

        <CustomizeFeeModal
          flow="send-nft"
          tokenName="ALEO"
          ref={customizeFeeModalRef}
          onSave={onFeeDetailsSave}
          defaultFeeAmount={fee}
          defaultFeeType={feeType as SendConfig}
          recommendedFee={recommendedFee}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SendNFTScreen
