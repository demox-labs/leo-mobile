import React from 'react'
import { View, TouchableWithoutFeedback, Keyboard } from 'react-native'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'
import Icon from '@src/components/icons'
import { SafeAreaView } from 'react-native-safe-area-context'

type SendTokensStep1ScreenProps = {
  recipientAddress?: string
  onRecipientAddressChange: (address: string) => void
  onContinuePress: () => void
  onCancelPress: () => void
  onContactsPress: () => void
  onScanPress: () => void
  isContinueDisabled: boolean
}

const SendTokensStep1Screen: React.FC<SendTokensStep1ScreenProps> = ({
  recipientAddress,
  onRecipientAddressChange,
  onContinuePress,
  onCancelPress,
  onContactsPress,
  onScanPress,
  isContinueDisabled,
}) => {
  const handleContinuePress = () => {
    onContinuePress()
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        className="flex-1 px-4 bg-white pt-[31px]"
        edges={['bottom']}
      >
        <LeoInput
          value={recipientAddress ?? ''}
          onChangeText={onRecipientAddressChange}
          placeholder="Address"
          customStyles={{
            wrapper: 'mb-4',
            input: 'h-[80px] py-2',
          }}
          multiline
          numberOfLines={2}
          autoCapitalize="none"
        />
        <View className="flex flex-row justify-evenly">
          <LeoButton
            className="flex-1"
            type="link"
            label="QR-code"
            onPress={onScanPress}
            icon={<Icon name="scan" size={20} color="black" className="mr-2" />}
          />

          <LeoButton
            className="flex-1"
            label="Contacts"
            type="link"
            onPress={onContactsPress}
            icon={
              <Icon
                name="contacts-book"
                size={24}
                color="black"
                className="mr-2"
              />
            }
          ></LeoButton>
        </View>

        <View className="flex-row gap-2 mb-5 mt-auto">
          <LeoButton
            label="Cancel"
            onPress={onCancelPress}
            type="secondary"
            fullWidth={false}
          />
          <LeoButton
            label="Next"
            onPress={handleContinuePress}
            disabled={isContinueDisabled}
            fullWidth={false}
          />
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SendTokensStep1Screen
