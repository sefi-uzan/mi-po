'use client'

import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import QRCode from "qrcode"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { DeleteGroupDialog } from "./delete-group-dialog"
import { EditGroupDialog } from "./edit-group-dialog"
import { GroupHeader } from "./group-header"
import { InviteDialog } from "./invite-dialog"
import { ResidentCard } from "./resident-card"
import { LeaveGroupDialog } from "./leave-group-dialog"


export const GroupPageClient = () => {
  const t = useTranslations()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [qrCode, setQRCode] = useState("")
  const [currentUserId] = useState<string>("")
  const { groupId } = useParams()

  const { data: groupData, isLoading, error } = useQuery({
    queryKey: ['get-group', groupId],
    queryFn: async () => {
      const response = await client.group.getGroupDetails.$post({ groupId: groupId as string })
      return response.json()
    },
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
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
    userId: member.userId || undefined
  })).filter(member => member.role !== null)

  return (
    <>
      <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-6 py-6 rounded-md text-zinc-100/75 space-y-6">
        <GroupHeader 
          group={groupData}
          onInviteClick={handleInviteClick}
          onEditClick={isAdmin ? handleEditClick : undefined}
          onDeleteClick={isAdmin ? handleDeleteClick : undefined}
          onLeaveClick={!isAdmin ? handleLeaveClick : undefined}
          isAdmin={isAdmin}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-zinc-100">
              {t('GroupPage.members')} ({transformedMembers.length})
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {transformedMembers.map((member) => (
              <ResidentCard 
                key={member.id} 
                resident={member}
                currentUserId={currentUserId}
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

      <DeleteGroupDialog
        show={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        groupId={groupData.group.id}
        groupName={groupData.group.name}
      />

      <LeaveGroupDialog
        show={showLeaveDialog}
        onClose={() => setShowLeaveDialog(false)}
        groupId={groupData.group.id}
      />
    </>
  )
} 