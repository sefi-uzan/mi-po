'use client'

import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { EditGroupDialog } from "./edit-group-dialog"
import { EditMemberDetailsDialog } from "./edit-member-details-dialog"
import { GroupHeader } from "./group-header"
import { InviteDialog } from "./invite-dialog"
import { ResidentCard } from "./resident-card"
import { LeaveGroupDialog } from "./leave-group-dialog"
import { PresenceSelector } from "./presence-selector"
import { GroupStats } from "./group-stats"

interface PresenceData {
  id: string
  userId: string | null
  groupId: string | null
  status: "unknown" | "safe" | "present" | "need_help" | "absent" | null
  lastUpdated: Date | null
}

export const GroupPageClient = () => {
  const t = useTranslations()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showEditDetailsDialog, setShowEditDetailsDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [qrCode, setQRCode] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const { groupId } = useParams()

  const { data: currentMember } = useQuery({
    queryKey: ['current-member', groupId],
    queryFn: async () => {
      const response = await client.group.getCurrentGroupMember.$get({ groupId: groupId as string })
      return response.json()
    },
  })

  useEffect(() => {
    if (currentMember?.groupMember?.id) {
      setCurrentUserId(currentMember.groupMember.id)
    }
  }, [currentMember])

  const { data: groupData, isLoading, error } = useQuery({
    queryKey: ['get-group', groupId],
    queryFn: async () => {
      const response = await client.group.getGroupDetails.$post({ groupId: groupId as string })
      return response.json()
    },
  })

  const { data: presenceData } = useQuery({
    queryKey: ['group-presence', groupId],
    queryFn: async () => {
      const response = await client.presence.getGroupPresence.$get({ groupId: groupId as string })
      return response.json()
    },
    refetchInterval: 5000,
    enabled: !!groupId
  })

  const generateQRCode = async (inviteCode: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(inviteCode)
      setQRCode(qrCodeDataURL)
      setShowInviteDialog(true)
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error(t('Toast.errorGeneratingQR'))
    }
  }

  const handleInviteClick = () => {
    if (groupData?.group.inviteCode) {
      generateQRCode(groupData.group.inviteCode)
    }
  }

  const handleEditClick = () => {
    setShowEditDialog(true)
  }

  const handleEditDetailsClick = () => {
    setShowEditDetailsDialog(true)
  }

  const handleLeaveClick = () => {
    setShowLeaveDialog(true)
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-6 py-6 rounded-md text-zinc-100/75">
        <p className="text-center">{t('GroupPage.loading')}</p>
      </div>
    )
  }

  if (error || !groupData) {
    return (
      <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-6 py-6 rounded-md text-zinc-100/75">
        <p className="text-center text-red-400">{t('GroupPage.errorLoadingGroup')}</p>
      </div>
    )
  }

  const isAdmin = groupData.role === 'admin'

  // Transform member data to match ResidentCard expectations
  const transformedMembers = groupData.members.map(member => ({
    id: member.id,
    displayName: member.displayName,
    role: member.role as 'admin' | 'member',
    phone: member.phone,
    isVerified: member.isVerified || false,
    joinedAt: member.joinedAt || new Date(),
    userId: member.userId || undefined,
    details: member.details || undefined
  })).filter(member => member.role !== null)

  // Create presence lookup for easier access
  const presenceLookup = presenceData?.presence?.reduce((acc: Record<string, PresenceData>, presence: PresenceData) => {
    if (presence.userId) {
      acc[presence.userId] = presence
    }
    return acc
  }, {} as Record<string, PresenceData>) || {}

  return (
    <>
      <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-6 py-6 rounded-md text-zinc-100/75 space-y-6">
        <GroupHeader 
          group={groupData}
          onInviteClick={handleInviteClick}
          onEditClick={isAdmin ? handleEditClick : undefined}
          onEditDetailsClick={handleEditDetailsClick}
          onLeaveClick={!isAdmin ? handleLeaveClick : undefined}
          isAdmin={isAdmin}
        />

        {presenceData?.presence && (
          <GroupStats presenceData={presenceData.presence} />
        )}

      

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-zinc-100">
              {t('GroupPage.members')} ({transformedMembers.length})
            </h3>
            {currentUserId && presenceData?.presence && (
          <PresenceSelector 
            groupId={groupData.group.id} 
            currentUserId={currentUserId}
            presenceData={presenceData.presence}
          />
        )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {transformedMembers.map((member) => (
              <ResidentCard 
                key={member.id} 
                resident={member}
                currentUserId={currentUserId}
                presenceStatus={presenceLookup[member.userId || member.id]}
              />
            ))}
          </div>
        </div>
      </div>

      <InviteDialog
        show={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        inviteCode={groupData.group.inviteCode}
        qrCodeDataUrl={qrCode}
      />

      <EditGroupDialog
        show={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        groupId={groupData.group.id}
        groupName={groupData.group.name}
      />

      <EditMemberDetailsDialog
        show={showEditDetailsDialog}
        onClose={() => setShowEditDetailsDialog(false)}
        groupId={groupData.group.id}
        currentDisplayName={currentMember?.user?.displayName || ""}
        currentDetails={currentMember?.groupMember?.details || ""}
      />

      <LeaveGroupDialog
        show={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        groupId={groupData.group.id}
      />
    </>
  )
} 