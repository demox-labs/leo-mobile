import { router } from 'expo-router'
import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import Icon from './icons'

interface HeaderProps {
  title: string
  right?: React.ReactNode
  children?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ title, right, children }) => {
  const handleGoBack = () => {
    if (router.canGoBack()) return router.back()

    router.push('/home')
  }

  return (
    <View className="flex flex-row items-center justify-between py-4">
      <TouchableOpacity onPress={handleGoBack}>
        <Icon name="arrow-left" size={24} />
      </TouchableOpacity>

      {children ?? (
        <>
          <Text
            className={`text-xl font-semibold flex-1 text-center ${
              !!right && 'ml-5'
            }`}
          >
            {title}
          </Text>
          <View style={{ width: 24 }} />
        </>
      )}

      {right ? right : null}
    </View>
  )
}

export default Header
