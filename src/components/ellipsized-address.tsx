import React from 'react'
import { Text, TextProps } from 'react-native'

interface EllipsizedAddressProps extends TextProps {
  address?: string
}

const EllipsizedAddress: React.FC<EllipsizedAddressProps> = ({
  address,
  ...props
}) => {
  const defaultStyles = 'text-base text-black w-[100px]'

  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="middle"
      className={defaultStyles}
      {...props}
    >
      {address}
    </Text>
  )
}

export default EllipsizedAddress
