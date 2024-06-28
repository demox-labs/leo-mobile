import React from 'react'
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'

interface CreateAccountScreenProps {
  accountName: string
  isLoading: boolean
  isButtonDisabled: boolean
  onNameChange: (name: string) => void
  onCreateAccountPress: () => void
}

const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({
  accountName,
  isLoading,
  isButtonDisabled,
  onNameChange,
  onCreateAccountPress,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center p-5 bg-white">
        <LeoInput
          label="Account name"
          value={accountName}
          onChangeText={onNameChange}
          customStyles={{
            wrapper: 'mt-5',
          }}
        />
        <View className="mb-5 mt-auto w-full">
          <LeoButton
            label="Create or restore account"
            onPress={onCreateAccountPress}
            isLoading={isLoading}
            disabled={isButtonDisabled}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default CreateAccountScreen
