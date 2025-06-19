'use client'

import { Building } from "@/lib/types"
import { Plus, UserCheck, UserX } from "lucide-react"

interface BuildingHeaderProps {
  building: Building
  onInviteClick: () => void
  presenceData?: Record<string, boolean>
  currentUserId?: string
  onTogglePresence?: () => void
}

export const BuildingHeader = ({ 
  building,
  onInviteClick, 
  presenceData = {},
  currentUserId,
  onTogglePresence
}: BuildingHeaderProps) => {
  const totalResidents = building.residents?.length || 0
  const presentResidents = building.residents?.filter(resident => presenceData[resident.id] === true).length || 0
  const awayResidents = building.residents?.filter(resident => presenceData[resident.id] === false).length || 0
  
  const isCurrentUserPresent = currentUserId ? presenceData[currentUserId] : false

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
       <div className="flex items-center justify-between">
        <div>
       <h1 className="text-2xl font-semibold text-zinc-100">{building.name}</h1>
        <p className="text-sm text-zinc-400 mb-3">
          Created {new Date(building.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        </div>
        <div className="flex items-center gap-2">
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
                {isCurrentUserPresent ? 'Mark Away' : 'Mark Present'}
              </span>
            </button>
          )}
          <button
            onClick={onInviteClick}
            className="rounded-md bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 p-2 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Invite</span>
          </button>
        </div>
       </div>
        
        {totalResidents > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 w-[70px] h-[50px] justify-center">
              <span className="text-blue-400 font-bold text-lg leading-none">{totalResidents}</span>
              <span className="text-blue-300 text-xs font-medium">total</span>
            </div>
            <div className="flex flex-col items-center bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 w-[70px] h-[50px] justify-center">
              <span className="text-green-400 font-bold text-lg leading-none">{presentResidents}</span>
              <span className="text-green-300 text-xs font-medium">present</span>
            </div>
            <div className="flex flex-col items-center bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 w-[70px] h-[50px] justify-center">
              <span className="text-red-400 font-bold text-lg leading-none">{awayResidents}</span>
              <span className="text-red-300 text-xs font-medium">away</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 