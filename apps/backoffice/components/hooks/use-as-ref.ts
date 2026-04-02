import * as React from 'react'

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props)

  React.useEffect(() => {
    ref.current = props
  })

  return ref
}

export { useAsRef }
