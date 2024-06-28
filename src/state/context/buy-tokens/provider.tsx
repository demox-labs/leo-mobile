import React, { useState } from 'react'
import SendStateContext from './context'
import { Token } from '@src/types/tokens'
import { mockedTokensBuyFlow } from '@src/api/mockedData'

interface BuyStateProviderProps {
  children: React.ReactNode
}

const BuyStateProvider: React.FC<BuyStateProviderProps> = ({ children }) => {
  const [token, setToken] = useState<Token | undefined>(
    mockedTokensBuyFlow.find(token => token.symbol === 'ALEO'),
  )
  const [amount, setAmount] = useState<number>()
  const [paymentMethodId, setPaymentMethodId] = useState<string>()

  // Memoize the context values to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      token,
      setToken,
      amount,
      setAmount,
      paymentMethodId,
      setPaymentMethodId,
    }),
    [token, setToken, amount, setAmount, paymentMethodId, setPaymentMethodId],
  )

  return (
    <SendStateContext.Provider value={contextValue}>
      {children}
    </SendStateContext.Provider>
  )
}

export default BuyStateProvider
