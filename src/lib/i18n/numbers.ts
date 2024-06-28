export function formatBigInt(amount: bigint, decimals: number): string {
  const amountString = amount.toString()
  const numZeros = decimals > 0 ? decimals : 1 // ensure there's always at least 1 zero before the decimal point
  const prefixed = '0'.repeat(numZeros) + amountString
  const withDecimal =
    prefixed.slice(0, -decimals) + '.' + prefixed.slice(-decimals)
  const trimmed = withDecimal.replace(/^0+|0+$/g, '')
  const withoutTrailingDecimal = trimmed.replace(/\.$/, '')
  const withLeadingZero = withoutTrailingDecimal.replace(/^\./, '0.')
  return withLeadingZero
}
