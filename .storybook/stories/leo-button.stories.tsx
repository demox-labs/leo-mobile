import React from 'react'
import { View } from 'react-native'
import LeoButton, { LeoButtonProps } from '../../src/components/leo-button'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta<LeoButtonProps> = {
  title: 'Components/LeoButton',
  component: LeoButton,
  argTypes: {
    onPress: { action: 'pressed the button' },
  },
  args: {
    label: 'Hello world',
  },
  decorators: [
    Story => (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          paddingHorizontal: 10,
        }}
      >
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj<LeoButtonProps>

export const Primary: Story = {}

export const PrimaryDisabled: Story = {
  args: {
    disabled: true,
  },
}

export const Secondary: Story = {
  args: {
    type: 'secondary',
  },
}

export const SecondaryDisabled: Story = {
  args: {
    type: 'secondary',
    disabled: true,
  },
}

export const Link: Story = {
  args: {
    type: 'link',
  },
}

export const LinkDisabled: Story = {
  args: {
    type: 'link',
    disabled: true,
  },
}

export const Danger: Story = {
  args: {
    type: 'danger',
  },
}

export const DangerDisabled: Story = {
  args: {
    type: 'danger',
    disabled: true,
  },
}
