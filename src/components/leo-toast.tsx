import React from 'react'
import { View, Text, ViewProps } from 'react-native'
import Icon, { IconProps } from './icons'

type AlertType = 'info' | 'warning' | 'danger' | 'success'

export interface LeoToastProps extends ViewProps {
  show?: boolean
  type: AlertType
  message?: string
  icon?: React.ReactNode
  containerStyle?: string
}

interface AlertStyle {
  icon: IconProps['name']
  backgroundColor: string
}

interface AlertStyles {
  [key: string]: AlertStyle
}

const alertStyles: AlertStyles = {
  info: {
    icon: 'info',
    backgroundColor: 'bg-blue-50',
  },
  warning: {
    icon: 'warning',
    backgroundColor: 'bg-yellow-50',
  },
  danger: {
    icon: 'danger',
    backgroundColor: 'bg-red-50',
  },
  success: {
    icon: 'success',
    backgroundColor: 'bg-green-50',
  },
}

const LeoToast: React.FC<LeoToastProps> = ({
  show = true,
  type,
  message,
  icon,
  containerStyle = '',
  children,
  ...props
}) => {
  const { backgroundColor } = alertStyles[type]

  if (!show) {
    return null
  }

  return (
    <View
      {...props}
      className={`p-4 flex-row items-start ${backgroundColor} rounded-lg ${containerStyle} ${props.className}`}
    >
      {icon ? icon : <Icon name={alertStyles[type].icon} size={20} />}
      {children ? (
        children
      ) : (
        <Text className={'flex-1 text-sm ml-3'}>{message}</Text>
      )}
    </View>
  )
}

export default LeoToast
