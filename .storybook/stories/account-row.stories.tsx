import React from 'react'
import { View } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import { AccountRowProps, AccountRow } from '../../src/screens/accounts'

const meta: Meta<AccountRowProps> = {
  title: 'Components/AccountRow',
  component: AccountRow,
  args: {
    name: 'Account Name',
  },
  decorators: [
    Story => (
      <View
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}
      >
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<AccountRowProps>

export const Default: Story = {}

export const Syncing: Story = {
  args: {},
}

export const Synced: Story = {
  args: {},
}

export const LongName: Story = {
  args: {
    name: 'Test Very Very Very Long Long Long Account Name',
  },
}
