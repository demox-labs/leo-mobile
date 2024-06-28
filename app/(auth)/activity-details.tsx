import React, { useCallback } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'react-native'
import { IActivity } from '@src/types/activities'
import ActivityDetailsScreen from '@src/screens/activity-details-screen'

type ActivityDetailsRouteParams = {
  isVisible: 'true' | 'false'
  amount: string
  activity: string
}

const ActivityDetailsRoute = () => {
  const { isVisible, amount, activity } =
    useLocalSearchParams<ActivityDetailsRouteParams>()

  const parsedAmount = amount === 'undefined' ? undefined : Number(amount)

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content')
    }, []),
  )

  return (
    <ActivityDetailsScreen
      isVisible={isVisible === 'true'}
      amount={parsedAmount}
      activity={JSON.parse(activity || '{}') as IActivity}
    />
  )
}

export default ActivityDetailsRoute
