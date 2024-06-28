import { useHeaderHeight } from '@react-navigation/elements'
import useIsSmallScreen from './useIsSmallScreen'

interface UseVerticalOffsetProps {
  multiplier?: number
  smallScreenMultiplier?: number
}

const useVerticalOffset = ({
  multiplier = 1,
  smallScreenMultiplier = 0.5,
}: UseVerticalOffsetProps = {}) => {
  const headerHeight = useHeaderHeight()
  const isSmallScreen = useIsSmallScreen()

  const actualMultiplier = isSmallScreen ? smallScreenMultiplier : multiplier
  const verticalOffset = headerHeight * actualMultiplier

  return verticalOffset
}

export default useVerticalOffset
