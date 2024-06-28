import { Dimensions } from 'react-native'

const SMALL_SCREEN_HEIGHT_THRESHOLD = 667

const useIsSmallScreen = () => {
  return Dimensions.get('window').height <= SMALL_SCREEN_HEIGHT_THRESHOLD
}

export default useIsSmallScreen
