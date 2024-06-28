import { Keyboard, View, TouchableWithoutFeedback } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'
import LeoToast from '@src/components/leo-toast'

interface SettingsAccountNameScreenProps {
  accountName: string
  isSuccess?: boolean
  helpMessage?: string
  isSaveButtonDisabeld: boolean
  onSavePress: () => void
  onChangeAccountName: (name: string) => void
}

const SettingsAccountNameScreen: React.FC<SettingsAccountNameScreenProps> = ({
  accountName,
  isSuccess,
  helpMessage,
  isSaveButtonDisabeld,
  onSavePress,
  onChangeAccountName,
}) => {
  const dismissKeyboard = () => Keyboard.dismiss()

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView className={'flex-1 bg-white p-4'} edges={['bottom']}>
        <View className={'flex-1 pt-5'}>
          <View className="">
            <LeoInput
              label="Account name"
              onChangeText={onChangeAccountName}
              value={accountName}
              placeholder="Type your account name"
            />
            {isSuccess !== undefined ? (
              <View className={'mt-5'}>
                <LeoToast
                  type={isSuccess ? 'success' : 'danger'}
                  message={helpMessage}
                />
              </View>
            ) : null}
          </View>
        </View>
        <View className="mb-5">
          <LeoButton
            label="Save"
            onPress={onSavePress}
            disabled={isSaveButtonDisabeld}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SettingsAccountNameScreen
