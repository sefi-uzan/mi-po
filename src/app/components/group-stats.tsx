'use client'

import { useTranslations } from "next-intl"
import { Circle, Users } from "lucide-react"

interface GroupStatsProps {
  presenceData: Array<{
    id: string
    userId: string | null
    groupId: string | null
    status: "unknown" | "safe" | "present" | "need_help" | "absent" | null
    lastUpdated: Date | null
  }>
}

interface PresenceStats {
  total: number
  present?: number
  absent?: number
  safe?: number
  need_help?: number
  unknown?: number
}

export const GroupStats = ({ presenceData }: GroupStatsProps) => {
  const t = useTranslations()

  const presenceStats = presenceData.reduce((acc: PresenceStats, presence) => {
    if (presence.status) {
      acc[presence.status] = (acc[presence.status] || 0) + 1
    }
    acc.total = (acc.total || 0) + 1
    return acc
  }, { total: 0 } as PresenceStats)

  return (
    <div className="w-full backdrop-blur-lg bg-black/10 px-6 py-4 rounded-md border border-white/10">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-zinc-400" />
        <div className="flex items-center gap-2 text-sm text-zinc-300">
          <span>{t('Presence.groupStatus')}:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={t('Presence.present')}>
              <Circle className="h-3 w-3 fill-green-400 text-green-400" />
              <span>{presenceStats.present || 0}</span>
            </div>
            <div className="flex items-center gap-1" title={t('Presence.absent')}>
              <Circle className="h-3 w-3 fill-red-400 text-red-400" />
              <span>{presenceStats.absent || 0}</span>
            </div>
            <div className="flex items-center gap-1" title={t('Presence.safe')}>
              <Circle className="h-3 w-3 fill-blue-400 text-blue-400" />
              <span>{presenceStats.safe || 0}</span>
            </div>
            <div className="flex items-center gap-1" title={t('Presence.needHelp')}>
              <Circle className="h-3 w-3 fill-orange-400 text-orange-400" />
              <span>{presenceStats.need_help || 0}</span>
            </div>
            <div className="flex items-center gap-1" title={t('Presence.unknown')}>
              <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
              <span>{presenceStats.unknown || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 