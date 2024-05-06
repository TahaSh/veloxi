import './style.css'

import {
  DragEvent,
  DragEventPlugin,
  PluginFactory,
  Utils,
  View,
  createApp
} from '../../src'

const DocumentDargPlugin: PluginFactory = (context) => {
  const dragPlugin = context.useEventPlugin(DragEventPlugin)

  let documents: View[]
  let actionsContainer: View
  let archiveAction: View
  let deleteAction: View
  let archivedText: View
  let deletedText: View

  let draggingDocument: View | null = null
  let draggingDocumentContainer: View | null = null
  let overlapping: 'archive' | 'delete' | null = null

  let actionDoneTimer: number

  context.setup(() => {
    documents = context.getViews('document')
    actionsContainer = context.getView('actions-container')!
    archiveAction = context.getView('archive-action')!
    deleteAction = context.getView('delete-action')!
    archivedText = context.getView('drop-action-text-archived')!
    deletedText = context.getView('drop-action-text-deleted')!

    setupActionsContainer()
    setupDocuments()

    dragPlugin.on(DragEvent, (event) => {
      if (event.view.name === 'document') {
        onDocumentDrag(event)
      }
    })
  })

  context.onViewAdded((view) => {
    if (view.name === 'document-container') {
      view.position.setAnimator('spring', { stiffness: 0.3 })
      view.opacity.setAnimator('tween')
      view.layoutTransition(true)
      view.onRemove((v, done) => {
        v.styles.zIndex = '-1'
        v.opacity.set(0)
        v.opacity.animator.onComplete(done)
      })
    } else if (
      ['drop-action-text-archived', 'drop-action-text-deleted'].includes(
        view.name
      )
    ) {
      view.opacity.setAnimator('tween')
      view.opacity.set(0)
    }
  })

  function setupActionsContainer() {
    actionsContainer.position.setAnimator('spring')

    archiveAction.size.setAnimator('spring', { speed: 12, damping: 0.68 })
    archiveAction.position.set({
      x: actionsContainer.position.initialX + 70 + 15
    })

    deleteAction.size.setAnimator('spring', { speed: 12, damping: 0.68 })
    deleteAction.position.set({ x: actionsContainer.position.initialX })

    hideActions(false)
  }

  function setupDocuments() {
    documents.forEach((document) => {
      dragPlugin.addView(document)
      document.opacity.setAnimator('tween')
      document.position.setAnimator('dynamic')
      document.scale.setAnimator('dynamic')
      document.rotation.setAnimator('dynamic')
      document.onRemove((view, done) => {
        view.position.setAnimator('dynamic', { speed: 8 })
        view.scale.setAnimator('dynamic', { speed: 8 })
        view.opacity.set(0)
        view.position.set({
          x: view.position.x + view.size.widthAfterScale / 2,
          y: view.position.y + view.size.heightAfterScale / 2
        })
        view.scale.set({ x: 0, y: 0 })
        view.opacity.animator.onComplete(() => {
          done()
        })
      })
    })
  }

  function onDocumentDrag(event: DragEvent) {
    draggingDocument = event.view
    setDraggingDocumentContainer()
    if (event.isDragging) {
      if (actionDoneTimer) {
        archiveAction.size.reset(true)
        deleteAction.size.reset(true)
        archivedText.opacity.set(0, false)
        deletedText.opacity.set(0, false)
        clearTimeout(actionDoneTimer)
      }

      draggingDocument.styles.cursor = 'grabbing'
      if (draggingDocumentContainer) {
        draggingDocumentContainer.styles.zIndex = '3'
      }
      draggingDocument.position.set({ x: event.x, y: event.y }, false)
      showActions()
      updateDocumentBasedOnPosition()
      handleDraggingOverActions()
    } else {
      const documentContainer = draggingDocument.element.closest('.document')
      if (overlapping) {
        if (overlapping === 'archive') {
          archivedText.opacity.set(1)
          archiveAction.size.set({ width: 160 })
        } else if (overlapping === 'delete') {
          deletedText.opacity.set(1)
          deleteAction.size.set({ width: 160 })
        }
        documentContainer?.remove()
        actionDoneTimer = setTimeout(() => {
          hideActions()
          setTimeout(() => {
            archiveAction.size.reset(false)
            deleteAction.size.reset(false)
          }, 300)
        }, 2000)
      } else {
        resetDraggingDocument()
        hideActions()
      }
      if (draggingDocumentContainer) {
        draggingDocumentContainer.styles.zIndex = ''
      }
      draggingDocument = null
      draggingDocumentContainer = null
    }
  }

  function setDraggingDocumentContainer() {
    if (!draggingDocument) return
    const containerId =
      draggingDocument.element.parentElement?.dataset.velViewId
    if (!containerId) return
    const container = context.getViewById(containerId)
    if (container) {
      draggingDocumentContainer = container
    }
  }

  function handleDraggingOverActions() {
    if (!draggingDocument) return
    if (
      (!overlapping || overlapping === 'archive') &&
      draggingDocument.overlapsWith(archiveAction)
    ) {
      overlapping = 'archive'
      documentOverlapsWithArchive()
      deleteAction.size.reset()
    } else if (
      (!overlapping || overlapping === 'delete') &&
      draggingDocument.overlapsWith(deleteAction)
    ) {
      overlapping = 'delete'
      documentOverlapsWithDelete()
      archiveAction.size.reset()
    } else {
      overlapping = null
      archiveAction.size.reset()
      deleteAction.size.reset()
    }
  }

  function resetDraggingDocument() {
    if (!draggingDocument) return
    draggingDocument.styles.cursor = ''
    draggingDocument.styles.zIndex = ''
    draggingDocument.position.reset()
    draggingDocument.scale.reset()
    draggingDocument.rotation.reset()
  }

  function updateDocumentBasedOnPosition() {
    if (!draggingDocument) return
    const actionsInitialPosition = {
      x: actionsContainer.position.initialX,
      y: actionsContainer.position.initialY
    }
    const progress = draggingDocument.position.progressTo(
      actionsInitialPosition
    )

    const clampedScale = Utils.clamp(1 - progress, 0.35, 1)
    draggingDocument.scale.set({ x: clampedScale, y: clampedScale }, false)

    const clampedDegrees = Utils.clamp(-20 * progress, -20, 20)
    draggingDocument.rotation.setDegrees(clampedDegrees)
  }

  function documentOverlapsWithArchive() {
    archiveAction.styles.zIndex = '1'
    deleteAction.styles.zIndex = ''
    archiveAction.size.set({ width: 200 })
  }

  function documentOverlapsWithDelete() {
    deleteAction.styles.zIndex = '1'
    archiveAction.styles.zIndex = ''
    deleteAction.size.set({ width: 200 })
  }

  function hideActions(animate = true) {
    actionsContainer.position.set({ y: window.innerHeight }, animate)
  }

  function showActions() {
    actionsContainer.position.reset()
  }
}

DocumentDargPlugin.pluginName = 'DocumentDragPlugin'

const app = createApp()
app.addPlugin(DocumentDargPlugin)
app.run()
