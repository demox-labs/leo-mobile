import {
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native'
import React, { useEffect, useState } from 'react'

import LeoButton from '@src/components/leo-button'
import LeoInput from '@src/components/leo-input'

import { capitalize } from 'lodash'
import Icon from '@src/components/icons'
import Clipboard from '@react-native-clipboard/clipboard'
import LeoToast from '@src/components/leo-toast'
import randomColor from 'randomcolor'
import useVerticalOffset from '@src/hooks/useVerticalOffset'

interface CopyButtonProps {
  revealedKey: string
  keyType: string
  isCopied: boolean
  handleCopyKey: () => void
  handleRevealKey: () => void
}

const CopyButton: React.FC<CopyButtonProps> = ({
  revealedKey,
  keyType,
  isCopied,
  handleCopyKey,
  handleRevealKey,
}) => {
  return (
    <View className="mt-auto mb-14">
      {revealedKey ? (
        <LeoButton onPress={handleCopyKey} type="secondary">
          <View className="flex-row items-center justify-center">
            <Icon
              color="black"
              name={isCopied ? 'checkbox-circle-fill' : 'file-copy'}
            />
            <Text className="ml-3 text-center text-lg">
              {isCopied ? 'Copied' : `Copy ${capitalize(keyType)} Key`}
            </Text>
          </View>
        </LeoButton>
      ) : (
        <LeoButton label="Reveal" onPress={handleRevealKey} />
      )}
    </View>
  )
}

interface SettingsRevealKeyProps {
  accountName: string
  accountAddress: string
  keyType: 'view' | 'private'
  handleRevealSecretInfo: (
    accountPublicKey: string,
    password: string,
  ) => Promise<string>
}

const SettingsRevealKey: React.FC<SettingsRevealKeyProps> = ({
  accountName,
  accountAddress,
  keyType,
  handleRevealSecretInfo,
}) => {
  const [password, setPassword] = useState('')
  const [revealedKey, setRevealedKey] = useState('')
  const [isError, setIsError] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const verticalOffset = useVerticalOffset()

  const handleRevealKey = async () => {
    try {
      setIsError(false)
      const revealedKey = await handleRevealSecretInfo(accountAddress, password)
      setRevealedKey(revealedKey)
    } catch {
      setIsError(true)
    }
  }

  const handleCopyKey = () => {
    Clipboard.setString(revealedKey)
    setIsCopied(true)
  }

  useEffect(() => {
    setIsCopied(false)
  }, [revealedKey])

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={verticalOffset}
      className="flex-1 px-5 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <View className="flex-row p-3 pl-0 justify-baseline items-center">
            <Icon
              name="leo-logo-blue"
              className="ml-0"
              color={randomColor({ seed: accountAddress })}
            />
            <View className="ml-1 flex-row items-center ">
              <Text className="ml-1 text-lg font-semibold">{accountName}</Text>
              <Text className="ml-3 text-lg">
                ({`${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`}
                )
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-lg font-semibold">
              {capitalize(keyType)} Key
            </Text>
            <Text className="my-3">
              {keyType === 'view'
                ? 'Current account view key. Keep it in secret. Anyone with this key can see your transaction history'
                : 'Current account key. Keep it in secret.'}
            </Text>

            {revealedKey ? (
              <LeoToast type="warning" containerStyle="mt-5 mr-2">
                <View className="ml-3">
                  <Text className="font-semibold text-sm">
                    {keyType === 'view'
                      ? 'Only share with people you trust!'
                      : 'Do not share this set of chars with anyone!'}
                  </Text>
                  <Text className="text-sm">
                    {keyType === 'view'
                      ? ' It can be used to view all of your transaction history.'
                      : 'It can be used to steal your current account.'}
                  </Text>
                </View>
              </LeoToast>
            ) : null}

            {revealedKey ? (
              <View className="mt-10 px-5 items-center">
                <Text className="font-bold text-2xl text-center">
                  {revealedKey}
                </Text>
              </View>
            ) : (
              <LeoInput
                label=""
                onChangeText={setPassword}
                value={password}
                help={`Enter password to reveal the ${keyType} key`}
                secureTextEntry
              />
            )}
            {isError && (
              <Text className="mb-5 text-red-500">Incorrect password</Text>
            )}
          </View>

          <CopyButton
            revealedKey={revealedKey}
            keyType={keyType}
            isCopied={isCopied}
            handleCopyKey={handleCopyKey}
            handleRevealKey={handleRevealKey}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default SettingsRevealKey
