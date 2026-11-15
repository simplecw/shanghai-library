import '@testing-library/jest-dom/vitest'

// jsdom 缺少 matchMedia / ResizeObserver，antd 组件（栅格、Table 固定列等）依赖它们
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || (ResizeObserverMock as unknown as typeof ResizeObserver)
