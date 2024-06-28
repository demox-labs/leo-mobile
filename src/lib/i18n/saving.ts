import { getData, setData } from '@src/utils/storage'

export const STORAGE_KEY = 'locale'

export async function getSavedLocale() {
  return await getData(STORAGE_KEY)
}

export async function saveLocale(locale: string) {
  try {
    await setData(STORAGE_KEY, locale)
  } catch (e) {
    console.warn('Failed to save locale', e)
  }
}
