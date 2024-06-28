import React, { useState } from 'react'
import OptionList, { OptionItem } from '@src/components/settings-options-list'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '@src/components/icons'
import randomColor from 'randomcolor'
import EllipsizedAddress from '@src/components/ellipsized-address'
import { router } from 'expo-router'

const data: OptionItem[] = [
  {
    id: '1',
    text: 'General',
    Icon: props => <Icon name="settings" {...props} />,
    href: '/general',
    hasTopBorder: true,
  },
  {
    id: '2',
    text: 'Address Book',
    Icon: props => <Icon name="contacts-book" {...props} />,
    href: '/address-book',
    hasBottomBorder: true,
  },
  // {
  //   id: '6',
  //   text: 'Authorized DApps',
  //   Icon: props => <Icon name="apps" {...props} />,
  //   href: 'settings/authorized-dapps',
  // },
  // {
  //   id: '7',
  //   text: 'File Settings',
  //   Icon: props => <Icon name="file-settings" {...props} />,
  //   href: 'settings/file-settings',
  // },
  {
    id: '8',
    text: 'Advanced Settings',
    Icon: props => <Icon name="settings-2" {...props} />,
    hasBottomBorder: true,
    href: '/advanced',
  },
  {
    id: '9',
    text: 'About',
    Icon: props => <Icon name="information" {...props} />,
    href: '/about',
  },
  {
    id: '11',
    text: 'Lock',
    Icon: props => <Icon name="lock" {...props} />,
  },
]

interface SettingsScreenProps {
  accountName: string
  accountAddress: string
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  accountName,
  accountAddress,
}) => {
  const [pressed, setPressed] = useState(false)
  const touchableOpacityClassName = `flex-row w-full items-center px-2 py-4 rounded-lg my-1 ${pressed ? 'bg-gray-50' : ''}`

  const onAccountSettingsPress = () => {
    router.push('/account-settings')
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4">
        <TouchableOpacity
          className={touchableOpacityClassName}
          onPress={onAccountSettingsPress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          activeOpacity={1} // disable the opacity change on press
        >
          <Icon
            name="leo-logo-blue"
            size={32}
            color={randomColor({ seed: accountAddress })}
          />
          <View className="ml-2 flex-1">
            <Text>{accountName}</Text>
            <EllipsizedAddress
              className="text-sm text-gray-600"
              address={accountAddress}
            />
          </View>
          <Icon name="chevron-right" size={24} color="black" className="ml-4" />
        </TouchableOpacity>
      </View>
      <OptionList className="flex-1" data={data} />
    </View>
  )
}

export default SettingsScreen
