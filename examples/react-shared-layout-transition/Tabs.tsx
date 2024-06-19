import { useState } from 'react'

export default function Tabs(props: { tabs: string[]; animation: string }) {
  const [selectedTab, setSelectedTab] = useState(props.tabs[0])
  return (
    <>
      <ul className="tabs" data-vel-plugin="TabsPlugin" data-vel-view="root" data-vel-data-animation={props.animation}>
        {props.tabs.map(tab => (
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