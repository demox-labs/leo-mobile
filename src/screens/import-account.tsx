import React from 'react'
import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native'
import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'

interface ImportAccountScreenProps {
  privateKey: string
  errorMessage: string | null
  isLoading: boolean
  onImportAccountPress: () => void
  onPrivateKeyChange: (privateKey: string) => void
}

const ImportAccountScreen: React.FC<ImportAccountScreenProps> = ({
  privateKey,
  errorMessage,
  isLoading,
  onImportAccountPress,
  onPrivateKeyChange,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 justify-center p-5 bg-white">
        <LeoInput
          label="Private Key"
          placeholder="e.g. APrivateKey1zkp..."
          help="The secret key of the account you want to import."
          value={privateKey}
          onChangeText={onPrivateKeyChange}
          customStyles={{
            wrapper: 'mt-5',
          }}
        />
        {errorMessage ? (
          <Text className="mb-5 text-red-500">{errorMessage}</Text>
        ) : null}
        <View className="mb-5 mt-auto w-full">
          <LeoButton
            label="Import Account"
            onPress={onImportAccountPress}
            isLoading={isLoading}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default ImportAccountScreen
