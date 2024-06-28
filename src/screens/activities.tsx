import ActivityList from '@src/components/activity-list'
import React, { memo } from 'react'
import { View } from 'react-native'
import { useActivities } from '@src/hooks/useActivities'
import AnimatedCircleLoader from '@src/components/icons/animated/circle-loader'

type ActivityProps = {
  programId?: string | null
}

const ActivitiesScreen = memo<ActivityProps>(
  ({ programId }: { programId?: string | null }) => {
    const activities = useActivities(programId) // TODO: Would it be possible to return a loading state here?

    const mockedLoadingState = false // TODO: Remove this when we have a real loading state (coming from useActivities hook?)

    if (mockedLoadingState) {
      return (
        <View className="flex-1 justify-center items-center">
          <AnimatedCircleLoader size={40} />
        </View>
      )
    }

    return (
      <View className="flex-1 bg-white pt-5">
        <ActivityList activities={activities} />
      </View>
    )
  },
)

ActivitiesScreen.displayName = 'ActivitiesScreen'

export default ActivitiesScreen
