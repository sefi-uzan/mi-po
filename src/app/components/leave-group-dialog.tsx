'use client'

import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

interface LeaveGroupDialogProps {
  show: boolean
  onClose: () => void
  groupId: string
}

export const LeaveGroupDialog = ({ show, onClose, groupId }: LeaveGroupDialogProps) => {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const router = useRouter()
  const updateGroupMutation = useMutation({
    mutationFn: async (data: { groupId: string }) => {
      const res = await client.group.leaveGroup.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-group", groupId] })
      toast.success(t('Toast.groupLeft'))
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || t('Toast.groupLeaveFailed'))
    }
  })

  const handleClose = () => {
    onClose()
    router.push("/groups")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateGroupMutation.mutate({ groupId })
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">
            {t('GroupHeader.leaveGroup')}
          </h3>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <span className="text-sm text-zinc-300">{t('GroupHeader.leaveGroupWarning')}</span>
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
              disabled={updateGroupMutation.isPending}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateGroupMutation.isPending ? t('GroupHeader.leaving') : t('GroupHeader.leaveGroup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 