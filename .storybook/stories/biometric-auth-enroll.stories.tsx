import React from 'react'
import { Meta, StoryObj } from '@storybook/react'
import BiometricAuthEnrollScreen, {
  Props,
} from '../../src/screens/biometric-auth-enroll'
import { AuthenticationType } from 'expo-local-authentication'

const meta: Meta = {
  title: 'Screens/Biometric Auth Enroll',
  component: BiometricAuthEnrollScreen,
  decorators: [Story => <Story />],
}

export default meta

const mockPressHandler = () => alert('Button pressed')

type Story = StoryObj<Props>

export const Default: Story = {
  args: {
    authenticationTypes: [
      AuthenticationType.FACIAL_RECOGNITION,
      AuthenticationType.FINGERPRINT,
      AuthenticationType.IRIS,
    ],
    onConfirm: mockPressHandler,
    onSkip: mockPressHandler,
  },
}

export const FingerprintOnly: Story = {
  args: {
    authenticationTypes: [AuthenticationType.FINGERPRINT],
    onConfirm: mockPressHandler,
    onSkip: mockPressHandler,
  },
}

export const FaceIdOnly: Story = {
  args: {
    authenticationTypes: [AuthenticationType.FACIAL_RECOGNITION],
    onConfirm: mockPressHandler,
    onSkip: mockPressHandler,
  },
}
