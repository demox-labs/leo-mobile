/* Refresh icon with spinning animation */

import React, { useLayoutEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Icon from '../index'
import colors from '@src/utils/colors'

interface AnimatedRefreshProps {
  isLoading: boolean
  size?: number
  color?: string
}

const AnimatedRefresh: React.FC<AnimatedRefreshProps> = ({
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
          duration: 500,
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

  const defaultColor = isLoading ? colors.gray['200'] : 'black'

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Icon name="refresh" size={size ?? 24} color={color ?? defaultColor} />
    </Animated.View>
  )
}

export default AnimatedRefresh
