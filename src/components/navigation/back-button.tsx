import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Icon from '../icons'

export const BackButton = (props: TouchableOpacityProps) => (
  <TouchableOpacity {...props}>
    <Icon name="arrow-left" size={24} />
  </TouchableOpacity>
)
