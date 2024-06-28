import React, { FC, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { AppInfo } from '@src/types/browser'
import LeoButton from '@src/components/leo-button'
import Icon from '@src/components/icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import TabsCounterIcon from '@src/components/browser/tabs/tabs-counter-icon'
import LeoPressable from '@src/components/leo-pressable'

export type AppGridItemProps = {
  type?: 'recent' | 'search'
  title: string
  url?: string
  imageSource?: any
  onPress?: () => void
}

export const RecommendationGridItem: FC<AppGridItemProps> = ({
  title,
  imageSource,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress}>
    <View className="w-20 mb-4 items-center">
      <Image className="h-16 w-16 rounded-lg mb-1" source={imageSource} />
      <Text className="text-center text-sm w-[70px]">{title}</Text>
    </View>
  </TouchableOpacity>
)

export const RecentOrSearchTermGridItem: FC<AppGridItemProps> = ({
  type = 'recent',
  title,
  url,
  imageSource,
  onPress,
}) => {
  const renderImage = () => {
    if (imageSource) {
      return (
        <Image
          className="h-[32px] w-[32px] rounded-3xl mb-1"
          source={imageSource}
        />
      )
    }

    if (type === 'search') {
      return (
        <View className="h-[32px] w-[32px] rounded-3xl bg-gray-50 justify-center items-center">
          <Icon name="search" size={20} />
        </View>
      )
    }

    return (
      <View className="h-[32px] w-[32px] rounded-3xl bg-gray-50 justify-center items-center">
        <Icon name="globe" size={20} />
      </View>
    )
  }

  return (
    <LeoPressable
      useDefaultStyles={false}
      onPress={onPress ?? (() => {})}
      className={`mb-2 rounded-lg justify-center p-2 ${type === 'search' ? '' : 'max-h-[52px]'}`}
    >
      <View className="flex-row items-center gap-2">
        {renderImage()}
        <View className="flex-1">
          <Text className="text-base font-semibold">{title}</Text>
          <Text className="text-sm text-gray-600">
            {type === 'recent' ? url : 'Search with Google'}
          </Text>
        </View>
      </View>
    </LeoPressable>
  )
}

interface RightIconProps {
  tabsCount: number
  isFocused: boolean
  onClose: () => void
  onOpenTabs: () => void
}
const RightIcon: FC<RightIconProps> = ({
  tabsCount,
  isFocused,
  onClose,
  onOpenTabs,
}) => {
  if (isFocused) {
    return (
      <TouchableOpacity onPress={onClose} className="ml-[19px]">
        <Text className="text-base">Cancel</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onOpenTabs} className="ml-[19px]">
      <TabsCounterIcon count={tabsCount > 0 ? tabsCount : '+'} />
    </TouchableOpacity>
  )
}

interface BrowserTextInputProps {
  tabsCount: number
  placeholder?: string
  value?: string
  isFocused: boolean
  hasText: boolean
  setShowRecents: (showRecent: boolean) => void
  onChangeText: (text: string) => void
  onSubmitEditing?: () => void
  onOpenTabs: () => void
}
export const BrowserTextInput: FC<BrowserTextInputProps> = ({
  tabsCount,
  placeholder,
  value,
  isFocused,
  hasText,
  setShowRecents,
  onChangeText,
  onSubmitEditing,
  onOpenTabs,
}) => {
  const inputRef = useRef<TextInput>(null)
  const [localIsFocused, setLocalIsFocused] = useState(isFocused)
  const borderColor = localIsFocused ? 'border-purple-500' : 'border-gray-200'
  const delay = isFocused ? 0 : 700

  const onClose = () => {
    Keyboard.dismiss()
    setLocalIsFocused(false)
    setShowRecents(false)
    onChangeText('')
  }

  const onFocus = () => {
    setLocalIsFocused(true)
    setShowRecents(true)
  }

  const onBlur = () => {
    setLocalIsFocused(false)
  }

  const handleClose = () => {
    if (hasText) {
      onChangeText('')
    } else {
      onClose()
    }
  }

  useEffect(() => {
    // Delay focus to prevent keyboard glitchy animation on screen mount
    setTimeout(() => {
      isFocused && inputRef.current?.focus()
    }, delay)
  }, [isFocused])

  return (
    <View className="flex-row items-center h-[40px] mb-8">
      <View
        className={`flex-row flex-1 items-center border ${borderColor} rounded-lg h-full`}
      >
        <Icon name="search" className="ml-2" size={20} />
        <TextInput
          ref={inputRef}
          className="h-12 px-2 flex-1"
          placeholder={placeholder}
          value={value}
          onChangeText={text => {
            onChangeText(text)
          }}
          onSubmitEditing={onSubmitEditing}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType="go"
        />
        {hasText && (
          <TouchableOpacity onPress={handleClose}>
            <Icon name="close-circle-fill" className="mr-2" size={20} />
          </TouchableOpacity>
        )}
      </View>
      <RightIcon
        tabsCount={tabsCount}
        isFocused={isFocused}
        onClose={handleClose}
        onOpenTabs={onOpenTabs}
      />
    </View>
  )
}

export type BrowserScreenProps = {
  tabsCount: number
  recommendations: AppInfo[]
  recents: AppInfo[]
  isEnabled: boolean
  showRecents: boolean
  setShowRecents: (showRecents: boolean) => void
  onAppPress: (url: string) => void
  handleSearchSubmit: (searchQuery: string) => void
  onGoToSettings: () => void
  onOpenTabs: () => void
}
const BrowserScreen: FC<BrowserScreenProps> = ({
  tabsCount,
  recommendations,
  recents,
  isEnabled,
  showRecents,
  setShowRecents,
  onAppPress,
  handleSearchSubmit,
  onGoToSettings,
  onOpenTabs,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const hasText = searchQuery.length > 0

  const recentsIsEmpty = recents.length === 0
  const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '')

  if (!isEnabled) {
    return (
      <SafeAreaView className="bg-white flex-1 p-4 items-center justify-center gap-y-12">
        <View className="items-center justify-center">
          <Icon name="background-circle" />
          <Icon name="browser" className="absolute" size={90} />
        </View>
        <View className="flex flex-col items-center gap-y-4">
          <Text className="text-2xl font-bold">Browser is disabled</Text>
          <Text className="text-base">
            Enable this feature in the settings.
          </Text>
        </View>
        <LeoButton
          label="Go to Settings"
          onPress={onGoToSettings}
          type="secondary"
          className="mb-14"
        />
      </SafeAreaView>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        className="flex-1 bg-white p-4 pt-[8px]"
        pointerEvents="box-none"
      >
        <BrowserTextInput
          tabsCount={tabsCount}
          placeholder="Search or type URL"
          value={searchQuery}
          isFocused={showRecents}
          hasText={hasText}
          setShowRecents={setShowRecents}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearchSubmit(searchQuery)}
          onOpenTabs={onOpenTabs}
        />
        {hasText ? (
          <RecentOrSearchTermGridItem
            type="search"
            title={searchQuery}
            onPress={() => handleSearchSubmit(searchQuery)}
          />
        ) : (
          <>
            <Text className="text-base font-semibold mb-4">
              {showRecents ? 'Recent' : 'Recommendations'}
            </Text>
            <ScrollView>
              {showRecents ? (
                recentsIsEmpty ? (
                  <Text className="text-base">No recent websites</Text>
                ) : (
                  recents.map(({ name, image, url }) => (
                    <RecentOrSearchTermGridItem
                      title={name!}
                      url={removeProtocol(url ?? '')}
                      imageSource={image}
                      key={url}
                      onPress={() => onAppPress(url!)}
                    />
                  ))
                )
              ) : (
                <View className="flex-row flex-wrap justify-between mb-8">
                  {recommendations.map(({ name, image, url }) => (
                    <RecommendationGridItem
                      title={name!}
                      imageSource={image}
                      key={url}
                      onPress={() => onAppPress(url!)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

export default BrowserScreen
