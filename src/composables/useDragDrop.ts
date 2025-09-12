import { ref, reactive } from 'vue'
import type { Position, Size } from '@/types/disenador'

interface DragState {
  isDragging: boolean
  startPosition: Position
  currentPosition: Position
  offset: Position
  element: HTMLElement | null
}

interface ResizeState {
  isResizing: boolean
  startPosition: Position
  startSize: Size
  handle: string | null
  element: HTMLElement | null
}

interface TouchSupport {
  isTouchDevice: boolean
  touchIdentifier?: number
}

export function useDragDrop() {
  const dragState = reactive<DragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    element: null
  })

  const resizeState = reactive<ResizeState>({
    isResizing: false,
    startPosition: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    handle: null,
    element: null
  })

  const touchSupport = reactive<TouchSupport>({
    isTouchDevice: 'ontouchstart' in window
  })

  const snapToGrid = ref(true)
  const gridSize = ref(20)

  // Utility functions
  function getEventPosition(event: MouseEvent | TouchEvent): Position {
    if ('touches' in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      }
    }
    if ('changedTouches' in event && event.changedTouches.length > 0) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      }
    }
    return {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY
    }
  }

  function snapPositionToGrid(position: Position): Position {
    if (!snapToGrid.value) return position

    return {
      x: Math.round(position.x / gridSize.value) * gridSize.value,
      y: Math.round(position.y / gridSize.value) * gridSize.value
    }
  }

  function getElementPosition(element: HTMLElement): Position {
    const rect = element.getBoundingClientRect()
    const container = element.offsetParent as HTMLElement
    const containerRect = container?.getBoundingClientRect() || { left: 0, top: 0 }

    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top
    }
  }

  function setElementPosition(element: HTMLElement, position: Position): void {
    element.style.left = `${position.x}px`
    element.style.top = `${position.y}px`
  }

  function setElementSize(element: HTMLElement, size: Size): void {
    element.style.width = `${size.width}px`
    element.style.height = `${size.height}px`
  }

  // Drag functionality
  function iniciarArrastre(event: MouseEvent | TouchEvent, element: HTMLElement, onDragStart?: (position: Position) => void): void {
    event.preventDefault()

    const position = getEventPosition(event)
    const elementRect = element.getBoundingClientRect()

    dragState.isDragging = true
    dragState.startPosition = position
    dragState.currentPosition = position
    dragState.offset = {
      x: position.x - elementRect.left,
      y: position.y - elementRect.top
    }
    dragState.element = element

    // Add dragging class for visual feedback
    element.classList.add('dragging')
    element.style.zIndex = '1000'
    element.style.position = 'absolute'

    if (onDragStart) {
      onDragStart(position)
    }

    // Add event listeners
    if (touchSupport.isTouchDevice) {
      if ('touches' in event) {
        touchSupport.touchIdentifier = event.touches[0].identifier
      }
      document.addEventListener('touchmove', manejarMovimientoArrastre, { passive: false })
      document.addEventListener('touchend', finalizarArrastre)
      document.addEventListener('touchcancel', cancelarArrastre)
    } else {
      document.addEventListener('mousemove', manejarMovimientoArrastre)
      document.addEventListener('mouseup', finalizarArrastre)
    }

    // Prevent text selection during drag
    document.body.style.userSelect = 'none'
  }

  function manejarMovimientoArrastre(event: MouseEvent | TouchEvent): void {
    if (!dragState.isDragging || !dragState.element) return

    event.preventDefault()

    // For touch events, ensure we're tracking the correct touch
    if ('touches' in event && touchSupport.touchIdentifier !== undefined) {
      const touch = Array.from(event.touches).find(t => t.identifier === touchSupport.touchIdentifier)
      if (!touch) return
    }

    const currentPosition = getEventPosition(event)
    dragState.currentPosition = currentPosition

    const newPosition = {
      x: currentPosition.x - dragState.offset.x,
      y: currentPosition.y - dragState.offset.y
    }

    const snappedPosition = snapPositionToGrid(newPosition)
    setElementPosition(dragState.element, snappedPosition)
  }

  function finalizarArrastre(event?: MouseEvent | TouchEvent, onDragEnd?: (position: Position) => void): void {
    if (!dragState.isDragging || !dragState.element) return

    const element = dragState.element
    const finalPosition = getElementPosition(element)

    // Remove dragging class and reset z-index
    element.classList.remove('dragging')
    element.style.zIndex = ''

    // Clean up event listeners
    if (touchSupport.isTouchDevice) {
      document.removeEventListener('touchmove', manejarMovimientoArrastre)
      document.removeEventListener('touchend', finalizarArrastre)
      document.removeEventListener('touchcancel', cancelarArrastre)
      touchSupport.touchIdentifier = undefined
    } else {
      document.removeEventListener('mousemove', manejarMovimientoArrastre)
      document.removeEventListener('mouseup', finalizarArrastre)
    }

    // Restore text selection
    document.body.style.userSelect = ''

    if (onDragEnd) {
      onDragEnd(finalPosition)
    }

    // Reset drag state
    dragState.isDragging = false
    dragState.element = null
  }

  function cancelarArrastre(): void {
    if (!dragState.isDragging || !dragState.element) return

    const element = dragState.element

    // Restore original position
    setElementPosition(element, dragState.startPosition)

    // Clean up
    element.classList.remove('dragging')
    element.style.zIndex = ''

    // Remove event listeners
    if (touchSupport.isTouchDevice) {
      document.removeEventListener('touchmove', manejarMovimientoArrastre)
      document.removeEventListener('touchend', finalizarArrastre)
      document.removeEventListener('touchcancel', cancelarArrastre)
      touchSupport.touchIdentifier = undefined
    } else {
      document.removeEventListener('mousemove', manejarMovimientoArrastre)
      document.removeEventListener('mouseup', finalizarArrastre)
    }

    document.body.style.userSelect = ''

    // Reset drag state
    dragState.isDragging = false
    dragState.element = null
  }

  // Resize functionality
  function iniciarRedimensionamiento(
    event: MouseEvent | TouchEvent,
    element: HTMLElement,
    handle: string,
    onResizeStart?: (size: Size) => void
  ): void {
    event.preventDefault()
    event.stopPropagation()

    const position = getEventPosition(event)
    const elementRect = element.getBoundingClientRect()

    resizeState.isResizing = true
    resizeState.startPosition = position
    resizeState.startSize = {
      width: elementRect.width,
      height: elementRect.height
    }
    resizeState.handle = handle
    resizeState.element = element

    // Add resizing class for visual feedback
    element.classList.add('resizing')
    document.body.style.cursor = getCursorForHandle(handle)

    if (onResizeStart) {
      onResizeStart(resizeState.startSize)
    }

    // Add event listeners
    if (touchSupport.isTouchDevice) {
      if ('touches' in event) {
        touchSupport.touchIdentifier = event.touches[0].identifier
      }
      document.addEventListener('touchmove', manejarMovimientoRedimensionamiento, { passive: false })
      document.addEventListener('touchend', manejarFinalizarRedimensionamiento)
      document.addEventListener('touchcancel', cancelarRedimensionamiento)
    } else {
      document.addEventListener('mousemove', manejarMovimientoRedimensionamiento)
      document.addEventListener('mouseup', manejarFinalizarRedimensionamiento)
    }

    document.body.style.userSelect = 'none'
  }

  function manejarFinalizarRedimensionamiento(): void {
    finalizarRedimensionamiento()
  }

  function manejarMovimientoRedimensionamiento(event: MouseEvent | TouchEvent): void {
    if (!resizeState.isResizing || !resizeState.element || !resizeState.handle) return

    event.preventDefault()

    const currentPosition = getEventPosition(event)
    const deltaX = currentPosition.x - resizeState.startPosition.x
    const deltaY = currentPosition.y - resizeState.startPosition.y

    const newSize = calculateNewSize(resizeState.startSize, deltaX, deltaY, resizeState.handle)

    // Apply minimum size constraints
    newSize.width = Math.max(50, newSize.width)
    newSize.height = Math.max(30, newSize.height)

    setElementSize(resizeState.element, newSize)
  }

  function finalizarRedimensionamiento(onResizeEnd?: (size: Size) => void): void {
    if (!resizeState.isResizing || !resizeState.element) return

    const element = resizeState.element
    const elementRect = element.getBoundingClientRect()
    const finalSize = {
      width: elementRect.width,
      height: elementRect.height
    }

    // Clean up
    element.classList.remove('resizing')
    document.body.style.cursor = ''

    // Remove event listeners
    if (touchSupport.isTouchDevice) {
      document.removeEventListener('touchmove', manejarMovimientoRedimensionamiento)
      document.removeEventListener('touchend', manejarFinalizarRedimensionamiento)
      document.removeEventListener('touchcancel', cancelarRedimensionamiento)
      touchSupport.touchIdentifier = undefined
    } else {
      document.removeEventListener('mousemove', manejarMovimientoRedimensionamiento)
      document.removeEventListener('mouseup', manejarFinalizarRedimensionamiento)
    }

    document.body.style.userSelect = ''

    if (onResizeEnd) {
      onResizeEnd(finalSize)
    }

    // Reset resize state
    resizeState.isResizing = false
    resizeState.element = null
    resizeState.handle = null
  }

  function cancelarRedimensionamiento(): void {
    if (!resizeState.isResizing || !resizeState.element) return

    const element = resizeState.element

    // Restore original size
    setElementSize(element, resizeState.startSize)

    // Clean up
    element.classList.remove('resizing')
    document.body.style.cursor = ''

    // Remove event listeners
    if (touchSupport.isTouchDevice) {
      document.removeEventListener('touchmove', manejarMovimientoRedimensionamiento)
      document.removeEventListener('touchend', manejarFinalizarRedimensionamiento)
      document.removeEventListener('touchcancel', cancelarRedimensionamiento)
      touchSupport.touchIdentifier = undefined
    } else {
      document.removeEventListener('mousemove', manejarMovimientoRedimensionamiento)
      document.removeEventListener('mouseup', manejarFinalizarRedimensionamiento)
    }

    document.body.style.userSelect = ''

    // Reset resize state
    resizeState.isResizing = false
    resizeState.element = null
    resizeState.handle = null
  }

  // Helper functions
  function calculateNewSize(startSize: Size, deltaX: number, deltaY: number, handle: string): Size {
    const newSize = { ...startSize }

    switch (handle) {
      case 'nw': // Top-left
        newSize.width = startSize.width - deltaX
        newSize.height = startSize.height - deltaY
        break
      case 'ne': // Top-right
        newSize.width = startSize.width + deltaX
        newSize.height = startSize.height - deltaY
        break
      case 'sw': // Bottom-left
        newSize.width = startSize.width - deltaX
        newSize.height = startSize.height + deltaY
        break
      case 'se': // Bottom-right
        newSize.width = startSize.width + deltaX
        newSize.height = startSize.height + deltaY
        break
      case 'n': // Top
        newSize.height = startSize.height - deltaY
        break
      case 's': // Bottom
        newSize.height = startSize.height + deltaY
        break
      case 'w': // Left
        newSize.width = startSize.width - deltaX
        break
      case 'e': // Right
        newSize.width = startSize.width + deltaX
        break
    }

    return newSize
  }

  function getCursorForHandle(handle: string): string {
    const cursors: Record<string, string> = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize'
    }
    return cursors[handle] || 'default'
  }

  // Drop zone functionality
  function esZonaValida(event: MouseEvent | TouchEvent, validZones: HTMLElement[]): HTMLElement | null {
    const position = getEventPosition(event)

    for (const zone of validZones) {
      const rect = zone.getBoundingClientRect()
      if (
        position.x >= rect.left &&
        position.x <= rect.right &&
        position.y >= rect.top &&
        position.y <= rect.bottom
      ) {
        return zone
      }
    }

    return null
  }

  function marcarZonaActiva(zone: HTMLElement): void {
    zone.classList.add('drop-zone-active')
  }

  function desmarcarZonaActiva(zone: HTMLElement): void {
    zone.classList.remove('drop-zone-active')
  }

  return {
    // State
    dragState,
    resizeState,
    touchSupport,
    snapToGrid,
    gridSize,

    // Drag functions
    iniciarArrastre,
    manejarMovimientoArrastre,
    finalizarArrastre,
    cancelarArrastre,

    // Resize functions
    iniciarRedimensionamiento,
    manejarMovimientoRedimensionamiento,
    finalizarRedimensionamiento,
    cancelarRedimensionamiento,

    // Utility functions
    getEventPosition,
    snapPositionToGrid,
    getElementPosition,
    setElementPosition,
    setElementSize,
    esZonaValida,
    marcarZonaActiva,
    desmarcarZonaActiva,
    getCursorForHandle
  }
}
