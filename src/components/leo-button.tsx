import React, { useState } from 'react'
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import AnimatedCircleLoader from '@src/components/icons/animated/circle-loader'

export type LeoButtonProps = TouchableOpacityProps & {
  label?: string
  className?: string
  type?: 'primary' | 'secondary' | 'link' | 'danger'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  isLoading?: boolean
}

const LeoButton = ({
  label,
  className = '',
  type = 'primary',
  icon,
  iconPosition = 'left',
  fullWidth = true,
  isLoading = false,
  ...props
}: LeoButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)
  const isDisabled = props.disabled
  let backgroundColor = ''
  let textColor = 'text-black'
  const labelMargin = iconPosition === 'left' ? 'ml-1' : 'mr-1'

  switch (type) {
    case 'primary':
      backgroundColor = isDisabled ? 'bg-gray-200' : 'bg-primary-500'
      textColor = isDisabled ? 'text-gray-400' : 'text-white'
      if (isPressed) {
        backgroundColor = 'bg-primary-600'
      }
      break
    case 'secondary':
      backgroundColor = isDisabled ? 'bg-gray-200' : 'bg-gray-50'
      if (isPressed) {
        backgroundColor = 'bg-gray-100'
      }
      break
    case 'link':
      backgroundColor = 'bg-transparent'
      if (isPressed) {
        backgroundColor = 'bg-gray-50'
      }
      break
    case 'danger':
      backgroundColor = isDisabled ? 'bg-gray-200' : 'bg-red-500'
      textColor = isDisabled ? 'text-gray-400' : 'text-white'
      if (isPressed) {
        backgroundColor = 'bg-red-600'
      }
      break
  }

  const buttonClassNames = `${
    fullWidth ? 'w-full' : 'flex-1'
  } rounded-lg justify-center h-[48px] ${backgroundColor} ${className}`

  const renderButtonContent = () => {
    if (isLoading) {
      return (
        <View className="flex items-center justify-center">
          <AnimatedCircleLoader size={24} color="#fff" />
        </View>
      )
    }
    return (
      <View className="flex-row items-center justify-center">
        {iconPosition === 'left' ? icon ?? null : null}
        {/* 
        
        Do not change the logical OR (||) below to nullish coalescing operator (??). 
        We want always to render a label. If children is any falsy value, like an 
        empty string (''), 0, false, null or undefined, the label will be rendered.

        */}
        {props.children || (
          <Text
            className={`${textColor} text-center text-base font-medium ${icon ? labelMargin : ''}`}
          >
            {label}
          </Text>
        )}
        {iconPosition === 'right' ? icon ?? null : null}
      </View>
    )
  }

  return (
    <TouchableOpacity
      {...props}
      className={buttonClassNames}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1} // Prevents opacity change on press
      disabled={isDisabled || isLoading}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  )
}

export default LeoButton
