import React, { useCallback } from 'react'
import ActivitiesScreen from '@src/screens/activities'
import { useFocusEffect } from 'expo-router'
import { StatusBar } from 'react-native'

const ActivitiesRoute = () => {
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  return <ActivitiesScreen />
}

export default ActivitiesRoute
