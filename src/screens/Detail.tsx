import { View, Text } from 'react-native'
import React, { FC } from 'react'

interface DetailScreenProps {
  id: string
}

const DetailScreen: FC<DetailScreenProps> = ({ id }) => {
  return (
    <View>
      <Text>Detail: {id}</Text>
    </View>
  )
}

export default DetailScreen
