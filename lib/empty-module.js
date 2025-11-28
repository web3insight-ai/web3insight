// Empty module used to replace test-only code during production builds
export const createTestClient = () => {
  throw new Error('Test client is not available in production builds')
}

export const testActions = () => {
  throw new Error('Test actions are not available in production builds')
}

export default {}

