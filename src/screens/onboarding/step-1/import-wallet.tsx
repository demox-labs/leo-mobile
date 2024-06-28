import LeoButton from '@src/components/leo-button'
import useBottomMargin from '@src/hooks/useBottomMargin'
import React, { useState } from 'react'
import {
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type ImportWalletScreenProps = {
  phrase: string
  onPhraseChange?: (phrase: string) => void
  onContinuePress: () => void
  onFindPhrasePress?: () => void
  isButtonDisabled: boolean
  isError: boolean
  // recoveryPhrase?: string // this could be used to pre-fill the input if necessary
}

const ImportWalletScreen: React.FC<ImportWalletScreenProps> = ({
  phrase,
  onPhraseChange,
  onContinuePress,
  // onFindPhrasePress,
  isButtonDisabled,
  isError,
}: ImportWalletScreenProps) => {
  const [isInputActive, setIsInputActive] = useState(false)

  const bottomMargin = useBottomMargin()

  const defaultIputStyles =
    'text-base border border-gray-200 p-2 rounded-lg mb-2 h-[80px]'
  const activeInputStyles = isInputActive ? 'border-primary-500' : ''
  const errorInputStyles = isError ? 'border-red-500' : ''
  const inputStyles = `${defaultIputStyles} ${activeInputStyles} ${errorInputStyles}`

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView edges={['bottom']} className="flex-1 px-4 bg-white">
        <Text className="text-2xl font-bold mb-3 pt-5">Import wallet</Text>
        <Text className="text-base mb-5">
          {
            "Enter your wallet's unique 12-word Seed phrase. Only Aleo Seed phrases are supported."
          }
        </Text>
        <TextInput
          placeholder="Seed Phrase"
          className={inputStyles}
          onChangeText={onPhraseChange}
          value={phrase}
          autoCapitalize="none"
          multiline
          numberOfLines={2} // Optional: Android only, sets the minimum number of lines to show
          onFocus={() => setIsInputActive(true)}
          onBlur={() => setIsInputActive(false)}
        />
        {isError ? (
          <Text className="mb-5 text-red-500">{'Invalid recovery phrase'}</Text>
        ) : null}
        {/* {onFindPhrasePress
        ? null
        : // <TouchableOpacity onPress={onFindPhrasePress} className="mb-4">
          //   <Text className="text-blue-500">Where can I find it?</Text>
          // </TouchableOpacity>
      } */}
        <LeoButton
          label="Continue"
          disabled={isButtonDisabled}
          onPress={onContinuePress}
          className={`py-2 mt-auto ${bottomMargin}`}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default ImportWalletScreen
