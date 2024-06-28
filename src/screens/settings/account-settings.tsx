import React from 'react'
import OptionList, { OptionItem } from '@src/components/settings-options-list'
import { View, Text } from 'react-native'
import Icon from '@src/components/icons'
import randomColor from 'randomcolor'

const accountData: OptionItem[] = [
  {
    id: '20',
    text: 'Account Name',
    Icon: props => <Icon name="user" {...props} />,
    hasBottomBorder: true,
    href: '/account-name',
  },
  {
    id: '3',
    text: 'Reveal View Key',
    Icon: props => <Icon name="key" {...props} />,
    href: '/reveal-view-key',
  },
  {
    id: '4',
    text: 'Reveal Private Key',
    Icon: props => <Icon name="key" {...props} />,
    href: '/reveal-private-key',
  },
  {
    id: '5',
    text: 'Reveal Seed Phrase',
    Icon: props => <Icon name="file" {...props} />,
    hasBottomBorder: true,
    href: '/reveal-seed-phrase',
  },
  {
    id: '10',
    text: 'Remove Account',
    Icon: props => <Icon name="indeterminate-circle" {...props} />,
    href: '/remove-account',
  },
]

interface AccountSettingsScreenProps {
  accountName: string
  accountAddress: string
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  accountName,
  accountAddress,
}) => (
  <View className="flex-1 bg-white">
    <View className="w-full items-center mt-[32px] mb-[17px]">
      <Icon
        name="leo-logo-blue"
        size={48}
        color={randomColor({ seed: accountAddress })}
      />
      <Text className="text-lg mt-1">{accountName}</Text>
    </View>
    <OptionList className="flex-1" data={accountData} />
  </View>
)

export default AccountSettingsScreen
