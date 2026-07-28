'use client'
/* cSpell:disable */

import { useForm } from '@tanstack/react-form'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { FormAutosaveAdapter } from '@/registry/tanstack-form/lib/form-autosave-adapter'
import { useDebouncer } from '@tanstack/react-pacer'

export type FormAutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface FormAutosaveState {
    status: FormAutosaveStatus
    lastSavedAt: Date | null
    error: unknown
}

const initialAutosaveState: FormAutosaveState = {
    status: 'idle',
    lastSavedAt: null,
    error: null,
}

interface FormAutosaveProps {
    adapter: FormAutosaveAdapter
    storageKey: string
    saveInterval?: number
    autoRestore?: boolean
    debounceMs?: number
    onStatusChange?: (state: FormAutosaveState) => void
    children?: (state: FormAutosaveState) => ReactNode
}

export function FormAutosave({
    adapter,
    storageKey,
    saveInterval = 5000,
    autoRestore = false,
    debounceMs = 500,
    onStatusChange,
    children,
}: FormAutosaveProps) {
    const form = useForm()
    const saveIntervalRef = useRef<ReturnType<typeof setInterval>>(null)
    const hasUnsavedChangesRef = useRef(false)
    const [state, setState] = useState<FormAutosaveState>(initialAutosaveState)

    useEffect(() => {
        onStatusChange?.(state)
    }, [state, onStatusChange])

    const performSave = useRef<() => Promise<void>>(async () => {})
    performSave.current = async () => {
        setState((prev) => ({ ...prev, status: 'saving' }))
        try {
            await adapter.save(storageKey, form.baseStore.state.values)
            hasUnsavedChangesRef.current = false
            setState({ status: 'saved', lastSavedAt: new Date(), error: null })
        } catch (error) {
            setState((prev) => ({ ...prev, status: 'error', error }))
        }
    }

    const debouncedSave = useDebouncer(
        () => {
            performSave.current()
        },
        {
            wait: debounceMs,
            onUnmount: (d) => d.flush(),
        }
    )


    // Restore from adapter on mount
    useEffect(() => {
        if (!autoRestore) return

        const restored = adapter.restore(storageKey)
        if (restored && typeof restored === 'object') {
            form.setFieldValue('_root', restored)
        }
    }, [autoRestore, storageKey, form, adapter])

    // Subscribe to form changes
    useEffect(() => {
        const subscription = form.baseStore.subscribe(() => {
            hasUnsavedChangesRef.current = true
            debouncedSave.maybeExecute()
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [form, debouncedSave])

    // Periodic save interval
    useEffect(() => {
        saveIntervalRef.current = setInterval(() => {
            if (hasUnsavedChangesRef.current) {
                performSave.current()
            }
        }, saveInterval)

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
            }
        }
    }, [saveInterval])

    return children ? children(state) : null
}
