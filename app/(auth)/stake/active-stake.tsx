import React from 'react'

import { tokenInfo } from '@src/api/mockedData'
import ActiveStakeScreen from '@src/screens/stake/active-stake'

const ActiveStakeRoute = () => {
  return <ActiveStakeScreen tokenInfo={tokenInfo} />
}

export default ActiveStakeRoute
