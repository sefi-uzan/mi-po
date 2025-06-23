'use client'

import { Crown, User } from "lucide-react"
import { useTranslations } from "next-intl"

interface Resident {
  id: string
  displayName: string
  role: 'admin' | 'member'
  phone?: string | null
  isVerified?: boolean
  joinedAt: Date | string
  userId?: string
  details?: string
}

interface PresenceStatus {
  id: string
  userId: string | null
  groupId: string | null
  status: "unknown" | "safe" | "present" | "need_help" | "absent" | null
  lastUpdated: Date | null
}

interface ResidentCardProps {
  resident: Resident
  currentUserId: string
  presenceStatus?: PresenceStatus
}

const STATUS_CONFIG = {
  present: { color: 'text-green-400', bgColor: 'bg-green-400', label: 'present', icon: '🟢' },
  absent: { color: 'text-red-400', bgColor: 'bg-red-400', label: 'absent', icon: '🔴' },
  safe: { color: 'text-blue-400', bgColor: 'bg-blue-400', label: 'safe', icon: '🏠' },
  need_help: { color: 'text-orange-400', bgColor: 'bg-orange-400', label: 'needHelp', icon: '🆘' },
  unknown: { color: 'text-gray-400', bgColor: 'bg-gray-400', label: 'unknown', icon: '⚪' }
} as const

export const ResidentCard = ({ resident, currentUserId, presenceStatus }: ResidentCardProps) => {
  const t = useTranslations()
  const isCurrentUser = resident.id === currentUserId

  const status = presenceStatus?.status || 'unknown'
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

  return (
    <div className="flex items-start justify-between p-4 bg-black/25 rounded-md border border-zinc-700/50">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={`text-xs ${statusConfig.color}`}>
                {statusConfig.icon}
              </span>
            </div>
            <h3 className="font-medium text-zinc-100">
              {resident.displayName}
            </h3>
            {isCurrentUser && <span title={t('ResidentCard.you')}><User className="w-4 h-4"/></span>}
            {resident.role === 'admin' && (
              <span className="" title={t('ResidentCard.groupAdmin')}>
                <Crown className="w-4 h-4"/>
              </span>
            )}
          </div>

          <div className="text-xs text-zinc-500">
           
            <div className="flex items-center gap-1">
            <span className={`text-xs ${statusConfig.color}`}>
              {t(`Presence.${statusConfig.label}`)}
            </span>
            {presenceStatus?.lastUpdated && (
              <span className="text-xs text-zinc-500">
                • {new Date(presenceStatus.lastUpdated).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
          </div>
            {/* {t('ResidentCard.joined')} {new Date(resident.joinedAt).toLocaleDateString()} */}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          {resident.phone && (
            <p className="text-sm text-zinc-400">
             <a 
                href={`tel:${resident.phone}`}
                className="hover:text-zinc-300 transition-colors underline"
              >
                {resident.phone}
              </a>
            </p>
          )}

        </div>
        <span className="text-sm text-zinc-400">{resident.details}</span>
      </div>
    </div>
  )
} 