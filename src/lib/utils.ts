import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadAsFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatRowCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  }
  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return `${(count / 1000000).toFixed(1)}M`
}

