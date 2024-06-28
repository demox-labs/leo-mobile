import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, Animated, ViewProps } from 'react-native'
import Icon from '@src/components/icons'
import colors from 'tailwind.config.colors'
import { SendConfig } from '@src/types/send'

interface TogglePrivacyIncludeAdvancedProps extends ViewProps {
  sendType: SendConfig
  receivedType: SendConfig
  disablePublic?: boolean
  disablePrivate?: boolean
  renderAdvanced?: boolean
  onPressPrivate: () => void
  onPressPublic: () => void
  onPressAdvanced: () => void
}

const TogglePrivacyIncludeAdvanced: React.FC<
  TogglePrivacyIncludeAdvancedProps
> = ({
  sendType,
  receivedType,
  disablePublic = false,
  disablePrivate = false,
  onPressPrivate,
  onPressPublic,
  onPressAdvanced,
  ...props
}) => {
  const sendTypeAndReceivedTypeArePublic =
    sendType === 'public' && receivedType === 'public'
  const sendTypeAndReceivedTypeArePrivate =
    sendType === 'private' && receivedType === 'private'

  const defaultPrivacy = () => {
    if (sendTypeAndReceivedTypeArePublic) {
      return 'Public'
    } else if (sendTypeAndReceivedTypeArePrivate) {
      return 'Private'
    } else {
      return 'Advanced'
    }
  }

  const [selected, setSelected] = useState<'Private' | 'Public' | 'Advanced'>(
    defaultPrivacy,
  )

  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    animateSwitch(selected)

    return () => {
      animatedValue.removeAllListeners()
    }
  }, [selected])

  const handlePress = (option: 'Private' | 'Public' | 'Advanced') => {
    if (option !== selected) {
      if (
        (option === 'Private' && !disablePrivate) ||
        (option === 'Public' && !disablePublic) ||
        option === 'Advanced'
      ) {
        setSelected(option)
      }
    }

    if (option === 'Private') {
      onPressPrivate()
    } else if (option === 'Public') {
      onPressPublic()
    } else if (option === 'Advanced') {
      onPressAdvanced()
    }
  }

  const animateSwitch = (option: 'Private' | 'Public' | 'Advanced') => {
    Animated.timing(animatedValue, {
      toValue: option === 'Private' ? 0 : option === 'Public' ? 1 : 2,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const containerWidth = 343
  const switchWidth = containerWidth / 3

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [4, containerWidth / 3, containerWidth * (2 / 3) - 4],
  })

  return (
    <View {...props} className={`items-center ${props.className}`}>
      <View
        className={
          'relative flex-row rounded-full overflow-hidden bg-gray-50 h-[48px] justify-center'
        }
        style={{ width: containerWidth }}
      >
        <Animated.View
          className={
            'absolute left-0 right-0 top-1 bottom-1 bg-white rounded-full'
          }
          style={{ transform: [{ translateX }], width: switchWidth }}
        />
        <Pressable
          onPress={() => handlePress('Private')}
          className="flex-1 py-2 justify-center items-center flex-row gap-1"
        >
          <Text className={disablePrivate ? 'text-gray-400' : 'text-black'}>
            Private
          </Text>
          {disablePrivate ? (
            <Icon name="info" size={16} color={colors.gray['400']} />
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => handlePress('Public')}
          className="flex-1 py-2 justify-center items-center flex-row gap-1"
        >
          <Text className={disablePublic ? 'text-gray-400' : 'text-black'}>
            Public
          </Text>
          {disablePublic ? (
            <Icon name="info" size={16} color={colors.gray['400']} />
          ) : null}
        </Pressable>
        <Pressable
          onPress={() => handlePress('Advanced')}
          className="flex-1 py-2 justify-center items-center"
        >
          <Text className="text-black">Advanced</Text>
        </Pressable>
      </View>
    </View>
  )
}

interface TogglePrivacyPublicAndPrivateOnlyProps extends ViewProps {
  publicSelected: boolean
  onPressPrivate: () => void
  onPressPublic: () => void
}
const TogglePrivacyPublicAndPrivateOnly: React.FC<
  TogglePrivacyPublicAndPrivateOnlyProps
> = ({ publicSelected, onPressPrivate, onPressPublic, ...props }) => {
  const [selected, setSelected] = useState<'Private' | 'Public'>(
    publicSelected ? 'Public' : 'Private',
  )

  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    animateSwitch(selected)

    return () => {
      animatedValue.removeAllListeners()
    }
  }, [selected])

  const handlePress = (option: 'Private' | 'Public') => {
    if (option !== selected) {
      setSelected(option)
    }

    if (option === 'Private') {
      onPressPrivate()
    } else {
      onPressPublic()
    }
  }

  const animateSwitch = (option: 'Private' | 'Public') => {
    Animated.timing(animatedValue, {
      toValue: option === 'Private' ? 0 : option === 'Public' ? 1 : 2,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }

  const containerWidth = 165
  const switchWidth = containerWidth / 2

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, containerWidth / 2 - 4],
  })

  return (
    <View {...props} className={`items-center ${props.className}`}>
      <View
        className="flex-row rounded-full overflow-hidden bg-gray-50 h-[48px] justify-center"
        style={{ width: containerWidth }}
      >
        <Animated.View
          className={
            'absolute left-0 right-0 top-1 bottom-1 bg-white rounded-full'
          }
          style={{ transform: [{ translateX }], width: switchWidth }}
        />
        <Pressable
          onPress={() => handlePress('Private')}
          className="flex-1 py-2 justify-center items-center"
        >
          <Text>Private</Text>
        </Pressable>
        <Pressable
          onPress={() => handlePress('Public')}
          className="flex-1 py-2 justify-center items-center"
        >
          <Text>Public</Text>
        </Pressable>
      </View>
    </View>
  )
}

const TogglePrivacy: React.FC<
  TogglePrivacyIncludeAdvancedProps | TogglePrivacyPublicAndPrivateOnlyProps
> = props => {
  if ('publicSelected' in props) {
    return <TogglePrivacyPublicAndPrivateOnly {...props} />
  } else {
    return <TogglePrivacyIncludeAdvanced {...props} />
  }
}

export default TogglePrivacy
