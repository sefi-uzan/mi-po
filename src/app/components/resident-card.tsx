'use client'

interface Resident {
  id: string
  displayName: string
  type: 'owner' | 'resident'
  phoneNumber?: string | null
  phoneVerified: boolean
  details?: string | null
  joinedAt: Date | string
}

interface ResidentCardProps {
  resident: Resident
  currentUserId: string
  presenceData?: Record<string, boolean>
  onTogglePresence?: () => void
}

export const ResidentCard = ({ resident, currentUserId, presenceData, onTogglePresence }: ResidentCardProps) => {
  const isCurrentUser = resident.id === currentUserId
  const isPresent = presenceData?.[resident.id]

  return (
    <div className="flex items-start justify-between p-4 bg-black/25 rounded-md border border-zinc-700/50">
      <div className="flex-1">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isPresent ? 'bg-green-400' : 'bg-gray-400'
          }`} title={isPresent ? 'Present' : 'Away'} />
          <h3 className="font-medium text-zinc-100">
            {resident.displayName}
            {isCurrentUser && <span className="text-zinc-400 ml-2">(You)</span>}
          </h3>

        </div>
        <div className="text-xs text-zinc-500">
        {resident.type === 'owner' && (
            <span className="text-yellow-400 text-lg" title="Building Owner">
              👑
            </span>
          )}
        Joined {new Date(resident.joinedAt).toLocaleDateString()}
      </div>
        </div>
        
        {resident.phoneNumber && (
          <p className="text-sm text-zinc-400 mt-1">
            📞 <a 
              href={`tel:${resident.phoneNumber}`}
              className="hover:text-zinc-300 transition-colors underline"
            >
              {resident.phoneNumber}
            </a>
            {resident.phoneVerified && (
              <span className="ml-2 text-green-400 text-xs">✓ Verified</span>
            )}
          </p>
        )}
        
        {resident.details && (
          <p className="text-sm text-zinc-300 mt-2">
            {resident.details}
          </p>
        )}

        {isCurrentUser && onTogglePresence && (
          <button
            onClick={onTogglePresence}
            className="mt-2 text-xs px-3 py-1 rounded-md bg-zinc-600 hover:bg-zinc-500 text-zinc-100 transition cursor-pointer"
          >
            Mark as {isPresent ? 'Away' : 'Present'}
          </button>
        )}
      </div>
    </div>
  )
} 