import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMedia } from '../useMedia'

const useMediaQueryMock = vi.fn()

vi.mock('react-responsive', () => ({
  useMediaQuery: (params: unknown) => useMediaQueryMock(params)
}))

describe('useMedia', () => {
  beforeEach(() => {
    useMediaQueryMock.mockReset()
  })

  it('maps media queries to flags', () => {
    useMediaQueryMock.mockImplementation((params: unknown) => {
      if (typeof params === 'object' && params !== null && 'query' in params) {
        return (params as { query?: string }).query === '(pointer: coarse)'
      }
      const config = params as { maxWidth?: number; minWidth?: number }
      if (config.maxWidth === 764) return true
      if (config.minWidth === 764 && config.maxWidth === 1024) return false
      if (config.minWidth === 1024 && config.maxWidth === undefined) return true
      return false
    })

    const { result } = renderHook(() => useMedia())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(true)
    expect(result.current.isTouch).toBe(true)
  })

  it('returns false when no queries match', () => {
    useMediaQueryMock.mockReturnValue(false)

    const { result } = renderHook(() => useMedia())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
    expect(result.current.isDesktop).toBe(false)
    expect(result.current.isTouch).toBe(false)
  })
})
