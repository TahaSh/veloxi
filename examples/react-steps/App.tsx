import { useState } from 'react'
import { createApp } from '../../src'
import { StepsEvent, StepsPlugin } from './StepsPlugin'
import { DraggablePlugin } from './DraggablePlugin'

const app = createApp()
app.addPlugin(StepsPlugin)
app.addPlugin(DraggablePlugin)
app.run()


const steps = [
  {
    title: 'Title One',
    body: 'TITLE ONE Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    img: 'https://source.unsplash.com/featured/200x200?1'
  },
  {
    title: 'Title Two',
    body: 'TITLE TWO Lorem ipsum dolor sit amet, consectetur adipisicing elit',
    img: 'https://source.unsplash.com/featured/200x400?2'
  },
  {
    title: 'Title Three',
    body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    img: 'https://source.unsplash.com/featured/200x800?3'
  },
]

app.onPluginEvent(StepsPlugin, StepsEvent, ({ testValue }) => {
  console.log('testValue value is', testValue);
})

function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]

  return (
    <>
      <button className="bg-white rounded-lg px-5 py-2" onClick={() => {
        app.reset('StepsPlugin')
      }}>
        Reset
      </button>
      <div className="w-[100px] h-[100px] bg-red-700 rounded-full"
        data-vel-plugin="DraggablePlugin"
        data-vel-view="item"
      ></div>
      <div className="pt-10 w-full flex items-center justify-center">
        <div
          className="rounded-xl bg-gray-50 w-full max-w-xl overflow-hidden flex flex-col"
          data-vel-plugin="StepsPlugin"
          data-vel-view="container"
        >
          <div className="p-5 border-b border-gray-200 h-[69px] bg-gray-50"
            data-vel-view="section"
          >
            <h1 className="text-xl font-medium text-gray-800"
            >{step.title}</h1>
          </div>
          <div
            className=" text-gray-800 flex-1 origin-top-left"
            data-vel-view="body-section"
            key={`${stepIndex}-body`}
            data-vel-layout-id="body"
          >
            <div className="origin-top-left p-5">
              {step.body}
            </div>
          </div>
          <div className="h-[80px] border-t border-gray-200 p-5 flex justify-between bg-gray-50"
            data-vel-view="section"
          >
            <button className="bg-gray-800 text-white font-medium px-5 py-2 rounded-md" onClick={() => {
              setStepIndex(Math.max((stepIndex - 1), 0))
            }}>Back</button>
            <button className="bg-indigo-800 text-white font-medium px-5 py-2 rounded-md" onClick={() => {
              setStepIndex(Math.min((stepIndex + 1), steps.length - 1))
            }}>Next</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
