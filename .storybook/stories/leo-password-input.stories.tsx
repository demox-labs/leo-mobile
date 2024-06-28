import React from 'react'
import { View } from 'react-native'
import LeoPasswordInput, {
  LeoPasswordInputProps,
} from '../../src/components/leo-password-input'
import { Meta, StoryObj } from '@storybook/react'

const meta: Meta<LeoPasswordInputProps> = {
  title: 'Components/LeoPasswordInput',
  component: LeoPasswordInput,
  args: {
    value: '',
    onChangeText: () => {},
    onStrengthChange: () => {},
    setIsSecureEntry: () => {},
    isSecureEntry: true,
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

type Story = StoryObj<LeoPasswordInputProps>

export const Default: Story = {
  args: {
    customStyles: {
      wrapper: 'w-80',
    },
  },
}

export const WeakPassword: Story = {
  args: {
    value: 'weakpass',
    customStyles: {
      wrapper: 'w-80',
    },
  },
}

export const MediumPassword: Story = {
  args: {
    value: 'Medium1',
    customStyles: {
      wrapper: 'w-80',
    },
  },
}

export const StrongPassword: Story = {
  args: {
    value: 'StrongPass1!',
    customStyles: {
      wrapper: 'w-80',
    },
  },
}

export const PasswordMatch: Story = {
  args: {
    value: 'Password1',
    type: 'verify',
    match: true,
    customStyles: {
      wrapper: 'w-80',
    },
  },
}

export const PasswordMismatch: Story = {
  args: {
    value: 'Password1',
    type: 'verify',
    match: false,
    customStyles: {
      wrapper: 'w-80',
    },
  },
}
