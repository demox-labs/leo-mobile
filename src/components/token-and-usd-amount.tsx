import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  ViewProps,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from './icons'
import LeoButton from './leo-button'

interface PresetOptionsProps {
  onPresetOptionPress: (newAmount: string) => void
}
const PresetOptions: React.FC<PresetOptionsProps> = ({
  onPresetOptionPress,
}) => {
  return (
    <View className="flex-row justify-center">
      <LeoButton
        className="flex-1 mr-1 max-w-[71px]"
        type="secondary"
        label="$100"
        onPress={() => onPresetOptionPress('100')}
      />
      <LeoButton
        className="flex-1 mx-1 max-w-[71px]"
        type="secondary"
        label="$500"
        onPress={() => onPresetOptionPress('500')}
      />
      <LeoButton
        className="flex-1 ml-1 max-w-[71px]"
        type="secondary"
        label="$1000"
        onPress={() => onPresetOptionPress('1000')}
      />
    </View>
  )
}

interface TokenAndUsdAmountProps extends ViewProps {
  tokenSymbol: string
  tokenPrice?: number
  renderPresetOptions?: boolean
  usdAmount?: string
  setUSDAmount: (newAmount: string) => void
  tokenAmount?: string
  setTokenAmount: (newAmount: string) => void
}

const TokenAndUsdAmount: React.FC<TokenAndUsdAmountProps> = ({
  tokenSymbol,
  tokenPrice,
  renderPresetOptions = false,
  usdAmount,
  setUSDAmount,
  tokenAmount,
  setTokenAmount,
  ...props
}) => {
  const textInputRef = React.useRef<TextInput>(null)

  const [isInputInUSD, setIsInputInUSD] = useState(false)

  const displayAmount = isInputInUSD ? usdAmount : tokenAmount

  const textFontSize = (() => {
    if (displayAmount === undefined || displayAmount === '') return 'text-5xl'
    if (displayAmount.length <= 5) return 'text-5xl'
    if (displayAmount.length <= 12) return 'text-4xl'
    if (displayAmount.length <= 16) return 'text-3xl'
    return 'text-5xl'
  })()

  const handleAmountChange = (newAmount: string) => {
    if (isInputInUSD) {
      setUSDAmount(newAmount)
      const convertedAmount = tokenPrice ? Number(newAmount) / tokenPrice : 0
      setTokenAmount(convertedAmount.toString())
    } else {
      setTokenAmount(newAmount)
      const convertedAmount = tokenPrice ? Number(newAmount) * tokenPrice : 0
      setUSDAmount(convertedAmount.toString())
    }
  }

  const handleOnPresetOptionPress = (newUSDAmount: string) => {
    setUSDAmount(newUSDAmount)
    const convertedAmount = tokenPrice ? Number(newUSDAmount) / tokenPrice : 0
    setTokenAmount(convertedAmount.toString())
  }

  const onChangeToUSDBtnPress = () => {
    setIsInputInUSD(!isInputInUSD)
    textInputRef.current?.focus()
  }

  const changeToUSDButtonProps = {
    children: (
      <View className="flex-row gap-1">
        <Text>
          {isInputInUSD
            ? `${tokenAmount || '0.00'} ${tokenSymbol}`
            : usdAmount || '0.00'}
        </Text>
        <Icon name="arrow-up-down" size={16} />
      </View>
    ),
    type: 'link',
    onPress: onChangeToUSDBtnPress,
  }

  useEffect(() => {
    textInputRef.current?.focus()
  }, [])

  return (
    <View {...props}>
      <Pressable
        className="flex-row justify-center items-center mb-1 mt-auto"
        onPress={() => textInputRef.current?.focus()}
      >
        {isInputInUSD ? (
          <Text className={`${textFontSize} pr-1`}>$</Text>
        ) : null}
        <View
          className={`flex-row ${displayAmount === undefined || displayAmount === '' || textFontSize !== 'text-5xl' ? 'items-center' : ''}`}
        >
          <TextInput
            ref={textInputRef}
            className={`${textFontSize} h-[60px]`}
            keyboardType="numeric"
            value={displayAmount}
            onChangeText={handleAmountChange}
            placeholder="0"
            maxLength={16}
          />
          {!isInputInUSD ? (
            <Text className={`ml-4 ${textFontSize}`}>{tokenSymbol}</Text>
          ) : null}
        </View>
      </Pressable>
      <TouchableOpacity
        {...changeToUSDButtonProps}
        className="w-full items-center justify-center mb-[24px]"
      />
      {renderPresetOptions && (
        <PresetOptions onPresetOptionPress={handleOnPresetOptionPress} />
      )}
    </View>
  )
}

export default TokenAndUsdAmount
