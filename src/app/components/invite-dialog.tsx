'use client'
import { toast } from "react-hot-toast"
import Image from "next/image"

interface InviteDialogProps {
  show: boolean
  onClose: () => void
  inviteCode: string
  qrCodeDataUrl: string
}

export const InviteDialog = ({ show, onClose, inviteCode, qrCodeDataUrl }: InviteDialogProps) => {
  const copyInviteLink = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteLink = `${siteUrl}/auth/join?code=${inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    toast.success("Invite code copied to clipboard!")
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md backdrop-blur-lg bg-black/90 px-8 py-6 rounded-md text-zinc-100/75 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-zinc-100">Invite to Building</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 text-2xl"
          >
            ×
          </button>
        </div>

        {qrCodeDataUrl && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-md">
              <Image src={qrCodeDataUrl} alt="QR Code" height={200} width={200} />
            </div>
            <p className="text-sm text-zinc-400 text-center">
              Scan this QR code to join the building
            </p>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Invite Link:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/join?code=${inviteCode}`}
              readOnly
              className="flex-1 text-sm rounded-md bg-black/50 ring-2 ring-zinc-700 focus:ring-zinc-600 h-10 px-3 py-2 text-zinc-100"
            />
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-md text-sm transition"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Invite Code:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              readOnly
              className="flex-1 text-sm rounded-md bg-black/50 ring-2 ring-zinc-700 focus:ring-zinc-600 h-10 px-3 py-2 text-zinc-100 font-mono"
            />
            <button
              onClick={copyInviteCode}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-md text-sm transition"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Share this code for manual entry on the join page
          </p>
        </div>
      </div>
    </div>
  )
} 