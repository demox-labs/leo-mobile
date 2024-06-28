import { Token } from '@src/types/tokens'
import { Dispatch, SetStateAction, createContext } from 'react'

export interface BuyContextProps {
  token?: Token
  setToken: Dispatch<SetStateAction<Token | undefined>>
  amount?: number
  setAmount: Dispatch<SetStateAction<number | undefined>>
  paymentMethodId?: string
  setPaymentMethodId: Dispatch<SetStateAction<string | undefined>>
}

const BuyStateContext = createContext<BuyContextProps | null>(null)

export default BuyStateContext
