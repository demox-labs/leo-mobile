import { isEqual } from 'lodash'
import { getData } from './storage'

export const areAllPropsEqual = (prevProps: any, nextProps: any) =>
  isEqual(prevProps, nextProps)

export const isDAppInteractionsAllowed = async () => {
  const isAllowed = await getData('allowDAppsInteraction')
  if (isAllowed === null) {
    return true
  }
  return !!isAllowed
}
