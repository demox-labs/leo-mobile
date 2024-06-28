// Divider component
import { View } from 'react-native'
import React from 'react'

const LeoDivider = (props: View['props']) => {
  return (
    <View
      {...props}
      className={`w-full bg-gray-100 h-[1px] ${props.className ?? ''}`}
    />
  )
}

export default LeoDivider
