import React, { useRef, useState } from 'react'
import LeoButton from '@src/components/leo-button'
// import { Ionicons } from '@expo/vector-icons'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { formatBigInt } from '@src/utils/money'
// import TransactionStep from '@src/components/send/transaction-step'
import { SendConfig } from '@src/types/send'
// import { capitalize } from '@src/utils/strings'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import LeoDivider from '@src/components/leo-divider'
import FeeInformation from '@src/components/fee-information'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet'
import TokenAndUsdAmount from '@src/components/token-and-usd-amount'
import TogglePrivacy from '@src/components/send/toggle-privacy'
import Icon from '@src/components/icons'
import colors from 'tailwind.config.colors'
import useVerticalOffset from '@src/hooks/useVerticalOffset'

interface AmountScreenProps {
  tokenAmount: string
  usdAmount: string
  fee: string
  feeType: SendConfig
  availableBalance: bigint
  currentAmountString: string
  privateRecordsAmount: number
  privateBalance: bigint
  publicBalance: bigint
  tokenSymbol: string
  tokenPrice?: number
  sendType: SendConfig
  setSendType: (type: SendConfig) => void
  receivedType: SendConfig
  setReceivedType: (type: SendConfig) => void
  isContinueDisabled: boolean
  updateTokenAmount: (amount: string) => void
  updateUSDAmount: (amount: string) => void
  openPrivacyConfigModal: () => void
  onNoTokensReadMore: () => void
  onCustomizeFeePress: () => void
  onContinuePress: () => void
  onCancelPress: () => void
}
const AmountScreen: React.FC<AmountScreenProps> = ({
  tokenAmount,
  usdAmount,
  fee,
  feeType,
  availableBalance,
  // currentAmountString,
  privateRecordsAmount,
  privateBalance,
  publicBalance,
  tokenSymbol,
  tokenPrice,
  sendType,
  setSendType,
  receivedType,
  setReceivedType,
  isContinueDisabled,
  updateTokenAmount,
  updateUSDAmount,
  openPrivacyConfigModal,
  onNoTokensReadMore,
  onCustomizeFeePress,
  onContinuePress,
  onCancelPress,
}) => {
  const verticalOffset = useVerticalOffset()

  // const availableAleoCreditsBottomSheetRef = useRef<ActionSheetRef>(null)
  const noTokensBottomSheetRef = useRef<ActionSheetRef>(null)

  const [noTokenAvailableType, setNoTokenAvailableType] = useState<
    'Private' | 'Public'
  >()

  const handlePresentModalPress = (option: 'available' | 'fee') => {
    Keyboard.dismiss()
    if (option === 'available') {
      // availableAleoCreditsBottomSheetRef.current?.show()
    } else {
      onCustomizeFeePress()
    }
  }

  const setMax = () => updateTokenAmount(formatBigInt(availableBalance))

  const handlePrivate = () => {
    if (formatBigInt(privateBalance) === '0') {
      setNoTokenAvailableType('Private')
      noTokensBottomSheetRef.current?.show()
    } else {
      setSendType('private')
      setReceivedType('private')
    }
  }
  const handlePublic = () => {
    if (formatBigInt(publicBalance) === '0') {
      setNoTokenAvailableType('Public')
      noTokensBottomSheetRef.current?.show()
    } else {
      setSendType('public')
      setReceivedType('public')
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={verticalOffset}
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView className="flex-1 bg-white px-4">
            <TogglePrivacy
              sendType={sendType}
              receivedType={receivedType}
              onPressPrivate={handlePrivate}
              onPressPublic={handlePublic}
              onPressAdvanced={openPrivacyConfigModal}
              disablePrivate={
                formatBigInt(privateBalance) === '0' || privateRecordsAmount < 2
              }
              disablePublic={formatBigInt(publicBalance) === '0'}
            />
            <TokenAndUsdAmount
              tokenSymbol={tokenSymbol}
              tokenPrice={tokenPrice}
              tokenAmount={tokenAmount}
              setTokenAmount={updateTokenAmount}
              usdAmount={usdAmount}
              setUSDAmount={updateUSDAmount}
              className="my-auto"
            />
            <View className="flex-row gap-1 items-center justify-between mt-auto">
              <View>
                <View className="flex-row gap-1 mb-2">
                  <Icon name="lock" color={colors.gray['300']} size={16} />
                  <Text className="text-xs text-gray-600">
                    0.00 (TODO: Implement)
                  </Text>
                </View>
                <View className="flex-row gap-1">
                  <Icon name="globe" color="black" size={16} />
                  <Text className="text-xs text-gray-600">
                    15.00 (TODO: Implement)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={setMax}
                className="border border-gray-100 rounded-3xl py-2 px-6 flex items-center justify-center"
              >
                <Text className="text-lg">Max</Text>
              </TouchableOpacity>
            </View>
            {/* <LeoInput
              label={<TransactionStep step={2} text="Amount" />}
              customStyles={{ wrapper: 'w-full mb-4 pt-4' }}
              value={currentAmountString}
              onChangeText={updateTokenAmount}
              placeholder="0"
              keyboardType="numeric"
              rightButton={{
                label: 'Max',
                onPress: setMax,
                type: 'secondary',
              }}
              help={
                <View className="flex-row gap-1 items-center">
                  <Text className="text-xs text-gray-600">
                    Available: {formatBigInt(availableBalance)} {tokenSymbol}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handlePresentModalPress('available')}
                    hitSlop={{
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10,
                    }}
                  >
                    <Icon
                      name="information"
                      size={13}
                      className="ml-1"
                      color={colors?.gray?.['600']}
                    />
                  </TouchableOpacity>
                </View>
              }
            /> */}
            <LeoDivider className="mt-5" />
            <FeeInformation
              fee={fee}
              feeType={feeType}
              onCustomizeFeePress={() => handlePresentModalPress('fee')}
              disabled={false}
            />
            <View className="flex-row gap-2 mb-5">
              <LeoButton
                label="Cancel"
                onPress={onCancelPress}
                type="secondary"
                fullWidth={false}
              />
              <LeoButton
                label="Next"
                onPress={onContinuePress}
                disabled={isContinueDisabled}
                fullWidth={false}
              />
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ActionSheet
        ref={noTokensBottomSheetRef}
        useBottomSafeAreaPadding
        snapPoints={[90]}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="flex flex-col px-5 py-4">
          <Text className="font-semibold text-lg mb-2">
            No {noTokenAvailableType} tokens
          </Text>
          {/* <View className="mb-[42px]">
            <Text>To send {noTokenAvailableType} tokens you need to tranfer private/public credits to your wallet. Read more</Text>
          </View> */}

          <View className="mb-[42px]">
            <Text style={{ lineHeight: 20 }}>
              {noTokenAvailableType === 'Private' && privateRecordsAmount < 2
                ? 'To send Private tokens you should have two records. You need to transfer private/public credits to your wallet.'
                : `To send ${noTokenAvailableType} tokens you need to transfer private/public credits to your wallet.`}
              <Text className="text-blue-600" onPress={onNoTokensReadMore}>
                {' '}
                Read more.
              </Text>
            </Text>
          </View>

          <LeoButton
            label={'Close'}
            onPress={() => noTokensBottomSheetRef.current?.hide()}
            type="secondary"
            className="mt-auto mb-14"
          />
        </View>
      </ActionSheet>

      {/* <ActionSheet
        ref={availableAleoCreditsBottomSheetRef}
        useBottomSafeAreaPadding
        snapPoints={[90]}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="flex flex-col px-5 py-4 gap-4">
          <Text className="font-semibold text-lg">
            Your available Aleo credits
          </Text>
          <View className="flex-row">
            <View className="flex-col">
              <Text className="text-gray-600 mb-2">Private</Text>
              <Text className="text-gray-600">Public</Text>
              <Text className="mt-4">Total</Text>
            </View>
            <View className="flex-col ml-4">
              <Text className="mb-2">{formatBigInt(privateBalance)}</Text>
              <Text>{formatBigInt(publicBalance)}</Text>
              <Text className="mt-4 font-semibold">
                {formatBigInt(privateBalance + publicBalance)}
              </Text>
            </View>
          </View>
          <LeoButton
            label={'Close'}
            onPress={() => availableAleoCreditsBottomSheetRef.current?.hide()}
            type="secondary"
            className="mt-auto mb-14"
          />
        </View>
      </ActionSheet> */}
    </GestureHandlerRootView>
  )
}

export default AmountScreen
