let running: boolean = false
let timerId: ReturnType<typeof setInterval> | undefined
let lowFps: boolean = false

// Tick interval in milliseconds
const TICK_INTERVAL = 100
const LOW_FPS_INTERVAL = 1000

self.onmessage = async ({ data }) => {
    if (data.start) {
        lowFps = data.lowFps
        if (!running) {
            running = true
            const interval = lowFps ? LOW_FPS_INTERVAL : TICK_INTERVAL
            timerId = setInterval(() => {
                self.postMessage(interval)
            }, interval)
        }
    } else {
        running = false
        if (timerId !== undefined) {
            clearInterval(timerId)
            timerId = undefined
        }
    }
}
