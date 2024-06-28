import { enUS, enGB, fr, zhCN, zhTW, ja, ko, uk, ru } from 'date-fns/locale'
import { Locale } from 'date-fns/locale/types'
import { getSavedLocale } from './saving'
import * as Localization from 'expo-localization'

const dateFnsLocales: Record<string, Locale> = {
  en: enUS,
  en_GB: enGB,
  fr,
  zh_CN: zhCN,
  zh_TW: zhTW,
  ja,
  ko,
  uk,
  ru,
}

export async function getDateFnsLocale() {
  const currentLocale = await getCurrentLocale()
  return dateFnsLocales[currentLocale] || enUS
}

export function getCurrentLocale() {
  return getSavedLocale() || getNativeLocale()
}

export function getNativeLocale() {
  return Localization.locale
}
