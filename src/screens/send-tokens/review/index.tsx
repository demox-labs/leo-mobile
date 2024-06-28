import React, { useRef } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import LeoButton from '@src/components/leo-button'
import LeoToast from '@src/components/leo-toast'
import LeoSwitch from '@src/components/leo-switch'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import LeoDivider from '@src/components/leo-divider'
import Icon from '@src/components/icons'
import colors from '@src/utils/colors'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet'
import EllipsizedAddress from '@src/components/ellipsized-address'

interface ReviewScreenProps {
  isLoading: boolean
  amount: string
  fromAccount: string
  toAddress: string
  sendType: string
  feeType: string
  feeAmount: string
  tokenSymbol: string
  delegateTransaction: boolean
  onDelegateTransactionChange: (value: boolean) => void
  onConfirm: () => void
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  isLoading,
  amount,
  fromAccount,
  toAddress,
  sendType,
  feeType,
  feeAmount,
  tokenSymbol,
  delegateTransaction,
  onDelegateTransactionChange,
  onConfirm,
}) => {
  const bottomSheetRef = useRef<ActionSheetRef>(null)
  const handlePresentModal = () => bottomSheetRef.current?.show()

  const integerPart = amount.split('.')[0]
  const decimalPart = amount.split('.')[1]

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white px-4 " edges={['bottom']}>
        <View className="flex-row justify-center my-8">
          <View className="flex-row items-end ">
            <Text className="text-3xl font-bold">{integerPart}</Text>
            {decimalPart ? (
              <Text className="text-xl font-semibold ml-1">.{decimalPart}</Text>
            ) : null}
            <Text className="text-xl ml-1">{tokenSymbol}</Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center my-1">
          <Text className="my-1 text-gray-600">From</Text>
          <Text className="my-1">You ({fromAccount})</Text>
        </View>

        <View className="flex-row justify-between items-center mt-1 mb-3">
          <Text className="text-gray-600">To</Text>
          <EllipsizedAddress address={toAddress} className="text-sm w-[80px]" />
        </View>
        <LeoDivider />

        <View className="flex-row justify-between items-center my-1 pt-4">
          <Text className="text-gray-600">Send type</Text>
          <Text>{sendType}</Text>
        </View>

        <View className="flex-row justify-between items-start my-1 pb-4">
          <Text className="text-gray-600">Fee type</Text>
          <View className="flex-col items-end">
            <Text>{feeType}</Text>
            <Text className="text-gray-500 text-sm">
              {feeAmount} {tokenSymbol}
            </Text>
          </View>
        </View>
        <LeoDivider />

        <View className="flex-row justify-between items-center py-4">
          <View className="flex-row items-center">
            <Text className="mr-1 text-gray-600">
              Delegate this transaction
            </Text>
            <TouchableOpacity
              onPress={handlePresentModal}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Icon name="information" size={16} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>
          <LeoSwitch
            value={delegateTransaction}
            onValueChange={value => onDelegateTransactionChange(value)}
          />
        </View>
        <LeoDivider className="mb-[17px]" />

        {/* <View className="flex-row justify-between items-center my-4 mb-10">
          <Text>Transaction breakdown</Text>
          <TouchableOpacity onPress={onTransactionDetailsPress}>
            <Text className="text-blue-500">Details</Text>
          </TouchableOpacity>
        </View> */}

        <LeoToast
          type="info"
          message="Aleo transfer advisory. Centralized exchanges only accept public Aleo. If this transaction is to an exchange, only send public credits with a public fee."
        />

        <LeoButton
          label="Send"
          onPress={onConfirm}
          className="mt-auto mb-5"
          isLoading={isLoading}
        />
      </SafeAreaView>
      {/* <View className="flex-row justify-between items-center my-4 mb-10">
        <Text>Transaction breakdown</Text>
        <TouchableOpacity onPress={onTransactionDetailsPress}>
          <Text className="text-blue-500">Details</Text>
        </TouchableOpacity>
      </View> */}

      <ActionSheet
        ref={bottomSheetRef}
        useBottomSafeAreaPadding
        snapPoints={[90]}
        drawUnderStatusBar={false}
        gestureEnabled
      >
        <View className="flex flex-col px-5 py-4 gap-4">
          <Text className="font-semibold text-lg">
            Delegate this transaction
          </Text>
          <Text className="text-sm">
            Here you can configure delegation of proof generation to a remote
            server. This will speed up proof generation but disclose the
            transaction details to a trusted server.
          </Text>
          <LeoButton
            label={'Close'}
            onPress={bottomSheetRef.current?.hide}
            type="secondary"
            className="mt-auto mb-14"
          />
        </View>
      </ActionSheet>
    </GestureHandlerRootView>
  )
}

export default ReviewScreen
