'use client'

import { useTranslations } from "next-intl"

interface Resident {
  id: string
  displayName: string
  role: 'admin' | 'member'
  phone?: string | null
  isVerified?: boolean
  joinedAt: Date | string
  userId?: string
}

interface ResidentCardProps {
  resident: Resident
  currentUserId: string
  presenceData?: Record<string, boolean>
}

export const ResidentCard = ({ resident, currentUserId, presenceData }: ResidentCardProps) => {
  const t = useTranslations()
  const isCurrentUser = resident.id === currentUserId
  const isPresent = presenceData?.[resident.id]

  return (
    <div className="flex items-start justify-between p-4 bg-black/25 rounded-md border border-zinc-700/50">
      <div className="flex-1">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isPresent ? 'bg-green-400' : 'bg-gray-400'
          }`} title={isPresent ? t('ResidentCard.present') : t('ResidentCard.away')} />
          <h3 className="font-medium text-zinc-100">
            {resident.displayName}
            {isCurrentUser && <span className="text-zinc-400 ml-2"> {t('ResidentCard.you')}</span>}
          </h3>

        </div>
        <div className="text-xs text-zinc-500">
        {resident.role === 'admin' && (
            <span className="text-yellow-400 text-lg" title={t('ResidentCard.groupAdmin')}>
              👑
            </span>
          )}
        {t('ResidentCard.joined')} {new Date(resident.joinedAt).toLocaleDateString()}
      </div>
        </div>
        
        {resident.phone && (
          <p className="text-sm text-zinc-400 mt-1">
            📞 <a 
              href={`tel:${resident.phone}`}
              className="hover:text-zinc-300 transition-colors underline"
            >
              {resident.phone}
            </a>
            {resident.isVerified && (
              <span className="ml-2 text-green-400 text-xs">{t('ResidentCard.verified')}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
} 