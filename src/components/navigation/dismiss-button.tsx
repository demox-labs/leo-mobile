import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Icon, { IconNamesUnion } from '../icons'

type DismissButtonProps = TouchableOpacityProps & {
  iconOptions?: {
    name?: IconNamesUnion
    size?: number
    color?: string
  }
}
export const DismissButton = ({
  iconOptions,
  ...props
}: DismissButtonProps) => {
  return (
    <TouchableOpacity
      {...props}
      hitSlop={{
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      }}
    >
      <Icon
        name={iconOptions?.name || 'close-fill'}
        size={iconOptions?.size || 24}
        color={iconOptions?.color || '#000000'}
      />
    </TouchableOpacity>
  )
}
