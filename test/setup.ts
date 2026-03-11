import '@testing-library/jest-dom'

// Radix UI components use ResizeObserver for layout/positioning calculations
class ResizeObserverMock {
  observe () {}
  unobserve () {}
  disconnect () {}
}
global.ResizeObserver = ResizeObserverMock

// Radix UI and react-day-picker use matchMedia for responsive behaviour
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener () {},
    removeListener () {},
    addEventListener () {},
    removeEventListener () {},
    dispatchEvent: () => false
  })
})
