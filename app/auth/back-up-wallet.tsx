import 'react-native-get-random-values' // polyfill for crypto.getRandomValues for bip39
import React, { useEffect, useState } from 'react'

import BackUpWalletScreen from '@src/screens/onboarding/step-1/back-up-wallet'
import { useRouter } from 'expo-router'
import { generateMnemonic } from 'bip39'
import Clipboard from '@react-native-clipboard/clipboard'

const BackUpWalletRoute = () => {
  const router = useRouter()
  const [hasCopiedToClipboard, setHasCopiedToClipboard] = useState(false)
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([])

  useEffect(() => {
    const mnemonic = generateMnemonic(128).split(' ')
    setMnemonicWords(mnemonic)
  }, [])

  const onContinuePress = () => {
    router.push({
      pathname: '/auth/verify-seed-phrase',
      params: {
        mnemonicWords: mnemonicWords.join(' '),
      },
    })
  }

  const onCopyToClipboardPress = () => {
    Clipboard.setString(mnemonicWords.join(' '))
    setHasCopiedToClipboard(true)
  }

  return (
    <BackUpWalletScreen
      mnemonicWords={mnemonicWords}
      hasCopiedToClipboard={hasCopiedToClipboard}
      onContinuePress={onContinuePress}
      onCopyToClipboardPress={onCopyToClipboardPress}
    />
  )
}

export default BackUpWalletRoute
