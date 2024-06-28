import React from 'react'
import { View } from 'react-native'
import { Meta, StoryObj } from '@storybook/react'
import ConfigRadioButton, {
  ConfigRadioButtonProps,
} from '@src/components/send/config-radio-button'

const meta: Meta<ConfigRadioButtonProps> = {
  title: 'Components/ConfigRadioButton',
  component: ConfigRadioButton,
  args: {
    label: 'Option',
    isSelected: false,
    onPress: () => {},
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

type Story = StoryObj<ConfigRadioButtonProps>

export const Unselected: Story = {
  args: {
    label: 'Option 1',
    isSelected: false,
  },
}

export const Selected: Story = {
  args: {
    label: 'Option 2',
    isSelected: true,
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Custom Label',
    isSelected: true,
  },
}
