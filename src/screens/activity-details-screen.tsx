import { View, Text, StatusBar, Linking } from 'react-native'
import React, { useCallback } from 'react'
import useBottomMargin from '@src/hooks/useBottomMargin'
import { useFocusEffect } from 'expo-router'
import LeoDivider from '@src/components/leo-divider'
import LeoButton from '@src/components/leo-button'
import { ActivityType, IActivity } from '@src/types/activities'
import { useAccount } from '@src/lib/aleo/ready'

const renderEllipsizedAddress = (address: string) => {
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="middle"
      className="text-base text-black w-[100px]"
    >
      {address}
    </Text>
  )
}

const getStatus = (type: ActivityType) => {
  switch (type) {
    case ActivityType.PendingTransaction:
      return { label: 'Pending', style: 'text-yellow-500' }
    case ActivityType.ProcessingTransaction:
      return { label: 'Processing', style: 'text-blue-500' }
    case ActivityType.CompletedTransaction:
      return { label: 'Completed', style: 'text-green-500' }
    default:
      return { label: 'Unknown', style: 'text-gray-500' }
  }
}

const parseTransactionDetails = (message: string) => {
  const lowerCaseMessage = message.toLowerCase()

  let type = 'Default' // Default transaction type
  let assetLabel = 'ALEO' // Default asset label

  // Handling conversion related messages
  if (lowerCaseMessage.includes('converted')) {
    const isNFT = lowerCaseMessage.includes('nft')
    const isPublic = lowerCaseMessage.includes('to public')
    const isPrivate = lowerCaseMessage.includes('to private')

    if (isNFT && isPublic) {
      type = 'Convert to Public NFT'
      assetLabel = 'Public NFT ALEO'
    } else if (isNFT && isPrivate) {
      type = 'Convert to Private NFT'
      assetLabel = 'Private NFT ALEO'
    } else if (!isNFT && isPublic) {
      type = 'Convert to Public Credits'
      assetLabel = 'Public credits ALEO'
    } else if (!isNFT && isPrivate) {
      type = 'Convert to Private Credits'
      assetLabel = 'Private credits ALEO'
    } else {
      type = 'Convert' // General convert case if specifics not determined
    }
  }
  // Handling executed related messages
  else if (lowerCaseMessage.includes('executed')) {
    const bondPublic = lowerCaseMessage.includes('bond_public')
    const unbondPublic = lowerCaseMessage.includes('unbond_public')
    const claimUnbondPublic = lowerCaseMessage.includes('claim_unbond_public')

    if (bondPublic) {
      type = 'Executed Bond Public'
      assetLabel = 'Public credits ALEO'
    } else if (unbondPublic) {
      type = 'Executed Unbond Public'
      assetLabel = 'Public credits ALEO'
    } else if (claimUnbondPublic) {
      type = 'Executed Claim Unbond Public'
      assetLabel = 'Public credits ALEO'
    } else {
      type = 'Executed' // Generic executed case
    }
  }
  // Simple cases for received and sent
  else if (lowerCaseMessage.includes('received')) {
    type = 'Received'
  } else if (lowerCaseMessage.includes('sent')) {
    type = 'Sent'
  }

  return { type, assetLabel }
}

const getActivityDirectionDetailsFromMessage = (
  message: string,
  address: string,
  walletName: string,
) => {
  const to = address

  let displayFrom = 'Unknown' as React.ReactNode
  let displayTo = 'Unknown' as React.ReactNode
  const lowerCaseMessage = message.toLowerCase()

  if (lowerCaseMessage.includes('received')) {
    displayTo = `You (${walletName})` // The current wallet is the recipient
    displayFrom = to ? renderEllipsizedAddress(to) : 'Unknown'
  } else if (lowerCaseMessage.includes('sent')) {
    displayFrom = `You (${walletName})` // Sender is the current wallet
    displayTo = to ? renderEllipsizedAddress(to) : 'Unknown'
  }

  return { displayFrom, displayTo }
}

