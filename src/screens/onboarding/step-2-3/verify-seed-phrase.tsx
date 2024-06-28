import LeoButton from '@src/components/leo-button'
import useBottomMargin from '@src/hooks/useBottomMargin'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type VerifySeedPhraseScreenProps = {
  shuffledMnemonicWords: string[]
  wordToVerifyIndex: number // the index of the word to verify
  selectedWordIndex?: number // the index of the selected word
  isContinueButtonDisabled: boolean
  handleWordSelect: (index: number) => void
  onContinuePress: () => void
}

const VerifySeedPhraseScreen: React.FC<VerifySeedPhraseScreenProps> = ({
  shuffledMnemonicWords,
  wordToVerifyIndex,
  selectedWordIndex,
  isContinueButtonDisabled,
  handleWordSelect,
  onContinuePress,
}) => {
  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 px-4 bg-white">
      <Text className="text-2xl font-bold mb-3 pt-5">Verify Seed Phrase</Text>
      <Text className="text-base mb-5">
        Confirm your secret recovery phrase by selecting the word #
        {wordToVerifyIndex + 1}.
      </Text>
      <View className="flex-row flex-wrap justify-between mb-5">
        {shuffledMnemonicWords.map((word, index) => (
          <View className="w-1/2" key={word}>
            <TouchableOpacity
              className={`h-[32px] mb-3 px-3 py-1 flex-row items-center justify-start content-center rounded-3xl ${
                selectedWordIndex === index
                  ? 'bg-black'
                  : 'bg-white border solid border-gray-100'
              }
            ${index % 2 === 0 ? 'mr-2' : ''}`}
              onPress={() => handleWordSelect(index)}
            >
              <Text
                className={`text-sm ${
                  selectedWordIndex === index ? 'text-white' : 'text-black'
                }`}
              >
                {word}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <LeoButton
        label="Continue"
        className={`mt-auto ${bottomMargin}`}
        onPress={onContinuePress}
        disabled={isContinueButtonDisabled}
      />
    </SafeAreaView>
  )
}

export default VerifySeedPhraseScreen
