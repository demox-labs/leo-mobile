/* Docs:

- Takes in an array of mnemonic words as a prop, which would be the backup phrase for the wallet.
- Includes a state showWords to toggle the visibility of the mnemonic words.
- Provides a button to copy the mnemonic words to the clipboard using Clipboard.setString.
- Renders a "Continue" button that calls onContinuePress when pressed, which should handle the navigation or the next steps in the backup process.

*/

import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import useBottomMargin from '@src/hooks/useBottomMargin'

type BackupWalletScreenProps = {
  mnemonicWords: string[] // Array of 12 mnemonic words
  hasCopiedToClipboard: boolean
  onContinuePress: () => void
  onCopyToClipboardPress: () => void
}

const BackupWalletScreen: React.FC<BackupWalletScreenProps> = ({
  mnemonicWords,
  hasCopiedToClipboard,
  onContinuePress,
  onCopyToClipboardPress,
}) => {
  const [showWords, setShowWords] = useState(false)
  const copyText = hasCopiedToClipboard ? 'Copied' : 'Copy to clipboard'
  const copyIcon = hasCopiedToClipboard ? 'success' : 'file-copy'

  const bottomMargin = useBottomMargin()

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 px-4 pt-5 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <Text className="text-2xl font-bold mb-1">Back up your wallet</Text>
        <Text className="text-base mb-4">
          Save these 12 words to a password manager, or write down and store in
          a secure place. Do not share with anyone.
        </Text>

        <View className="flex-row flex-wrap justify-between">
          {mnemonicWords.map((word, index) => (
            <View className="w-1/2" key={word}>
              <View
                className={`h-[32px] mb-3 px-3 py-1 flex-row items-center justify-start content-center border solid border-gray-100 rounded-3xl ${
                  index % 2 === 0 ? 'mr-2' : ''
                }`}
              >
                <Text className="text-sm text-gray-500">{index + 1}.</Text>
                <Text className={'rounded align-baseline text-sm'}>
                  {showWords ? ` ${word}` : ' •••••'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <LeoButton
          label={showWords ? 'Hide' : 'Show'}
          type="link"
          onPress={() => setShowWords(!showWords)}
          className="mb-4 self-center flex-row justify-center items-center"
          icon={<Icon name={showWords ? 'eye-off' : 'eye'} size={24} />}
        />
      </ScrollView>

      <View className={`mt-auto ${bottomMargin}`}>
        <LeoButton
          label={copyText}
          type="secondary"
          onPress={onCopyToClipboardPress}
          className={'flex-row mb-4 items-center'}
          icon={<Icon name={copyIcon} color="black" />}
        />
        <LeoButton label="Continue" onPress={onContinuePress} />
      </View>
    </SafeAreaView>
  )
}

export default BackupWalletScreen
