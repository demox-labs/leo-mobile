import React from 'react'
import { View } from 'react-native'

interface DotsIndicatorProps {
  currentIndex: number
  dotsLength?: number
}

const DotsIndicator: React.FC<DotsIndicatorProps> = ({
  currentIndex,
  dotsLength = 3,
}) => {
  const dots = Array.from({ length: dotsLength }).map((_, index) => index)

  return (
    <View className={'flex-row justify-center items-center'}>
      {dots.map(index => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full mx-1 ${
            currentIndex >= index ? 'bg-primary-500' : 'bg-gray-100'
          }`}
        />
      ))}
    </View>
  )
}

export default DotsIndicator
