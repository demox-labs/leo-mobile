import {
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'

import Icon from '@src/components/icons'
import Clipboard from '@react-native-clipboard/clipboard'
import LeoToast from '@src/components/leo-toast'
import { useAleoClient } from '@src/lib/aleo/client'

const SettingsRevealSeedPhrase = () => {
  const { revealMnemonic } = useAleoClient()
  const [password, setPassword] = React.useState('')
  const [revealedKey, setRevealedKey] = React.useState('')
  const [isError, setIsError] = React.useState(false)

  const handleRevealKey = async () => {
    try {
      setIsError(false)
      const revealedKey = await revealMnemonic(password)
      setRevealedKey(revealedKey)
    } catch {
      setIsError(true)
    }
  }

  const handleCopyKey = () => {
    Clipboard.setString(revealedKey)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className={'flex-1 bg-white p-4'} edges={['bottom']}>
        <KeyboardAvoidingView className="flex-1" behavior="padding">
          <View className={'flex-1'}>
            <View>
              {!revealedKey && (
                <>
                  <Text className="text-lg font-semibold">Derivation path</Text>
                  <Text className="mt-3">
                    for HD acccounts. This is the thing you use to recover all
                    your accounts from your seed phrase.
                  </Text>
                  <Text className="mt-3 font-semibold mb-10">
                    {"m/44'/0'/<account_index>'/0'"}
                  </Text>
                </>
              )}

              <Text className="text-lg font-semibold ">Seed Phrase</Text>
              <Text className="my-3">
                If you ever switch between browsers or devices, you will need
                this seed phrase to access your accounts. Keep it in secret.
              </Text>

              {revealedKey ? (
                <>
                  <LeoToast type="warning" containerStyle="mt-5">
                    <View className="ml-3">
                      <Text className="font-semibold text-base">
                        Do not share this set of chars with anyone!
                      </Text>
                      <Text className="text-base">
                        It can be used to steal your current account.
                      </Text>
                    </View>
                  </LeoToast>

                  <View className="mt-10 px-5 items-center">
                    <Text className="font-bold text-2xl text-center">
                      {revealedKey}
                    </Text>
                  </View>
                </>
              ) : (
                <LeoInput
                  label=""
                  onChangeText={setPassword}
                  value={password}
                  help="Enter password to reveal the Seed Phrase"
                  secureTextEntry
                />
              )}
              {isError && (
                <Text className="mb-5 text-red-500">Incorrect password</Text>
              )}
            </View>
          </View>

          <View>
            {revealedKey ? (
              <LeoButton onPress={handleCopyKey} type="secondary">
                <View className="flex-row items-center justify-center">
                  <Icon name="file-copy" />
                  <Text className="ml-3 text-center text-lg">
                    Copy Seed Phrase
                  </Text>
                </View>
              </LeoButton>
            ) : (
              <LeoButton label="Reveal" onPress={handleRevealKey} />
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default SettingsRevealSeedPhrase
