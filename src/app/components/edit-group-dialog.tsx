'use client'

import { client } from "@/lib/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface EditGroupDialogProps {
  show: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

export const EditGroupDialog = ({ show, onClose, groupId, groupName }: EditGroupDialogProps) => {
  const t = useTranslations()
  const router = useRouter()
  const [editGroupName, setEditGroupName] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState("")
  const queryClient = useQueryClient()

  const updateGroupMutation = useMutation({
    mutationFn: async (data: { groupId: string; name: string }) => {
      const res = await client.group.updateGroup.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-group', groupId] })
      toast.success(t('Toast.groupUpdated'))
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || t('Toast.groupUpdateFailed'))
    }
  })

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
    setEditGroupName("")
    setShowDeleteConfirm(false)
    setDeleteConfirmName("")
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editGroupName.trim() && editGroupName !== groupName) {
      updateGroupMutation.mutate({ groupId, name: editGroupName.trim() })
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmName === groupName) {
      deleteGroupMutation.mutate({ groupId })
    }
  }

  useEffect(() => {
    if (show) {
      setEditGroupName(groupName)
      setShowDeleteConfirm(false)
      setDeleteConfirmName("")
    }
  }, [show, groupName])

  if (!show) return null

  const isDeleteConfirmValid = deleteConfirmName === groupName

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">
            {t('GroupHeader.editGroup')}
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
            <label htmlFor="editGroupName" className="block text-sm font-medium text-zinc-300 mb-2">
              {t('FormFields.groupName')}
            </label>
            <input
              id="editGroupName"
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
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
              disabled={updateGroupMutation.isPending || !editGroupName.trim() || editGroupName === groupName}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateGroupMutation.isPending ? t('GroupHeader.updating') : t('GroupHeader.updateGroup')}
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-700">
            <button
              type="button"
              onClick={showDeleteConfirm ? handleDeleteConfirm : handleDeleteClick}
              disabled={showDeleteConfirm ? !isDeleteConfirmValid || deleteGroupMutation.isPending : deleteGroupMutation.isPending}
              className={`w-full px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showDeleteConfirm && isDeleteConfirmValid
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-800/50 border border-red-700 hover:bg-red-700/50 hover:border-red-600 text-red-300 hover:text-red-100'
              }`}
            >
              {deleteGroupMutation.isPending 
                ? t('GroupHeader.deleting') 
                : showDeleteConfirm && isDeleteConfirmValid 
                  ? t('GroupHeader.confirm')
                  : t('GroupHeader.deleteGroup')
              }
            </button>

            {showDeleteConfirm && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-red-300">
                  This cannot be undone, enter the group name and click confirm to delete
                </p>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-red-600 rounded-md text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={groupName}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 