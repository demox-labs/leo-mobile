import { ALEO_METADATA } from '@src/lib/aleo/assets/metadata'

export const renderMoney = (
  amount: number,
  style: string | null | undefined = 'currency',
) => {
  return amount.toLocaleString('en-US', {
    style: style ?? undefined,
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 10,
  })
}

export const renderBalance = (value: number) => {
  return value.toFixed(2)
}

export function removeLeadingZero(input: string): string {
  if (input.length > 1 && input[0] === '0' && input[1] !== '.') {
    return removeLeadingZero(input.slice(1))
  }

  if (input.startsWith('.')) {
    input = '0' + input
  }

  return input
}

export function isValidNumber(
  input: string,
  maxDecimalPlaces: number = ALEO_METADATA.decimals,
): boolean {
  // Handle special valid cases
  if (input === '' || input === '0.' || input === '0' || input === '0.0') {
    return true
  }

  // Check if the string is a valid number
  const num = parseFloat(input)
  if (isNaN(num)) {
    return false
  }

  // Adjust the regular expression to accept a number ending with a decimal point
  // The regex allows for numbers without a decimal point, with a decimal point but no decimal places,
  // with a decimal point followed by up to maxDecimalPlaces decimal places, and a number ending with a decimal point.
  const regex = new RegExp(
    `^[+-]?(\\d+(\\.\\d{0,${maxDecimalPlaces}})?|\\.\\d{1,${maxDecimalPlaces}}|\\d+\\.)$`,
  )
  return regex.test(input)
}

export function convertNumberToBigInt(
  val: number,
  decimals: number = ALEO_METADATA.decimals,
) {
  const number = Math.floor(val * 10 ** decimals)
  return BigInt(number)
}

export function convertStringToBigInt(
  val: string,
  decimals: number = ALEO_METADATA.decimals,
) {
  val = val.trim()
  if (val === '') return BigInt(0)
  if (val === '.') return BigInt(0)
  const number = Math.floor(parseFloat(val) * 10 ** decimals)
  return BigInt(number)
}

export function formatBigInt(
  amount: bigint,
  decimals: number = ALEO_METADATA.decimals,
): string {
  if (amount === BigInt(0)) {
    return '0'
  }
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

export function roundNumberString(
  value: string,
  decimalPlaces: number = 2,
): string {
  const number = parseFloat(value)
  if (isNaN(number)) {
    throw new Error('Invalid number')
  }
  const factor = Math.pow(10, decimalPlaces)
  return (Math.floor(number * factor) / factor).toFixed(decimalPlaces)
}
