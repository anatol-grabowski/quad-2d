import React, { useRef, useEffect, useLayoutEffect } from 'react'
import './App.css'
import { sim } from './quad'

function App() {
  const ref = useRef()
  useLayoutEffect(() => {
    sim.init(ref.current!)
  }, [])
  useEffect(() => {
    return () => sim.deinit()
  }, [])

  return (
    <canvas
      width="600"
      height="600"
      style={{ border: '1px dashed black' }}
      tabIndex={0}
      ref={ref}
    ></canvas>
  )
}

export default App
