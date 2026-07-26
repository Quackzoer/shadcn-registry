'use client'
/* cSpell:disable */

import { useForm } from '@tanstack/react-form'
import { useEffect, useRef } from 'react'
import type { FormAutosaveAdapter } from './form-autosave-adapter'
import { useDebouncer } from '@tanstack/react-pacer'

interface FormAutosaveProps {
    adapter: FormAutosaveAdapter
    storageKey: string
    saveInterval?: number
    autoRestore?: boolean
    debounceMs?: number
}

export function FormAutosave({
    adapter,
    storageKey,
    saveInterval = 5000,
    autoRestore = false,
    debounceMs = 500,
}: FormAutosaveProps) {
    const form = useForm()
    const saveIntervalRef = useRef<ReturnType<typeof setInterval>>(null)
    const hasUnsavedChangesRef = useRef(false)

    const debouncedSave = useDebouncer(
        () => {
            adapter.save(storageKey, form.baseStore.state.values)
            hasUnsavedChangesRef.current = false
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
                adapter.save(storageKey, form.baseStore.state.values)
                hasUnsavedChangesRef.current = false
            }
        }, saveInterval)

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current)
            }
        }
    }, [form, adapter, storageKey, saveInterval])

    return null
}
