import React from 'react'
import { View } from 'react-native'
import { Meta, Story } from '@storybook/react'
import BalancePendingBanner, {
  BalancePendingBannerProps,
} from '../../src/components/home/balance-pending-banner'

const meta: Meta = {
  title: 'Components/BalancePendingBanner',
  component: BalancePendingBanner,
  argTypes: {
    syncProgress: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
        step: 1,
      },
    },
  },
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

export const Default: Story<BalancePendingBannerProps> = args => (
  <BalancePendingBanner {...args} />
)
Default.args = {
  syncProgress: 50,
  isVisible: true,
}
