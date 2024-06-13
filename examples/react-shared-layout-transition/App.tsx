import { useState } from 'react'
import './App.css'

import { createApp } from '../../src'
import { TabsPlugin } from './TabsPlugin'

const app = createApp()
app.addPlugin(TabsPlugin)
app.run()

const tabs = [
  'Overview',
  'Profile',
  'Settings',
]

function App() {
  const [selectedTab, setSelectedTab] = useState(tabs[0])

  return (
    <>
      <ul className="tabs" data-vel-plugin="TabsPlugin" data-vel-view="root">
        {tabs.map(tab => (
          <li className="tab" key={tab} onClick={() => setSelectedTab(tab)}>
            <div className="tab__inner">
              {selectedTab === tab &&
                (<div className="selector" data-vel-view="selector" data-vel-layout-id="selector"></div>)
              }
              <div className="tab-title">
                {tab}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default App
