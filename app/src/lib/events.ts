export type DataEvent =
  | 'data:students'
  | 'data:appointments'
  | 'data:sessions'
  | 'data:incidents'
  | 'data:violations'
  | 'data:any'

const bus = new EventTarget()

export function emit(event: DataEvent, detail?: any) {
  bus.dispatchEvent(new CustomEvent(event, { detail }))
}

export function on(event: DataEvent, handler: (detail?: any) => void) {
  const cb = (e: Event) => handler((e as CustomEvent).detail)
  bus.addEventListener(event, cb as EventListener)
  return () => bus.removeEventListener(event, cb as EventListener)
}
