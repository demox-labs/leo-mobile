// Usage: useConditionalBackNavigation(['/path1', '/path2'])
// Description: This hook will suppress the back button on the specified pathnames.

import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import { usePathname } from 'expo-router'

export const useConditionalBackNavigation = (targetPathnames: string[]) => {
  const currentPathname = usePathname()

  useEffect(() => {
    const shouldSuppressBackButton = targetPathnames.includes(currentPathname)

    const backAction = () => {
      return shouldSuppressBackButton
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    )

    return () => backHandler.remove()
  }, [currentPathname])
}

export default useConditionalBackNavigation
