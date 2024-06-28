import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

import {
  Entypo,
  Feather,
  MaterialCommunityIcons,
  Octicons,
} from '@expo/vector-icons'

import Icon from '../icons'
import { IActivity, ActivityType } from '@src/types/activities'
import { ITransactionIcon } from '@src/lib/aleo/db/transaction-types'
import { extractFirstNumber } from '@src/lib/aleo-chain/helpers'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'
import { Locale } from 'date-fns/types'
import AnimatedCircleLoader from '../icons/animated/circle-loader'
import { router } from 'expo-router'

const iconGrabber = (activityType: ActivityType, iconSize = 20) => {
  switch (activityType) {
    case ActivityType.PendingTransaction:
    case ActivityType.ProcessingTransaction:
      return <AnimatedCircleLoader size={iconSize} />
    default:
      return <Entypo name="code" size={iconSize} />
  }
}

const transactionIconGrabber = (
  transactionIcon: ITransactionIcon,
  iconSize = 20,
) => {
  switch (transactionIcon) {
    case 'SEND':
      return <Feather name="arrow-up-right" size={iconSize} />
    case 'RECEIVE':
      return <Feather name="arrow-down-left" size={iconSize} />
    case 'DEPLOY':
      return <Octicons name="rocket" size={iconSize} />
    case 'REJECTED':
      return <MaterialCommunityIcons name="alert" size={iconSize} />
    case 'MINT':
      return <Icon name="hammer" width={iconSize} height={iconSize} />
    case 'CONVERT_PRIVATE':
      return <Icon name="image-private" width={iconSize} height={iconSize} />
    case 'CONVERT_PUBLIC':
      return <Icon name="image-public" width={iconSize} height={iconSize} />
    case 'CONVERT_PRIVATE_TOKEN':
      return <MaterialCommunityIcons name="lock-outline" size={iconSize} />
    case 'CONVERT_PUBLIC_TOKEN':
      return <Feather name="globe" size={iconSize} />
    case 'DEFAULT':
      return <Entypo name="code" size={iconSize} />
  }
}

// TODO handle languages
const getMessageFromTransactionIcon = (activity: IActivity) => {
  switch (activity.transactionIcon) {
    case 'SEND':
      return 'Sent'
    case 'RECEIVE':
      return 'Received'
    case 'DEPLOY':
      return 'Deploy'
    case 'REJECTED':
      return 'Rejected'
    case 'MINT':
      return 'Minted'
    case 'CONVERT_PRIVATE':
      return 'Convert to Private NFT'
    case 'CONVERT_PUBLIC':
      return 'Convert to Public NFT'
    case 'CONVERT_PRIVATE_TOKEN':
      return 'Convert to Private credits'
    case 'CONVERT_PUBLIC_TOKEN':
      return 'Convert to Public credits'
    default:
      return activity.message
  }
}

export interface ActivityItemProps {
  activity: IActivity
  dateFnsLocale: Locale
}
const ActivityItem: React.FC<ActivityItemProps> = React.memo<ActivityItemProps>(
  ({ activity, dateFnsLocale }: ActivityItemProps) => {
    const isReceived = activity.transactionIcon === 'RECEIVE'
    const message = getMessageFromTransactionIcon(activity)
    const icon = activity.transactionIcon
      ? transactionIconGrabber(activity.transactionIcon)
      : iconGrabber(activity.type)
    let secondaryMessage = formatDistanceToNow(
      new Date(Number(activity.timestamp) * 1000),
      {
        includeSeconds: true,
        addSuffix: true,
        locale: dateFnsLocale,
      },
    )
    if (activity.secondaryMessage) {
      secondaryMessage = activity.secondaryMessage
    }
    // Remove the "about" prefix
    if (secondaryMessage.startsWith('about ')) {
      secondaryMessage = secondaryMessage.slice(6)
    }
    const timeAgoElement = <Time>{() => <Text>{secondaryMessage}</Text>}</Time>
    // ONE DAY: We should save tx amt and icon on the transaction in the db at sync time
    // We don't currently do this in the extension as this info is a mobile only activity item
    const amount = extractFirstNumber(activity.message)

    const onActivityPress = () => {
      router.push({
        pathname: '/activity-details',
        params: {
          isVisible: 'true',
          amount: amount?.toString() ?? 'undefined',
          activity: JSON.stringify(activity),
        },
      })
    }

    return (
      <>
        <TouchableOpacity
          className="flex-row justify-between items-center py-2 gap-2 px-3"
          onPress={onActivityPress}
        >
          <View className="flex justify-center items-center w-[40] h-[40] bg-gray-50 rounded-3xl">
            {icon}
          </View>
          <View className="flex-1">
            <Text className="text-medium font-normal">{message}</Text>
            <Text className="text-xs text-gray-500">
              {timeAgoElement} {activity.fee ? `• ${activity.fee} fee` : null}
            </Text>
          </View>
          <View className="items-right">
            <Text
              className={`text-medium font-semibold ${
                isReceived && 'text-green-500'
              }`}
            >
              {isReceived && amount ? '+' : null}
              {amount ? amount.toFixed(2) : ''}
            </Text>
            <Text className="text-xs text-gray-500 text-right">
              {amount ? activity.token : null}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    )
  },
)

ActivityItem.displayName = 'ActivityItem'

type TimeProps = {
  children: () => React.ReactElement
}

const Time: React.FC<TimeProps> = ({ children }) => {
  const [value, setValue] = useState(children)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(children())
    }, 5_000)

    return () => {
      clearInterval(interval)
    }
  }, [setValue, children])

  return value
}

export default ActivityItem
