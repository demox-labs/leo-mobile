import { useAleoClient } from '@src/lib/aleo/client'

const useConversionRate = (tokenSymbol: string): number | undefined => {
  const { prices } = useAleoClient()

  return prices ? prices[tokenSymbol as keyof typeof prices] : undefined
}

export default useConversionRate
