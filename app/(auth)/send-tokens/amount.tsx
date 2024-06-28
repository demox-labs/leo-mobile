import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useFocusEffect, useNavigation, useRouter } from 'expo-router'
import useSendStateContext from '@src/hooks/context/useSendStateContext'
import useAmount from '@src/hooks/useAmount'
import { formatBigInt } from '@src/utils/money'
import { StatusBar } from 'react-native'
import useTokenPrice from '@src/hooks/useTokenPrice'
import { OwnedRecordsTable } from '@src/lib/aleo/db/repo'
import { IOwnedRecord } from '@src/lib/aleo/db/types'
import AmountScreen from '@src/screens/send-tokens/amount'

const AmountRoute = () => {
  const router = useRouter()
  const navigation = useNavigation()

  const {
    token,
    amount,
    setAmount,
    sendType,
    setSendType,
    receivedType,
    setReceivedType,
    fee,
    feeType,
    setFeeType,
    privateBalance,
    publicBalance,
    setIsPrivateFeeOptionDisabled,
    setIsPublicFeeOptionDisabled,
  } = useSendStateContext()

  const tokenPrice = useTokenPrice(token!.symbol)

  const availableBalance =
    sendType === 'public' ? publicBalance : privateBalance

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentAmountString, _, updateTokenAmountString] = useAmount({
    availableBalance,
    onAmountChange: setAmount,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [usdAmountString, __, updateUSDAmountString] = useAmount({
    initialValue: undefined,
  })

  const [records, setRecords] = useState<IOwnedRecord[]>([])

  const getRecords = OwnedRecordsTable.getByChainId

  useEffect(() => {
    const records = async () => {
      const records = await getRecords('test')
      const realRecords = await getRecords('testnet3')
      setRecords(records.concat(realRecords))
    }
    records()
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content')
    }, []),
  )

  const hasPrivateBalanceButNoEnoughRecords =
    privateBalance > 0 && records.length < 2

  const onNoTokensReadMore = useCallback(
    () =>
      // router.push({
      //   pathname: '/send-tokens/no-tokens-read-more',
      // }),
      // TODO: Implement this route
      console.log('Read more'),
    [],
  )

  const openPrivacyConfigModal = useCallback(
    () =>
      router.push({
        pathname: '/send-tokens/advanced-send',
      }),
    [],
  )

  const onCustomizeFeePress = useCallback(
    () =>
      router.push({
        pathname: '/send-tokens/customize-fee',
      }),
    [],
  )

  const onContinuePress = useCallback(
    () =>
      // If send type is private and there are no at least 2 records, redirect to the "send-tokens/send-unavailable" route
      sendType === 'private' && hasPrivateBalanceButNoEnoughRecords
        ? router.push({
            pathname: '/send-tokens/send-unavailable',
          })
        : router.push({
            pathname: '/send-tokens/review',
          }),
    [],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Send ${token!.symbol}`,
    })
  }, [])

  const privateRecordsAmount = records.length

  useEffect(() => {
    if (publicBalance > BigInt(0)) {
      if (privateRecordsAmount === 1) {
        if (publicBalance >= privateBalance) {
          setSendType('public')
          setFeeType('public')
          setIsPrivateFeeOptionDisabled(true)
        } else {
          setSendType('private')
          setFeeType('public')
          setIsPublicFeeOptionDisabled(true)
        }
      } else if (privateRecordsAmount >= 2) {
        if (publicBalance >= privateBalance) {
          setSendType('public')
          setFeeType('public')
          // All transaction types and fee combinations allowed
        } else {
          setSendType('public')
          setFeeType('public')
          // All transaction types and fee combinations allowed
        }
      }
    } else if (privateBalance === BigInt(0)) {
      if (privateRecordsAmount <= 1) {
        router.replace('/send-tokens/send-unavailable')
      } else if (privateRecordsAmount >= 2) {
        setSendType('private')
        setFeeType('private')
        setFeeType('private')
      }
    }
  }, [])

  return (
    <AmountScreen
      tokenAmount={currentAmountString}
      usdAmount={usdAmountString}
      fee={formatBigInt(fee!)}
      feeType={feeType!}
      availableBalance={availableBalance}
      currentAmountString={currentAmountString}
      privateBalance={privateBalance}
      privateRecordsAmount={privateRecordsAmount}
      publicBalance={publicBalance}
      tokenSymbol={token.symbol}
      tokenPrice={tokenPrice}
      sendType={sendType}
      setSendType={setSendType}
      receivedType={receivedType}
      setReceivedType={setReceivedType}
      isContinueDisabled={!amount}
      updateTokenAmount={updateTokenAmountString}
      updateUSDAmount={updateUSDAmountString}
      onNoTokensReadMore={onNoTokensReadMore}
      openPrivacyConfigModal={openPrivacyConfigModal}
      onCustomizeFeePress={onCustomizeFeePress}
      onContinuePress={onContinuePress}
      onCancelPress={router.back}
    />
  )
}

export default AmountRoute
