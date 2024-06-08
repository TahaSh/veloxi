import { useState } from 'react'
import { createApp } from '../../src'
import { ElementsTransitionPlugin } from './ElementsTransitionPlugin'
import './style.css'

const app = createApp()
app.addPlugin(ElementsTransitionPlugin)
app.run()

function App() {
  const [index, setIndex] = useState(0)

  return (
    <>
      <div id="container-a"
        data-vel-plugin="ElementsTransitionPlugin"
        data-vel-view="container"
        className="container" onClick={() => {
          setIndex((index + 1) % 3)
        }}>
        <div
          data-vel-layout-id="item"
          key={index}
          data-vel-view="item"
        >
          <div
            className={`element element-${index === 0 ? 'a' : index === 1 ? 'b' : 'c'}`}
          >
            {index === 0 ? 'A' : index === 1 ? 'B' : 'C'}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
