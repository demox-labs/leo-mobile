/* Refresh icon with spinning animation */

import React, { useLayoutEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

interface AnimatedLoadingProps {
  isLoading: boolean
  size?: number
  color?: string
}

const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  isLoading,
  size,
  color,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current

  useLayoutEffect(() => {
    if (isLoading) {
      // Start spinning
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      // Stop spinning
      const animation = Animated.timing(spinValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })

      animation.start(() => {
        spinValue.setValue(0)
      })

      return () => animation.stop()
    }
  }, [isLoading])

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const defaultColor = 'black'

  return (
    <View className="bg-gray-25 p-10 rounded-full">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <AntDesign
          name="loading1"
          size={size ?? 100}
          color={color ?? defaultColor}
        />
      </Animated.View>
    </View>
  )
}

export default AnimatedLoading
