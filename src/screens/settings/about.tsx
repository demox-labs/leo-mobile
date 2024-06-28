import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'

import Icon from '@src/components/icons'
import LeoDivider from '@src/components/leo-divider'
import { VersionName } from 'version'

const base_url = 'https://leo.app'

const links = [
  {
    title: 'Website',
    url: base_url,
  },
  {
    title: 'Privacy Policy',
    url: `${base_url}/privacy`,
  },
  {
    title: 'Terms of Use',
    url: `${base_url}/terms`,
  },
  {
    title: 'Contact',
    url: `${base_url}/contact`,
    hasBorderTop: true,
  },
]

const ListItem = ({
  title,
  url,
  hasBorderTop,
}: {
  title: string
  url: string
  hasBorderTop?: boolean
}) => {
  const [pressed, setPressed] = useState(false)
  const className = `my-1 py-4 px-2 flex-row items-center justify-between ${
    pressed ? 'bg-gray-50 rounded-lg' : ''
  }`

  return (
    <>
      {hasBorderTop && <LeoDivider />}
      <TouchableOpacity
        className={className}
        onPress={() => Linking.openURL(url)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1} // disable the opacity change on press
      >
        <Text className="text-lg">{title}</Text>
        <Icon name="arrow-right-up" className="text-gray-400" size={24} />
      </TouchableOpacity>
    </>
  )
}

const SettingsAbout = () => {
  return (
    <SafeAreaView className="flex-1 bg-white p-4" edges={['bottom']}>
      <View className="flex-1 items-center">
        <Icon name="leo-logo-and-name-horizontal" className="mb-5" />

        <Text>Version {VersionName}</Text>
        <Text>Powered by Demox Labs</Text>

        <Icon name="built-with-aleo" className="mt-5" />
        <View className="mt-5 w-full">
          {links.map(link => (
            <ListItem key={link.url} {...link} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default SettingsAbout
