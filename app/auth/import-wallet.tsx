import 'react-native-get-random-values' // polyfill for crypto.getRandomValues for bip39

import React, { useState } from 'react'
import ImportWalletScreen from '@src/screens/onboarding/step-1/import-wallet'
import { useRouter } from 'expo-router'
import { validateMnemonic } from 'bip39'

const ImportWalletRoute = () => {
  const router = useRouter()
  const [phrase, setPhrase] = useState('')
  const [isError, setIsError] = useState(false)

  const isContinueButtonDisabled = phrase.length === 0

  const onContinuePress = () => {
    setIsError(false)
    if (!validateMnemonic(phrase)) {
      setIsError(true)
      return
    }
    router.replace({
      pathname: '/auth/create-password',
      params: {
        isImportWalletFlow: 'true',
        mnemonicWords: phrase,
      },
    })
  }

  const onFindPhrasePress = () => {}

  const onPhraseChange = (phrase: string) => {
    setPhrase(phrase)
    setIsError(false)
  }

  return (
    <ImportWalletScreen
      phrase={phrase}
      onPhraseChange={onPhraseChange}
      onContinuePress={onContinuePress}
      onFindPhrasePress={onFindPhrasePress}
      isButtonDisabled={isContinueButtonDisabled}
      isError={isError}
    />
  )
}

export default ImportWalletRoute
