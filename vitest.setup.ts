// Copied from
// https://github.com/vitest-dev/vitest/blob/7d028cb37d3e964a37899559b640bcb3a13acda7/examples/react/vitest.setup.ts

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
