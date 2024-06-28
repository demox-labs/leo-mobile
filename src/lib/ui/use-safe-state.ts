import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export default function useSafeState<T>(
  initialState: T | (() => T),
  dep?: any,
): [T, Dispatch<SetStateAction<T>>] {
  const isMounted = useIsMounted()
  const [state, setStatePure] = useState(initialState)

  const setState = useCallback<Dispatch<SetStateAction<T>>>(
    val => {
      if (isMounted()) {
        setStatePure(val)
      }
    },
    [isMounted, setStatePure],
  )

  const depRef = useRef(dep)
  useEffect(() => {
    if (depRef.current !== dep) {
      setState(initialState)
    }
    depRef.current = dep
  }, [dep, setState, initialState])

  return [state, setState]
}

function useIsMounted() {
  const mountedRef = useRef(false)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return useCallback(() => mountedRef.current, [])
}
