/**
 * Setup global de Vitest para ut-care.
 * Se ejecuta antes de cada archivo de test (ver vite.config.ts → test.setupFiles).
 */
import '@testing-library/jest-dom'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpia el DOM de jsdom tras cada test para evitar contaminación entre specs.
afterEach(() => {
  cleanup()
})
