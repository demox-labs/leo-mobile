import React from 'react'
import { View } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import LeoSwitch from '@src/components/leo-switch'

const meta: Meta = {
  title: 'Components/LeoSwitch',
  component: LeoSwitch,
  args: {
    value: false,
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj

export const Off: Story = {
  args: {
    value: false,
  },
}

export const On: Story = {
  args: {
    value: true,
  },
}

export const Disabled: Story = {
  args: {
    value: false,
    disabled: true,
  },
}

export const CustomColor: Story = {
  args: {
    value: true,
    trackColor: 'lightgreen',
  },
}
