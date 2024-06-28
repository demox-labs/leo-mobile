import React, { useState } from 'react'
import VerifySeedPhraseScreen from '@src/screens/onboarding/step-2-3/verify-seed-phrase'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { shuffle } from 'lodash'

const VerifySeedPhraseRoute = () => {
  const router = useRouter()
  const { mnemonicWords: mnemonicWordsString } = useLocalSearchParams<{
    mnemonicWords: string
  }>()
  const mnemonicWords = mnemonicWordsString?.split(' ')

  const [selectedWordIndex, setSelectedWordIndex] = useState<number>()

  const shuffledMnemonicWords = React.useMemo(() => shuffle(mnemonicWords), [])

  const randomIndex = React.useMemo(
    () => Math.floor(Math.random() * shuffledMnemonicWords.length),
    [],
  )

  const wordToVerify = mnemonicWords![randomIndex]

  const handleWordSelect = (index: number) => {
    setSelectedWordIndex(index)
  }

  const isContinueButtonDisabled =
    selectedWordIndex === undefined ||
    shuffledMnemonicWords[selectedWordIndex] !== wordToVerify

  const onContinuePress = () => {
    router.replace({
      pathname: '/auth/create-password',
      params: {
        mnemonicWords: mnemonicWordsString,
      },
    })
  }

  return (
    <VerifySeedPhraseScreen
      shuffledMnemonicWords={shuffledMnemonicWords}
      wordToVerifyIndex={randomIndex}
      selectedWordIndex={selectedWordIndex}
      isContinueButtonDisabled={isContinueButtonDisabled}
      handleWordSelect={handleWordSelect}
      onContinuePress={onContinuePress}
    />
  )
}

export default VerifySeedPhraseRoute
