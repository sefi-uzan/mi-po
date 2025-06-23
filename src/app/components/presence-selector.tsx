'use client'

import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { ChevronDown, Circle } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface PresenceSelectorProps {
  groupId: string
  currentUserId: string
  presenceData: Array<{
    id: string
    userId: string | null
    groupId: string | null
    status: "unknown" | "safe" | "present" | "need_help" | "absent" | null
    lastUpdated: Date | null
  }>
}

const PRESENCE_STATUS_CONFIG = {
  present: { 
    label: 'present', 
    color: 'text-green-400', 
    bgColor: 'bg-green-400/20',
    icon: '🟢' 
  },
  absent: { 
    label: 'absent', 
    color: 'text-red-400', 
    bgColor: 'bg-red-400/20',
    icon: '🔴' 
  },
  unknown: { 
    label: 'unknown', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-400/20',
    icon: '⚪' 
  },
  safe: { 
    label: 'safe', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-400/20',
    icon: '🏠' 
  },
  need_help: { 
    label: 'needHelp', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-400/20',
    icon: '🆘' 
  }
} as const

export const PresenceSelector = ({ groupId, currentUserId, presenceData }: PresenceSelectorProps) => {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const updatePresenceMutation = useMutation({
    mutationFn: async (status: 'present' | 'absent' | 'unknown' | 'safe' | 'need_help') => {
      const response = await client.presence.updatePresence.$post({ groupId, status })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-presence', groupId] })
      toast.success(t('Toast.presenceUpdated'))
      setIsOpen(false)
    },
    onError: () => {
      toast.error(t('Toast.presenceUpdateFailed'))
    }
  })

  const currentUserPresence = presenceData.find(
    (p) => p.userId === currentUserId
  )
  const currentStatus = currentUserPresence?.status || 'unknown'
  const currentConfig = PRESENCE_STATUS_CONFIG[currentStatus as keyof typeof PRESENCE_STATUS_CONFIG]

  const handleStatusChange = (status: string) => {
    updatePresenceMutation.mutate(status as 'present' | 'absent' | 'unknown' | 'safe' | 'need_help')
  }

  return (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={updatePresenceMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 min-w-[140px] justify-between ${
              currentConfig.bgColor
            } border-white/20 hover:border-white/30 text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{currentConfig.icon}</span>
              <span className="text-sm font-medium">
                {t(`Presence.${currentConfig.label}`)}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full mt-2 w-42 bg-zinc-900/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl z-20 overflow-hidden">
                {Object.entries(PRESENCE_STATUS_CONFIG).map(([status, config]) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updatePresenceMutation.isPending}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors text-zinc-100 disabled:opacity-50 ${
                      currentStatus === status ? 'bg-white/5' : ''
                    }`}
                  >
                    <span className="text-base">{config.icon}</span>
                    <span className="text-sm font-medium">
                      {t(`Presence.${config.label}`)}
                    </span>
                    {currentStatus === status && (
                      <Circle className="h-2 w-2 fill-white text-white ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>


  )
} 