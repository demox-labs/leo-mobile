import { useState } from 'react'
import {
  convertStringToBigInt,
  isValidNumber,
  removeLeadingZero,
} from '@src/utils/money'
import { ALEO_METADATA } from '@src/lib/aleo/assets/metadata'

/**
 * Hook to handle and format numeric input for token amounts.
 *
 * This hook manages input for token amounts, converting user input into a properly formatted string
 * and a BigInt representation. It ensures the input adheres to the token's decimal precision and
 * filters out invalid characters.
 *
 * @param {Object} params - Parameters for the hook.
 * @param {string} [params.initialValue=''] - Initial amount as a string.
 * @param {bigint} [params.availableBalance] - Maximum allowable balance, used to cap input amounts.
 * @param {(amount: bigint) => void} [params.onAmountChange] - Callback function to handle amount changes.
 *
 * @returns {[string, bigint, (inputString: string) => void]} A tuple containing the formatted string,
 *          the BigInt representation, and the function to update the amount.
 *
 * @example
 * const [amountString, amountBigInt, updateAmount] = useAmount({
 *   initialValue: '0',
 *   availableBalance: BigInt("1000000000000000000"),
 *   onAmountChange: (newBigIntAmount) => { ... }
 * });
 *
 * // To update amount
 * updateAmount('123.45');
 */

interface UseAmountParams {
  initialValue?: string
  availableBalance?: bigint
  onAmountChange?: (amount: bigint) => void
}
type UseAmountReturn = [string, bigint, (inputString: string) => void]

function useAmount({
  initialValue = '',
  availableBalance,
  onAmountChange = () => {},
}: UseAmountParams): UseAmountReturn {
  const [amountString, setAmountString] = useState(initialValue)
  const [amountBigInt, setAmountBigInt] = useState(
    convertStringToBigInt(initialValue, ALEO_METADATA.decimals),
  )

  const updateAmount = (inputString: string) => {
    let formattedInput = inputString
    // Replace comma with dot for decimal input
    formattedInput = formattedInput.replace(/,/g, '.')

    // Remove any non-numeric characters except for the dot
    formattedInput = formattedInput.replace(/[^0-9.]/g, '')

    // Only allow one dot
    if (formattedInput.split('.').length > 2) {
      formattedInput = formattedInput.replace(/\.+$/, '')
    }

    // Add '0' prefix if input starts with a dot
    if (formattedInput.startsWith('.')) {
      formattedInput = `0${formattedInput}`
    }

    // Limit decimal places to the asset's decimals
    const parts = formattedInput.split('.')
    if (parts.length > 1 && parts[1].length > ALEO_METADATA.decimals) {
      formattedInput = `${parts[0]}.${parts[1].substring(0, ALEO_METADATA.decimals)}`
    }

    // Remove leading zeros while keeping "0." intact
    formattedInput = removeLeadingZero(formattedInput)

    const newAmountBigInt = convertStringToBigInt(
      formattedInput,
      ALEO_METADATA.decimals,
    )

    if (availableBalance === undefined) availableBalance = newAmountBigInt // If no available balance is provided, use the new amount as the available balance to skip the check

    // Only update if valid and does not exceed the max balance
    if (isValidNumber(formattedInput) && newAmountBigInt <= availableBalance) {
      setAmountString(formattedInput)
      setAmountBigInt(newAmountBigInt)
      onAmountChange(newAmountBigInt)
    }
  }

  return [amountString, amountBigInt, updateAmount]
}

export default useAmount
