'use client'

import { AppRouter } from "@/server"
import { InferRouterOutputs } from "jstack"
import { Plus, UserCheck, UserX, Edit, User } from "lucide-react"
import { useTranslations } from "next-intl"


interface GroupHeaderProps {
  group: InferRouterOutputs<AppRouter>["group"]["getGroupDetails"]
  onInviteClick: () => void
  presenceData?: Record<string, boolean>
  currentUserId?: string
  onTogglePresence?: () => void
  isAdmin?: boolean
  onEditClick?: () => void
  onEditDetailsClick?: () => void
  onLeaveClick?: () => void
}

export const GroupHeader = ({ 
  group,
  onInviteClick, 
  presenceData = {},
  currentUserId,
  onTogglePresence,
  isAdmin = false,
  onEditClick,
  onEditDetailsClick,
  onLeaveClick
}: GroupHeaderProps) => {
  const t = useTranslations()
  
  const isCurrentUserPresent = currentUserId ? presenceData[currentUserId] : false

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
       <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-semibold text-zinc-100">{group.group?.name}</h1>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-700/50 text-zinc-300 capitalize">
              {t(`GroupsDashboard.${group.group?.type}`)}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mb-3">
            {t('GroupHeader.created')} {group.group?.createdAt ? new Date(group.group.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onEditDetailsClick && (
            <button
              onClick={onEditDetailsClick}
              className="rounded-md bg-blue-800/50 border border-blue-700 hover:bg-blue-700/50 hover:border-blue-600 text-blue-300 hover:text-blue-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <User className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{t('GroupHeader.edit')}</span>
            </button>
          )}
          {currentUserId && onTogglePresence && (
            <button
              onClick={onTogglePresence}
              className="rounded-md bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              {isCurrentUserPresent ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              <span className="text-xs hidden sm:inline">
                {isCurrentUserPresent ? t('GroupHeader.markAway') : t('GroupHeader.markPresent')}
              </span>
            </button>
          )}
          {isAdmin && onEditClick && (
            <button
              onClick={onEditClick}
              className="rounded-md bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <Edit className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{t('GroupHeader.edit')}</span>
            </button>
          )}
          {onLeaveClick && (
            <button
              onClick={onLeaveClick}
              className="rounded-md bg-red-800/50 border border-red-700 hover:bg-red-700/50 hover:border-red-600 text-red-300 hover:text-red-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <UserX className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{t('GroupHeader.leave')}</span>
            </button>
          )}
          <button
            onClick={onInviteClick}
            className="rounded-md bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">{t('GroupHeader.invite')}</span>
          </button>
        </div>
       </div>
        
       
      </div>
    </div>
  )
} 