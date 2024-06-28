/* Refresh icon with spinning animation */

import React, { useLayoutEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Icon from '..'

interface AnimatedCircleLoaderProps {
  isLoading?: boolean
  size?: number
  color?: string
}

const AnimatedCircleLoader: React.FC<AnimatedCircleLoaderProps> = ({
  isLoading = true,
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

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon name="circle-loader" size={size ?? 24} color={color} />
    </Animated.View>
  )
}

export default AnimatedCircleLoader
