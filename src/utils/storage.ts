/*
  This is a simple wrapper around AsyncStorage to make it easier to use.
  See https://react-native-async-storage.github.io/async-storage/docs/api.
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRetryableSWR } from './swr'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'

export const StorageKeys = {
  HOME_TOOLTIP_SHOWN_KEY: 'HomeTooltipShown',
  HAS_ASKED_FOR_BIOMETRIC_AUTH: 'HasAskedForBiometricAuth',
}

export async function removeAllData() {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    console.error('Error clearing storage', error)
  }
}

export async function removeData(key: string) {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing data', error)
  }
}

export async function removeMultipleData(keys: string[]) {
  try {
    await AsyncStorage.multiRemove(keys)
  } catch (error) {
    console.error('Error removing data', error)
  }
}

export async function setData(key: string, value: any) {
  try {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value)
    await AsyncStorage.setItem(key, stringValue)
  } catch (error) {
    console.error('Error storing data', error)
  }
}

export async function setMultipleData(items: [string, any][]) {
  try {
    const stringItems: [string, string][] = items.map(([key, value]) => {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value)
      return [key, stringValue] as [string, string]
    })
    await AsyncStorage.multiSet(stringItems)
  } catch (error) {
    console.error('Error storing data', error)
  }
}

export async function getData(key: string) {
  try {
    const stringValue = await AsyncStorage.getItem(key)
    if (stringValue !== null) {
      try {
        // Attempt to parse it as JSON
        return JSON.parse(stringValue)
      } catch (e) {
        // If parsing fails, return the raw string
        return stringValue
      }
    }
  } catch (error) {
    console.error('Error retrieving data', error)
  }
  return null
}

export async function hasData(key: string) {
  try {
    const value = await AsyncStorage.getItem(key)
    return value !== null
  } catch (error) {
    console.error('Error checking for data', error)
  }
  return false
}

export async function getMultipleData(keys: string[]) {
  try {
    return await AsyncStorage.multiGet(keys)
  } catch (error) {
    console.error('Error retrieving data', error)
  }
  return null
}

export function usePassiveStorage<T = any>(
  key: string,
  fallback?: T,
): [T, Dispatch<SetStateAction<T>>] {
  const { data } = useRetryableSWR<T>(key, getData, {
    suspense: false, // TODO: should be true once we have suspense
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const finalData = fallback !== undefined ? data ?? fallback : data!

  const [value, setValue] = useState(finalData)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      setData(key, value)
    }
    prevValue.current = value
  }, [key, value])

  return [value, setValue as any]
}
