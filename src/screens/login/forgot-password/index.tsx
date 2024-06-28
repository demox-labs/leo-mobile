import React from 'react'
import { View, Text } from 'react-native'

import { SafeAreaView } from 'react-native-safe-area-context'

import { ActionSheetRef } from 'react-native-actions-sheet'
import ForgotPasswordModal from './actionsheet'
import Header from '@src/components/header'
import Icon from '@src/components/icons'
import LeoButton from '@src/components/leo-button'
import useBottomMargin from '@src/hooks/useBottomMargin'

const ForgotPasswordScreen: React.FC = () => {
  const actionsheetRef = React.useRef<ActionSheetRef>(null)

  const onResetSecretPhrasePress = () => actionsheetRef.current?.show()

  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView className="flex-1 bg-white px-5">
      <Header title="Forgot password?" />

      <View className="flex h-1/3 justify-end items-center mt-10">
        <Icon name="round-lock" />
      </View>

      <View className="mt-5 h-1/3 items-center">
        <Text className="text-2xl font-semibold">Forgot password?</Text>

        <Text className="mt-3 text-lg text-center font-normal">
          You can reset your password by entering your wallet&apos;s 12-24 word
          recovery phrase. Leo Wallet cannot recover your password for you.
        </Text>
      </View>

      <View className={`flex-1 justify-end ${bottomMargin}`}>
        <LeoButton
          label="Reset Secret Phrase"
          onPress={onResetSecretPhrasePress}
        />
      </View>

      <ForgotPasswordModal ref={actionsheetRef} />
    </SafeAreaView>
  )
}

export default ForgotPasswordScreen
