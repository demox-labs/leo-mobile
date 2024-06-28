import React from 'react'
import { Octicons } from '@expo/vector-icons'
import Header from '@src/components/header'

import LeoButton from '@src/components/leo-button'

import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from '@src/components/icons'

const files = [
  { name: 'InclusionProver', size: '292.64 MB' },
  { name: 'InclusionVerifier', size: '566.92 KB' },
  { name: 'credits_mint_prover', size: '117.12 MB' },
  { name: 'credits_transfer_prover', size: '199.59 MB' },
  { name: 'credits_transfer_verifier', size: '566.92 KB' },
]

const SettingsFileSettings = () => {
  return (
    <SafeAreaView className={'flex-1 bg-white px-5'}>
      <Header title="File Settings" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, flex: 1 }}>
        <View className="flex-1 mt-5">
          <View className="flex-row w-full justify-between">
            <Text className={'text-lg color-gray-600'}>Total Storage used</Text>
            <Text className={'text-lg'}>610.66 MB</Text>
          </View>

          {files.map((file, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center mt-3 border border-gray-200 rounded-lg px-3 py-2"
            >
              <View>
                <Text className={'text-lg'}>{file.name}</Text>
                <Text className={'text-lg color-gray-600'}>{file.size}</Text>
              </View>
              <View className="flex-row">
                <Octicons name="download" size={30} color="black" />
                <Icon
                  name="close-fill"
                  size={30}
                  color="black"
                  style={{ marginLeft: 30 }}
                />
              </View>
            </View>
          ))}
        </View>

        <LeoButton label="Upload File" onPress={() => {}} />
        <LeoButton
          label="Download Default Files"
          type="secondary"
          className="mt-3"
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsFileSettings
