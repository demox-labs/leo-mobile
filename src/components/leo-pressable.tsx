// A pressable button with custom pressed and default state (colors) that extends the Pressable component

import React, { useState } from 'react'
import { Pressable, PressableProps } from 'react-native'

interface LeoPressableProps extends PressableProps {
  onPress: () => void
  children: React.ReactNode
  className?: string
  useDefaultStyles?: boolean
  pressedStyle?: string
}

const LeoPressable: React.FC<LeoPressableProps> = ({
  onPress,
  children,
  className,
  useDefaultStyles = true,
  pressedStyle = 'bg-gray-50',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const pressableClassName = `${useDefaultStyles ? `${isPressed ? 'bg-gray-50' : ''} rounded-lg justify-center p-2` : ''} ${className ?? ''} ${isPressed && pressedStyle ? pressedStyle : ''}`

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={pressableClassName}
      {...props}
    >
      {children}
    </Pressable>
  )
}

export default LeoPressable
