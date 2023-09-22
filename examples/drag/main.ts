import './style.css'

import { App, Plugin, View } from '../../src'
import { DragEvent, DragEventPlugin } from '../../src'

class DragPlugin extends Plugin {
  static scope = 'draggable'

  private _dragEventPlugin = this.usePlugin(DragEventPlugin)

  draggable!: View

  setup() {
    this.draggable = this.getView('draggable')!

    this.draggable.position.setAnimator(this.isAnchored ? 'spring' : 'dynamic')

    this._dragEventPlugin.addView(this.draggable)

    this._dragEventPlugin.on(DragEvent, this.onDrag.bind(this))
  }

  onDrag(dragState: DragEvent) {
    if (dragState.isDragging) {
      this.draggable.position.set({
        x: dragState.x,
        y: dragState.y
      })
    } else if (this.isAnchored) {
      this.draggable.position.reset()
    }
  }

  get isAnchored() {
    return this.draggable.data.anchored === 'true'
  }
}

const app = App.create()
app.addPlugin(DragPlugin)

app.run()
