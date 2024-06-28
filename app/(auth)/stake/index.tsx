import React from 'react'

import { tokenInfo } from '@src/api/mockedData'
import StakeScreen from '@src/screens/stake/stake'

const StakeRoute = () => {
  return <StakeScreen tokenInfo={tokenInfo} />
}

export default StakeRoute
