import React from 'react'
import { View } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import LeoToast, { LeoToastProps } from '@src/components/leo-toast'

const meta: Meta<LeoToastProps> = {
  title: 'Components/LeoToast',
  component: LeoToast,
  args: {
    type: 'info',
    message: 'This is an informational message!',
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

type Story = StoryObj<LeoToastProps>

export const Info: Story = {
  args: {
    type: 'info',
    message: 'This is an informational message!',
  },
}

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Be careful! This is a warning.',
  },
}

export const Danger: Story = {
  args: {
    type: 'danger',
    message: 'Danger! Something went wrong.',
  },
}

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Success! Your operation was completed.',
  },
}

export const LongText: Story = {
  args: {
    type: 'info',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies aliquam, nisl nunc aliquet nunc, vitae aliquam nisl nunc eget nunc. Donec auctor, nisl eget ultricies aliquam, nisl nunc aliquet nunc, vitae aliquam nisl nunc eget nunc.',
  },
}
