import { useContext } from 'react'
import BuyStateContext, {
  BuyContextProps,
} from '@src/state/context/buy-tokens/context'

const useBuyStateContext = (): BuyContextProps => {
  const context = useContext(BuyStateContext)

  if (context === null) {
    throw new Error(
      'useBuyStateContext must be used within a SendStateProvider',
    )
  }

  return context
}

export default useBuyStateContext
