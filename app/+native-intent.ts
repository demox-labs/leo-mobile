import { sanitizeDeepLink } from '@src/utils/strings'

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string
  initial: boolean
}) {
  if (initial) {
    return path
  }

  return sanitizeDeepLink(path)
}
