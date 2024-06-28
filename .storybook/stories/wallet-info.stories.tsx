import React from 'react'
import { View } from 'react-native'
import { Meta, Story } from '@storybook/react'
import WalletInfo, {
  WalletInfoProps,
} from '../../src/components/home/wallet-info'

const meta: Meta = {
  title: 'Components/WalletInfo',
  component: WalletInfo,
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}
      >
        <Story />
      </View>
    ),
  ],
}

export default meta

const mockPressHandler = () => alert('Button pressed')

export const Default: Story<WalletInfoProps> = args => <WalletInfo {...args} />
Default.args = {
  walletInfo: {
    walletName: 'My Wallet',
    balance: BigInt(1_234_567_890),
    accountAddress: '0xABC123...',
    copyAddressClicked: false,
    onCopyWalletToClipboardPress: mockPressHandler,
    onSendPress: mockPressHandler,
    onReceivePress: mockPressHandler,
    onStakePress: mockPressHandler,
    onWalletNamePress: mockPressHandler,
  },
  isBalanceSyncBannerVisible: false,
}
