import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, FlatListProps, StyleSheet } from 'react-native'
import ActivityItem, { ActivityItemProps } from './activity-item'
import { IActivity } from '@src/types/activities'
import { Locale } from 'date-fns/types'
import { getDateFnsLocale } from '@src/lib/i18n/core'
import { enUS } from 'date-fns/locale'
import Icon from '../icons'

type DisplayType = 'list' | 'screen'
type MyFlatListProps = Omit<FlatListProps<IActivity>, 'data' | 'renderItem'>

interface ActivityListProps extends MyFlatListProps {
  activities: IActivity[]
  display?: DisplayType
  topBackgroundColor?: string
  bottomBackgroundColor?: string
}

const renderActivity = ({ activity, dateFnsLocale }: ActivityItemProps) => (
  <ActivityItem
    key={activity.key}
    activity={activity}
    dateFnsLocale={dateFnsLocale}
  />
)

const ListEmptyComponent: React.FC<{ display: DisplayType }> = ({
  display,
}) => (
  <>
    {display === 'list' ? (
      <View className="flex justify-center py-2 pl-5">
        <Text className="text-base">No activities yet</Text>
        <Text className="text-sm text-gray-500">
          You will see your Activity here once you have one
        </Text>
      </View>
    ) : null}

    {display === 'screen' ? (
      <View className="flex-1 justify-center py-2 items-center gap-y-4">
        <Icon name="activities" size={40} />
        <Text className="text-medium font-bold">No activities yet</Text>
        <Text className="text-medium">
          You will see your Activity here once you have one.
        </Text>
      </View>
    ) : null}
  </>
)

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  display = 'screen',
  topBackgroundColor = 'bg-white', // Default top color
  bottomBackgroundColor = 'bg-white', // Default bottom color
  ...props
}) => {
  const [dateFnsLocale, setDateFnsLocale] = useState<Locale>(enUS)

  // TODO - replace with retryable SWR to detect locale changes (may be overkill)
  useEffect(() => {
    async function setLocale() {
      const locale = await getDateFnsLocale()
      setDateFnsLocale(locale)
    }
    setLocale()
  }, [])

  const data = useMemo(
    () =>
      activities.filter(
        (activity, index, self) =>
          index === self.findIndex(t => t.key === activity.key),
      ),
    [activities],
  )

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[styles.backgroundView, { top: 0, height: '30%' }]}
        className={topBackgroundColor}
      />
      <View
        style={[styles.backgroundView, { bottom: 0, height: '70%' }]}
        className={bottomBackgroundColor}
      />
      <FlatList<IActivity>
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={activity => activity.key}
        ListEmptyComponent={<ListEmptyComponent display={display} />}
        renderItem={({ item: activity }) =>
          renderActivity({ activity, dateFnsLocale })
        }
        data={data}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundView: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
  },
})

export default ActivityList
