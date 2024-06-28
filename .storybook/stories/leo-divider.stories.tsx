import React from 'react'
import { View } from 'react-native'
import LeoDivider from '../../src/components/leo-divider'
import { Meta, StoryObj } from '@storybook/react-native'

const meta: Meta = {
  title: 'Components/LeoDivider',
  component: LeoDivider,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingHorizontal: 10 }}>
        <Story />
      </View>
    ),
  ],
}

export default meta

type Story = StoryObj

export const Default: Story = {}