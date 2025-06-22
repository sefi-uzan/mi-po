'use client'

import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface DeleteGroupDialogProps {
  show: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

export const DeleteGroupDialog = ({ show, onClose, groupId, groupName }: DeleteGroupDialogProps) => {
  const t = useTranslations()
  const router = useRouter()
  const [deleteConfirmName, setDeleteConfirmName] = useState("")

  const deleteGroupMutation = useMutation({
    mutationFn: async (data: { groupId: string }) => {
      const res = await client.group.deleteGroup.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      toast.success(t('Toast.groupDeleted'))
      router.push('/groups')
    },
    onError: (error) => {
      toast.error(error.message || t('Toast.groupDeleteFailed'))
    }
  })

  const handleClose = () => {
    setDeleteConfirmName("")
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteConfirmName === groupName) {
      deleteGroupMutation.mutate({ groupId })
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-red-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-100">
            {t('GroupHeader.deleteGroup')}
          </h3>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-zinc-300 mb-2">
            {t('GroupHeader.deleteWarning')} <strong>This action is permanent!</strong>
          </p>
          <p className="text-zinc-400 text-sm">
            {t('GroupHeader.deleteConfirmation', { groupName })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="deleteConfirmName" className="block text-sm font-medium text-zinc-300 mb-2">
              {t('GroupHeader.typeGroupName')}
            </label>
            <input
              id="deleteConfirmName"
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-red-600 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={groupName}
              required
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
              disabled={deleteGroupMutation.isPending || deleteConfirmName !== groupName}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteGroupMutation.isPending ? t('GroupHeader.deleting') : t('GroupHeader.deleteGroup')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 