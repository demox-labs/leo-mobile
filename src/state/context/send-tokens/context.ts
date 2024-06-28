import { Dispatch, SetStateAction, createContext } from 'react'
import { SendConfig } from '@src/types/send'
import { Token } from '@src/types/tokens'

export interface SendContextProps {
  token: Token
  setToken: Dispatch<SetStateAction<Token>>
  recipientAddress?: string
  setRecipientAddress: Dispatch<SetStateAction<string | undefined>>
  amount?: bigint
  setAmount: Dispatch<SetStateAction<bigint>>
  sendType: SendConfig
  setSendType: Dispatch<SetStateAction<SendConfig>>
  receivedType: SendConfig
  setReceivedType: Dispatch<SetStateAction<SendConfig>>
  fee?: bigint
  setFee: Dispatch<SetStateAction<bigint | undefined>>
  feeType?: SendConfig
  setFeeType: Dispatch<SetStateAction<SendConfig | undefined>>
  isPublicFeeOptionDisabled: boolean
  setIsPublicFeeOptionDisabled: Dispatch<SetStateAction<boolean>>
  isPrivateFeeOptionDisabled: boolean
  setIsPrivateFeeOptionDisabled: Dispatch<SetStateAction<boolean>>
  delegateTransaction: boolean
  setDelegateTransaction: Dispatch<SetStateAction<boolean>>
  privateBalance: bigint
  publicBalance: bigint
  recommendedFee?: string
}

const SendStateContext = createContext<SendContextProps | null>(null)

export default SendStateContext
