import './App.css'

import { createApp } from '../../src'
import { TabsPlugin } from './TabsPlugin'
import Tabs from './Tabs'

const app = createApp()
app.addPlugin(TabsPlugin)
app.run()

const tabs = [
  'Overview',
  'Profile',
  'Settings',
]

function App() {
  return (
    <>
      <Tabs tabs={tabs} key={1} animation="tween"></Tabs>
      <Tabs tabs={tabs} key={2} animation="spring"></Tabs>
    </>
  )
}

export default App
