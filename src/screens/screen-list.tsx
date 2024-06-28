import React, { useState } from 'react'
import { TouchableOpacity, View, Text, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from '@src/components/icons'

type LinkType = 'flow' | 'screen' | 'storybook' | 'feature' | 'default' | 'all'

type LinkStyles = Record<LinkType, string>

const linkStyles: LinkStyles = {
  flow: 'bg-primary-500',
  screen: 'bg-blue-500',
  storybook: 'bg-pink-200',
  feature: 'bg-black',
  default: 'bg-white',
  all: 'bg-gray-200',
}

const links = [
  {
    href: '/auth/login',
    text: 'Login flow',
    type: 'flow',
  },
  {
    href: '/welcome',
    text: 'Onboarding flow',
    type: 'flow',
  },
  {
    href: '/buy-tokens/method',
    text: 'Buy tokens flow',
    type: 'flow',
  },
  {
    href: '/home',
    text: 'Home Screen',
    type: 'screen',
  },
  {
    href: '/select-transaction-type',
    text: 'Select Transaction Type',
    type: 'screen',
  },
  {
    href: '/storybook',
    text: 'Storybook',
    type: 'storybook',
  },
  {
    href: '/sdk-example',
    text: 'SDK Example',
    type: 'feature',
  },
  {
    href: '/db-example',
    text: 'DB Example',
    type: 'feature',
  },
  {
    href: '/qr-code-scanner/',
    text: 'QR Code Scanner',
    type: 'feature',
  },
]

const legendOptions = [
  { text: 'All', type: 'all' },
  { text: 'Flows', type: 'flow' },
  { text: 'Screens', type: 'screen' },
  { text: 'Storybook', type: 'storybook' },
  { text: 'Feature', type: 'feature' },
]

const ScreensList: React.FC = () => {
  const [selectedType, setSelectedType] = useState<LinkType>('all')

  const handleSelection = (type: LinkType) => {
    setSelectedType(type)
  }

  const filteredLinks =
    selectedType === 'all'
      ? links
      : links.filter(link => link.type === selectedType)

  return (
    <SafeAreaView className="flex-1">
      <View className="p-4 px-6">
        <View className="flex w-100 justify-center items-center mb-12">
          <Icon name="leo-logo-and-name-centered" />
        </View>

        {/* Legend */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: 'space-between',
            flexGrow: 1,
          }}
          className="mb-8 px-4"
        >
          {legendOptions.map(({ text, type }) => (
            <TouchableOpacity
              key={type}
              className={'flex items-center justify-center mx-2'}
              onPress={() => handleSelection(type as LinkType)}
            >
              <View
                className={`${
                  linkStyles[type as keyof typeof linkStyles] ||
                  'bg-transparent'
                } w-6 h-6 rounded-full mb-2`}
              ></View>
              <Text className="text-center text-xs">{text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Options */}
      <ScrollView className="px-8">
        {filteredLinks.map(({ href, text, type }) => (
          <Link
            href={href as never}
            asChild
            key={href}
            className={`${
              linkStyles[type as keyof typeof linkStyles] || linkStyles.default
            } p-4 my-2 rounded-md border`}
          >
            <TouchableOpacity className="items-center">
              <Text
                className={`text-${type === 'storybook' ? 'black' : 'white'}`}
              >
                {text}
              </Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ScreensList
