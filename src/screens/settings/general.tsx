import React from 'react'
import { ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import OptionSwitchItem from '@src/components/settings/option-item'

export interface Option {
  id: string
  title: string
  description: string
  value: boolean
}

type Props = {
  options: Option[]
  onOptionChange: (id: string, value: boolean) => void
}

const SettingsGeneral = (props: Props) => {
  return (
    <SafeAreaView className={'flex-1 bg-white px-4'} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {props.options.map(option => (
          <OptionSwitchItem
            key={option.id}
            title={option.title}
            description={option.description}
            isEnabled={option.value}
            handleToggle={() => props.onOptionChange(option.id, !option.value)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default SettingsGeneral
