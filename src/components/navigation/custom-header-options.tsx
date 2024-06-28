import React from 'react'
import { Platform, TouchableOpacity } from 'react-native'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { NavigationProp } from '@react-navigation/native'
import DotsIndicator from './dots-indicator'
import Icon from '../icons'

interface CustomHeaderOptionsProps {
  navigation: NavigationProp<ReactNavigation.RootParamList>
  dotsIndicatorConfig?: {
    activeDotIndex: number
    dotsLength: number
  }
}

const customHeaderOptions = (
  props: CustomHeaderOptionsProps,
): NativeStackNavigationOptions => {
  const { navigation } = props

  const headerTitle = () =>
    Platform.OS === 'ios' ? (
      <Icon name="leo-logo-purple" size={24} />
    ) : undefined

  const headerRight = () => {
    if (props.dotsIndicatorConfig) {
      const { activeDotIndex, dotsLength } = props.dotsIndicatorConfig
      return (
        <DotsIndicator currentIndex={activeDotIndex} dotsLength={dotsLength} />
      )
    }

    return null
  }

  return {
    headerShown: true,
    headerRight,
    headerTitle,
    headerShadowVisible: false,
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={24} />
      </TouchableOpacity>
    ),
  }
}

export default customHeaderOptions
