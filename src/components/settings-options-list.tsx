import React, { useState } from 'react'
import { Text, FlatList, TouchableOpacity, FlatListProps } from 'react-native'
import { router } from 'expo-router'
import Icon from './icons'
import LeoDivider from './leo-divider'
import { useAleoClient } from '@src/lib/aleo'

export interface OptionItem {
  id: string
  text: string
  href?: string
  hasBottomBorder?: boolean
  hasTopBorder?: boolean
  Icon: React.ComponentType<any>
}

const Option: React.FC<{ item: OptionItem }> = ({ item }) => {
  const [pressed, setPressed] = useState(false)
  const { lock } = useAleoClient()

  const className = `flex-row items-center py-4 px-2 my-1 rounded-lg ${pressed ? 'bg-gray-50' : ''}`

  const handleOnPress = () => {
    if (item.id === '11') {
      lock()
    } else if (item.href) {
      router.push(item.href as any)
    }
  }

  return (
    <>
      {item.hasTopBorder && <LeoDivider />}
      <TouchableOpacity
        className={className}
        onPress={handleOnPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        activeOpacity={1} // disable the opacity change on press
      >
        <item.Icon size={26} color="black" className="mr-4" />
        <Text className="flex-1 ml-4 text-lg">{item.text}</Text>
        <Icon name="chevron-right" size={24} color="black" className="ml-4" />
      </TouchableOpacity>
      {item.hasBottomBorder ? <LeoDivider /> : null}
    </>
  )
}

interface OptionListProps
  extends Omit<FlatListProps<OptionItem>, 'renderItem'> {}

const OptionList: React.FC<OptionListProps> = props => {
  return (
    <FlatList
      keyExtractor={item => item.id}
      className="w-full px-4"
      renderItem={({ item }) => <Option item={item} />}
      {...props}
    />
  )
}

export default OptionList
