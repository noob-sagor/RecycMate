import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1 className='font-bold text-3xl text-gray-800'>Helo </h1>
        <button className='btn-error btn'>Error Buttons</button>
        <p className="text-lg text-green-600 badge badge-primary">This is a paragraph styled with Tailwind CSS and DaisyUI!</p>
      </div>
    </>
  )
}

export default App
