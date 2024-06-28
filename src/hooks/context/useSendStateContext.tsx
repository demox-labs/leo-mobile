import { useContext } from 'react'
import SendStateContext, {
  SendContextProps,
} from '@src/state/context/send-tokens/context'

const useSendStateContext = (): SendContextProps => {
  const context = useContext(SendStateContext)

  if (context === null) {
    throw new Error(
      'useSendStateContext must be used within a SendStateProvider',
    )
  }

  return context
}

export default useSendStateContext
