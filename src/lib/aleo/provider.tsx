import React, { FC, PropsWithChildren } from 'react'

import { AleoClientProvider } from './client'
import { ReadyAleoProvider } from './ready'

/*
  This component is a wrapper for the AleoClientProvider and ReadyAleoProvider.
  These providers allow the rest of the app to easily access crucial 
  parts of the app's state.
*/
export const AleoProvider: FC<PropsWithChildren> = ({ children }) => (
  <AleoClientProvider>
    <ReadyAleoProvider>{children}</ReadyAleoProvider>
  </AleoClientProvider>
)