const formatDate = (timestamp: number | string): string => {
  let date: Date

  if (typeof timestamp === 'number') {
    // Ensure the timestamp is in milliseconds
    date = new Date(timestamp * 1000)
  } else if (typeof timestamp === 'string') {
    // Attempt to parse string as number if possible
    const numericTimestamp = parseFloat(timestamp)
    if (!isNaN(numericTimestamp)) {
      date = new Date(numericTimestamp * 1000)
    } else {
      date = new Date(timestamp)
    }
  } else {
    return 'Invalid Date'
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid Date:', timestamp)
    return 'Invalid Date'
  }

  const datePart = date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })

  const timePart = date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart}, ${timePart}`
}

interface LabelValueProps {
  label: React.ReactNode
  value: React.ReactNode
}
const LabelValue: React.FC<LabelValueProps> = ({ label, value }) => {
  const renderValue =
    typeof value === 'string' ? (
      <Text className="text-base text-black">{value}</Text>
    ) : (
      value
    )

  return (
    <View className="flex flex-row w-full justify-between mb-2">
      <Text className="text-base text-gray-500">{label}</Text>
      {renderValue}
    </View>
  )
}

export interface ActivityDetailsScreenProps {
  isVisible: boolean
  amount?: number | null
  activity: IActivity
}

const ActivityDetailsScreen: React.FC<ActivityDetailsScreenProps> = ({
  isVisible,
  amount,
  activity,
}) => {
  const {
    timestamp,
    token,
    message,
    fee,
    type,
    explorerLink,
    // txId,
    // key,
    address, // TODO: VERIFY -> This is the same address as the current logged in wallet when it is RECEIVED and it applies to the "to" screen field. When it is SENT, it applies to the "from" screen field.
  } = activity

  // Received -> to
  // Sent -> from

  const account = useAccount()
  const walletName = account?.name
  // const accountAddress = account?.publicKey

  // When receiving a private transaction, we don't know the address ("from" field) so, we put "Unkwown" instead.

  const { type: transactionType, assetLabel } = parseTransactionDetails(message)
  const { displayFrom, displayTo } = getActivityDirectionDetailsFromMessage(
    message,
    address,
    walletName,
  )
  const statusInfo = getStatus(type)
  const formattedTimestamp = formatDate(timestamp)

  const amountSign = message.includes('Received') ? '+' : ''

  const amountIntegerPart = amount?.toString().split('.')[0]
  const amountDecimalPart = amount?.toString().split('.')[1]

  const bottomMargin = useBottomMargin()

  const isReceived = message.includes('Received')

  const numberColor = isReceived ? 'text-green-500' : ''

  const onViewOnExplorerButtonPress = React.useCallback(() => {
    if (!explorerLink) return
    // Open on App Browser:
    // router.push({
    //   pathname: '/browser/browser-webview',
    //   params: {
    //     url: explorerLink,
    //     isActivityLink: 'true',
    //   },
    // })

    // Open on system browser:
    Linking.openURL(explorerLink)
  }, [explorerLink])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle(isVisible ? 'light-content' : 'dark-content')
    }, [isVisible]),
  )

  return (
    <View className="flex flex-1 bg-white p-4 justify-center items-center pb-10">
      <Text className="text-lg font-bold mb-1">{transactionType}</Text>
      {amount ? (
        <View className="justify-center items-center mt-[69px] mb-[56px]">
          <View className="flex flex-row items-end justify-center items-center">
            <Text
              className={`text-5xl text-black font-bold ${numberColor}`}
            >{`${amountSign}${amountIntegerPart}`}</Text>
            <Text className={`text-3xl text-black font-bold ${numberColor}`}>
              {amountDecimalPart ? `.${amountDecimalPart}` : '.00'}
            </Text>
          </View>
          {/* <Text className='text-xl text-black mb-2'>
            {`${amountSign}${Math.abs(amount).toFixed(5)} ${currency}`}
          </Text> */}
          <Text className="text-xl text-gray-500 mb-1">{assetLabel}</Text>
        </View>
      ) : null}
      <View className="flex-1 items-center">
        {statusInfo && (
          <LabelValue
            label="Status"
            value={
              <Text className={`text-base font-bold ${statusInfo.style}`}>
                {statusInfo.label}
              </Text>
            }
          />
        )}
        {timestamp && (
          <LabelValue label="Timestamp" value={formattedTimestamp} />
        )}
        <LeoDivider className="my-2" />
        <LabelValue label="From" value={displayFrom} />
        <LabelValue label="To" value={displayTo} />
        <LeoDivider className="my-2" />
        {transactionType && (
          <LabelValue label="Type" value="Private transaction" />
        )}
        {fee !== undefined && (
          <LabelValue label="Fee" value={`${fee} ${token}`} />
        )}
      </View>
      <LeoButton
        label="View on explorer"
        className={`mt-auto ${bottomMargin}`}
        type="secondary"
        disabled={!explorerLink}
        onPress={onViewOnExplorerButtonPress}
      />
    </View>
  )
}

export default ActivityDetailsScreen
