/**
 * Messaging stub - we don't use PubNub/SocketIO messaging
 * Instead, we fetch code directly from our API
 */

export function init(deviceId: string, testTransport: any) {
  // No-op
}

export function subscribe(options: { channel: string }) {
  // No-op
}

export function unsubscribe() {
  // No-op
}

export function listen(listener: (payload: any) => void) {
  // No-op
}

export function publish(message: object) {
  // No-op - we don't send messages back
}
