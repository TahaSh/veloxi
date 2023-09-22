export interface DataEvent {
  pluginId: string
  pluginName: string
  viewName: string
  dataName: string
  dataValue: string
}

export class DataChangedEvent implements DataEvent {
  pluginId: string
  pluginName: string
  viewName: string
  dataName: string
  dataValue: string
  constructor(public event: DataEvent) {
    this.pluginId = event.pluginId
    this.pluginName = event.pluginName
    this.viewName = event.viewName
    this.dataName = event.dataName
    this.dataValue = event.dataValue
  }
}
