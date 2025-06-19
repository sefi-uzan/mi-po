'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { US, IL } from 'country-flag-icons/react/3x2'

interface LocaleSelectorProps {
  initialLocale: string
}

export const LocaleSelector = ({ initialLocale }: LocaleSelectorProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentLocale, setCurrentLocale] = useState(initialLocale)

  const handleLocaleChange = (newLocale: string) => {
    setCurrentLocale(newLocale)
    startTransition(() => {
      // Set cookie with locale preference
      document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
      // Refresh the page to apply new locale
      router.refresh()
    })
  }

  return (
    <div dir="ltr" className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-lg p-2 border border-zinc-700/50">
      <button
        onClick={() => handleLocaleChange('en')}
        disabled={isPending}
        className={`cursor-pointer px-3 py-1 rounded-md text-sm font-medium transition-all ${
          currentLocale === 'en'
            ? 'bg-zinc-600 text-zinc-100'
            : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
        }`}
      >
        <US title="English" className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleLocaleChange('he')}
        disabled={isPending}
        className={`cursor-pointer px-3 py-1 rounded-md text-sm font-medium transition-all ${
          currentLocale === 'he'
            ? 'bg-zinc-600 text-zinc-100'
            : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
        }`}
      >
        <IL title="עברית" className="w-4 h-4" />
      </button>
    </div>
  )
} 