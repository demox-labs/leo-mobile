import React, { useEffect, useMemo } from 'react'
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native'
import Icon from './icons'

export enum PasswordStrength {
  Low = 'Low',
  Weak = 'Weak',
  Medium = 'Medium',
  Strong = 'Strong',
  None = '',
}

export type PasswordStrengthType = {
  strength: PasswordStrength
  color: string
  textIndicator: string
}

// A utility function to determine password strength.
// This is a simplified version, we might want to replace it with a more robust implementation.
const getPasswordStrength = (password: string) => {
  // Define levels of password strength
  let strength: PasswordStrengthType['strength']
  let color: PasswordStrengthType['color']
  let textIndicator: PasswordStrengthType['textIndicator']

  if (!password) {
    strength = PasswordStrength.None
    color = 'bg-gray-100' // Default gray color for no password
    textIndicator = 'At least 8 characters, with at least 1 number'
  } else if (password.length < 8 || !/\d/.test(password)) {
    strength = PasswordStrength.Low
    color = 'bg-gray-100' // Gray color for very weak password
    textIndicator = '8 characters, 1 number'
  } else if (
    password.length < 10 ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    strength = PasswordStrength.Weak
    color = 'bg-red-500' // Red color for weak password
    textIndicator = 'Low'
  } else if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    strength = PasswordStrength.Medium
    color = 'bg-yellow-500' // Yellow color for medium password
    textIndicator = 'Medium'
  } else {
    strength = PasswordStrength.Strong
    color = 'bg-green-500' // Green color for strong password
    textIndicator = 'Very strong!'
  }

  return { strength, color, textIndicator }
}

export type LeoPasswordInputProps = TextInputProps & {
  onStrengthChange: (strength: PasswordStrength) => void
  customStyles?: {
    wrapper?: string
    input?: string
  }
  type?: 'create' | 'verify'
  match?: boolean
  isSecureEntry: boolean
  setIsSecureEntry: (isSecureEntry: boolean) => void
}

const LeoPasswordInput: React.FC<LeoPasswordInputProps> = props => {
  const {
    value = '',
    onChangeText,
    onStrengthChange,
    customStyles,
    type = 'create',
    match,
    isSecureEntry,
    setIsSecureEntry,
  } = props

  const { strength, color, textIndicator } = useMemo(
    () => getPasswordStrength(value),
    [value],
  )
  const [isFocused, setIsFocused] = React.useState(false)

  // Text input styles
  const defaultClass =
    'mb-2 p-3 border border-gray-200 rounded-[8px] text-base pr-12 h-[48px]'
  const activeClass = isFocused ? 'border-primary-500' : ''
  const customClass = customStyles?.input ?? ''
  const textInputClassName = `${defaultClass} ${activeClass} ${customClass}`

  const label = type === 'create' ? 'Password' : 'Verify password'
  const placeholder =
    type === 'create' ? 'Enter password' : 'Enter password again'

  // Calculate how many segments to activate based on strength
  const activeSegments = {
    [PasswordStrength.None]: 0,
    [PasswordStrength.Low]: 0,
    [PasswordStrength.Weak]: 1,
    [PasswordStrength.Medium]: 2,
    [PasswordStrength.Strong]: 3,
  }[strength]

  const renderPasswordValidation = () => {
    // DO NOT MEMOIZE THIS FUNCTION, as it's a render function.
    // Memory usage increases ~14MB when memoized.
    // Non-memoized render time: ~0.0005 ms
    // Memoized render time: ~0.01 ms
    // Memoized render time is 20 times slower than non-memoized.
    // Reasons of the above:
    // 1 - The computation is not expensive enough to outweigh the overhead of memoization.
    // 2 - The dependencies of useMemo change on every render, so it's not memoized.
    // 3 - Rendering JSX or performing simple calculations are typically fast operations
    // that do not benefit from memoization.

    if (type === 'create') {
      return (
        <View className="flex flex-row justify-between items-center">
          {strength !== PasswordStrength.None && (
            <View className="flex flex-row max-w-[126px]">
              {[...Array(3)].map((_, i) => (
                <View
                  key={i}
                  className={`h-1 flex-1 rounded mr-1 min-w-[40px] ${
                    i < activeSegments ? color : 'bg-gray-100'
                  }`}
                />
              ))}
            </View>
          )}
          <Text className="text-xs text-[#484848]">{textIndicator}</Text>
        </View>
      )
    } else if (match) {
      return (
        <Text className="text-xs text-green-500 mb-5">{"It's a match!"}</Text>
      )
    } else if (value.length > 0) {
      return (
        <Text className="text-xs mb-5 text-red-500">
          Passwords do not match
        </Text>
      )
    }
    return null
  }

  useEffect(() => {
    onStrengthChange(strength)
  }, [strength])

  return (
    <View className={`flex flex-col ${customStyles?.wrapper ?? ''}`}>
      <Text className="mb-2 text-sm font-semibold">{label}</Text>
      <View className="relative mb-1">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className={textInputClassName}
          style={{
            lineHeight: 20,
            textAlignVertical: 'center',
          }}
          placeholder={placeholder}
          secureTextEntry={isSecureEntry}
          placeholderTextColor="#9E9E9E"
          textAlignVertical="center"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <TouchableOpacity
          className="absolute inset-y-0 right-0 pr-3 flex justify-center items-center mb-2"
          onPress={() => setIsSecureEntry(!isSecureEntry)}
        >
          <Icon name={isSecureEntry ? 'eye-off' : 'eye'} size={24} />
        </TouchableOpacity>
      </View>
      {renderPasswordValidation()}
    </View>
  )
}

export default LeoPasswordInput
