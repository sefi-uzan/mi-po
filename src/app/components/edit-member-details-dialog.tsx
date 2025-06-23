'use client'

import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"

interface EditMemberDetailsDialogProps {
  show: boolean
  onClose: () => void
  groupId: string
  currentDisplayName: string
  currentDetails?: string
}

export const EditMemberDetailsDialog = ({ 
  show, 
  onClose, 
  groupId, 
  currentDisplayName,
  currentDetails = ""
}: EditMemberDetailsDialogProps) => {
  const t = useTranslations()
  const [displayName, setDisplayName] = useState("")
  const [details, setDetails] = useState("")
  const queryClient = useQueryClient()

  const updateMemberDetailsMutation = useMutation({
    mutationFn: async (data: { groupId: string; displayName?: string; details?: string }) => {
      const res = await client.group.updateGroupMemberDetails.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['current-member', groupId] })
      toast.success(t('Toast.memberDetailsUpdated'))
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || t('Toast.memberDetailsUpdateFailed'))
    }
  })

  const handleClose = () => {
    setDisplayName("")
    setDetails("")
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasChanges = displayName !== currentDisplayName || details !== currentDetails
    if (!hasChanges) {
      handleClose()
      return
    }

    const updateData: { groupId: string; displayName?: string; details?: string } = {
      groupId
    }

    if (displayName !== currentDisplayName) {
      updateData.displayName = displayName.trim()
    }

    if (details !== currentDetails) {
      updateData.details = details.trim()
    }

    updateMemberDetailsMutation.mutate(updateData)
  }

  useEffect(() => {
    if (show) {
      setDisplayName(currentDisplayName)
      setDetails(currentDetails)
    }
  }, [show, currentDisplayName, currentDetails])

  if (!show) return null

  const hasChanges = displayName !== currentDisplayName || details !== currentDetails

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">
            Edit My Details
          </h3>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300 mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              minLength={3}
              maxLength={10}
              required
            />
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-medium text-zinc-300 mb-2">
              Additional Details
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Optional additional information..."
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-600 transition-colors"
            >
              {t('GroupCreate.back')}
            </button>
            <button
              type="submit"
              disabled={updateMemberDetailsMutation.isPending || !hasChanges}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMemberDetailsMutation.isPending ? 'Updating...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 