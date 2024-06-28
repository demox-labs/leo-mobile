import React from 'react'
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native'

export type LeoInputProps = TextInputProps & {
  label?: React.ReactNode
  help?: React.ReactNode
  rightLabel?: string
  customStyles?: {
    wrapper?: string
    input?: string
    rightButton?: string
  }
  rightButton?: {
    label: string
    onPress?: () => void
    type?: 'primary' | 'secondary' | 'link'
    disabled?: boolean
  }
  errorMessage?: string
}

const LeoInput = React.forwardRef<TextInput, LeoInputProps>((props, ref) => {
  const {
    label,
    placeholder,
    help,
    value,
    onChangeText,
    customStyles,
    rightButton,
    rightLabel,
    secureTextEntry,
    errorMessage,
    ...rest
  } = props

  let rightButtonBackgroundColor = ''
  let rightButtonTextColor = 'text-black'

  const [isFocused, setIsFocused] = React.useState(false)

  if (rightButton) {
    switch (rightButton.type) {
      case 'primary':
        rightButtonBackgroundColor = rightButton.disabled
          ? 'bg-gray-200'
          : 'bg-primary-500'
        rightButtonTextColor = rightButton.disabled
          ? 'text-gray-400'
          : 'text-white'
        break
      case 'secondary':
        rightButtonBackgroundColor = rightButton.disabled
          ? 'bg-gray-200'
          : 'bg-gray-50'
        break
      case 'link':
        rightButtonBackgroundColor = 'bg-transparent'
        break
    }
  }

  // Text input styles
  const defaultClass =
    'border-gray-200 mb-2 p-3 border rounded-lg text-base leading-[20px] h-[48px]'
  const activeClass = isFocused ? 'border-primary-500' : ''
  const errorClass = errorMessage ? 'border-red-500' : ''
  const customClass = customStyles?.input ?? ''
  const textInputClassName = `${defaultClass} ${activeClass} ${errorClass} ${customClass}`

  return (
    <View className={`flex-col ${customStyles?.wrapper ?? ''}`}>
      {label ? <Text className="mb-2 text-sm">{label}</Text> : null}
      <View className="relative">
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          className={textInputClassName}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#9E9E9E"
          textAlignVertical="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {rightButton ? (
          <TouchableOpacity
            onPress={rightButton.onPress}
            className={`absolute inset-y-[8px] right-[8px] ${
              customStyles?.rightButton ?? ''
            }`}
            disabled={rightButton.disabled}
          >
            <View
              className={`${rightButtonBackgroundColor} w-[60px] h-[32px] justify-center items-center rounded-lg`}
            >
              <Text className={rightButtonTextColor}>{rightButton.label}</Text>
            </View>
          </TouchableOpacity>
        ) : null}
        {rightLabel ? (
          <View className="absolute my-3 right-[8px]">
            <Text className="text-gray-500 text-base">{rightLabel}</Text>
          </View>
        ) : null}
      </View>
      {typeof help !== 'string' ? help : null}
      {typeof help === 'string' ? (
        <Text className="text-xs text-gray-600">{help}</Text>
      ) : null}
      {errorMessage ? (
        <Text className="text-xs text-red-500 mt-2">{errorMessage}</Text>
      ) : null}
    </View>
  )
})

LeoInput.displayName = 'LeoInput'

export default LeoInput
