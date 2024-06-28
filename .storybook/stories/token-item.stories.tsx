import React from 'react'
import { View } from 'react-native'
import { Meta, Story } from '@storybook/react'
import TokenItem from '../../src/components/token-list/token-item'
import { Token } from '../../src/types/tokens'

const meta: Meta = {
  title: 'Components/TokenItem',
  component: TokenItem,
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

export const Default: Story<{ token: Token }> = args => <TokenItem {...args} />
Default.args = {
  token: {
    id: '1234',
    symbol: 'ALEO',
    balance: BigInt(23_000_000),
    name: 'Aleo',
  },
}
