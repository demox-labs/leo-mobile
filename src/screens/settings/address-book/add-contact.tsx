import LeoButton from '@src/components/leo-button'

import React, { useEffect, useRef } from 'react'
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TextInput,
} from 'react-native'
import LeoInput from '@src/components/leo-input'
import useVerticalOffset from '@src/hooks/useVerticalOffset'

interface AddContactScreenProps {
  name: string
  address: string
  isButtonDisabled: boolean
  isLoading: boolean
  onChangeName: (name: string) => void
  onChangeAddress: (address: string) => void
  onAddContact: () => void
}

const AddContactScreen: React.FC<AddContactScreenProps> = ({
  name,
  address,
  isButtonDisabled,
  isLoading,
  onChangeName,
  onChangeAddress,
  onAddContact,
}) => {
  const verticalOffset = useVerticalOffset({
    multiplier: 1.5,
    smallScreenMultiplier: 1,
  })

  const addressInputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (addressInputRef.current?.focus) {
      addressInputRef.current.focus()
    }
  }, [])

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={verticalOffset}
      className="flex-1 px-5 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="w-full mt-3">
            <LeoInput
              ref={addressInputRef}
              label="Address"
              onChangeText={onChangeAddress}
              value={address}
              placeholder="e.g. aleo123456..."
            />
            <LeoInput
              label="Name"
              onChangeText={onChangeName}
              value={name}
              placeholder="e.g. Alice Bob"
              customStyles={{ wrapper: 'my-3' }}
            />
          </View>

          <View className="mt-auto">
            <LeoButton
              label="Add"
              disabled={isButtonDisabled}
              onPress={onAddContact}
              className="mb-14"
              isLoading={isLoading}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default AddContactScreen
