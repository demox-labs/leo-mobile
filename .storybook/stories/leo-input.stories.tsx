import React from 'react'
import { View } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import LeoInput, { LeoInputProps } from '@src/components/leo-input'

const meta: Meta<LeoInputProps> = {
  title: 'Components/LeoInput',
  component: LeoInput,
  args: {
    label: 'Default Label',
    placeholder: 'Placeholder',
    help: 'Help text goes here',
    value: '',
    onChangeText: () => {},
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

type Story = StoryObj<LeoInputProps>

export const Default: Story = {
  args: {
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithCustomLabel: Story = {
  args: {
    label: 'Private Key',
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    placeholder: 'Enter your email',
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithHelpText: Story = {
  args: {
    help: 'We will never share your email.',
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithRightButton: Story = {
  args: {
    rightButton: {
      label: 'Max',
      onPress: () => {},
    },
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const WithRightTextButtonDisabled: Story = {
  args: {
    rightButton: {
      label: 'Max',
      onPress: () => {},
      type: 'link',
      disabled: true,
    },
    customStyles: {
      wrapper: 'bg-white',
      input: 'text-black',
    },
  },
}

export const ImportAccountScreen: Story = {
  args: {
    label: 'Private Key',
    placeholder: 'e.g. APrivateKey1zkp...',
    help: 'The secret key of the account you want to import.',
    value: '',
    customStyles: {
      wrapper: 'mt-5',
    },
  },
}
