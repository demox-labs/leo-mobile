import React, { useState } from 'react'
import SendStateContext from './context'
import { SendConfig } from '@src/types/send'
import { mockedTokens } from '@src/api/mockedData'
import { Token } from '@src/types/tokens'
import { DEFAULT_FEES } from '@src/lib/aleo/assets/default-fees'
import { useBalance } from '@src/lib/aleo/assets/balance'
import { useAccount, useChainId } from '@src/lib/aleo/ready'
import { CREDITS_PROGRAM_ID } from '@src/lib/aleo/programs/credits-program'
import useSettingsStore from '@src/state/zustand/settings'
import { formatBigInt } from '@src/utils/money'

interface SendStateProviderProps {
  children: React.ReactNode
}

const SendStateProvider: React.FC<SendStateProviderProps> = ({ children }) => {
  const account = useAccount()
  const chainId = useChainId()
  const { isDelegateTransactionsByDefaultEnabled } = useSettingsStore()
  const { data: fetchPublicBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    true,
    false,
    true,
  )
  const { data: fetchedPrivateBalance } = useBalance(
    account,
    chainId,
    'aleo',
    { displayed: true, suspense: false, initial: BigInt(0) },
    false,
    true,
    true,
  )

  const defaultFee = DEFAULT_FEES[CREDITS_PROGRAM_ID].transfer_public
  const recommendedFee = formatBigInt(defaultFee)

  const [token, setToken] = useState<Token>(mockedTokens[0])
  const [recipientAddress, setRecipientAddress] = useState<string>()
  const [amount, setAmount] = useState<bigint>(BigInt(0))
  const [sendType, setSendType] = useState<SendConfig>('public')
  const [receivedType, setReceivedType] = useState<SendConfig>('public')
  const [fee, setFee] = useState<bigint | undefined>(defaultFee)
  const [feeType, setFeeType] = useState<SendConfig | undefined>('public')
  const [isPublicFeeOptionDisabled, setIsPublicFeeOptionDisabled] =
    useState<boolean>(false)
  const [isPrivateFeeOptionDisabled, setIsPrivateFeeOptionDisabled] =
    useState<boolean>(false)
  const [delegateTransaction, setDelegateTransaction] = useState<boolean>(
    isDelegateTransactionsByDefaultEnabled,
  )

  const publicBalance = fetchPublicBalance ? fetchPublicBalance : BigInt(0)
  const privateBalance = fetchedPrivateBalance
    ? fetchedPrivateBalance
    : BigInt(0)

  // Memoize the context values to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      token,
      setToken,
      recipientAddress,
      setRecipientAddress,
      amount,
      setAmount,
      sendType,
      setSendType,
      receivedType,
      setReceivedType,
      fee,
      setFee,
      feeType,
      setFeeType,
      isPublicFeeOptionDisabled,
      setIsPublicFeeOptionDisabled,
      isPrivateFeeOptionDisabled,
      setIsPrivateFeeOptionDisabled,
      delegateTransaction,
      setDelegateTransaction,
      publicBalance,
      privateBalance,
      recommendedFee,
    }),
    [
      token,
      recipientAddress,
      setRecipientAddress,
      amount,
      setAmount,
      sendType,
      setSendType,
      receivedType,
      setReceivedType,
      fee,
      setFee,
      feeType,
      setFeeType,
      isPublicFeeOptionDisabled,
      setIsPublicFeeOptionDisabled,
      isPrivateFeeOptionDisabled,
      setIsPrivateFeeOptionDisabled,
      delegateTransaction,
      setDelegateTransaction,
      publicBalance,
      privateBalance,
      recommendedFee,
    ],
  )

  return (
    <SendStateContext.Provider value={contextValue}>
      {children}
    </SendStateContext.Provider>
  )
}

export default SendStateProvider
