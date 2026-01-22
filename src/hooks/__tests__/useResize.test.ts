import {describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useResize } from '../useResize'

describe("useResize", () => {
    it("Resizes on width updates", () => {
        vi.useFakeTimers()
        const onResize = vi.fn()
        const { result } = renderHook(() => useResize(onResize, {delay: 10}))

        act(() => {
            window.innerWidth = 1000; 
            window.dispatchEvent(new Event("resize"))
            vi.advanceTimersByTime(10)
        })

        expect(onResize).toHaveBeenCalledTimes(1)
        vi.useRealTimers()
    })

    it("Doesn't resize on height updates", () => {
        vi.useFakeTimers()
        const onResize = vi.fn()
        const { result } = renderHook(() => useResize(onResize, {delay: 10}))

        act(() => {
            window.innerHeight = 1000; 
            window.dispatchEvent(new Event("resize"))
            vi.advanceTimersByTime(10)
        })

        expect(onResize).toHaveBeenCalledTimes(0)
        vi.useRealTimers()
    })
})