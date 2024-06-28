import { useSafeAreaInsets } from 'react-native-safe-area-context'

const useBottomMargin = () => {
  const insets = useSafeAreaInsets()
  return insets.bottom === 0 ? 'mb-5' : ''
}

export default useBottomMargin
