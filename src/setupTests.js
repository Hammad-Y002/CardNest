// Import Jest DOM for React testing
import '@testing-library/jest-dom';

// Set up global configurations for tests
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  };
};

// Mock intersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

global.IntersectionObserver = MockIntersectionObserver;

// Suppress console errors/warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: React.createFactory()') ||
    args[0]?.includes?.('Invalid prop')
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (
    args[0]?.includes?.('Warning:') ||
    args[0]?.includes?.('deprecated')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Add any additional global setup for your tests here

