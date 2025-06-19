'use client'
import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import QRCode from "qrcode"
import { toast } from "react-hot-toast"
import Image from "next/image"

const BuildingPage = () => {
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")

    const { data: building, isPending: isLoadingBuilding } = useQuery({
        queryKey: ["get-building"],
        queryFn: async () => {
            const res = await client.building.getBuilding.$get()
            return await res.json()
        }
    })

    const generateQRCode = async (inviteCode: string) => {
        try {
            const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const inviteLink = `${siteUrl}/auth/join?code=${inviteCode}`
            const qrDataUrl = await QRCode.toDataURL(inviteLink, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            })
            setQrCodeDataUrl(qrDataUrl)
        } catch (error) {
            console.error('Failed to generate QR code:', error)
        }
    }

    const handleInviteClick = () => {
        if (building?.inviteCode) {
            generateQRCode(building.inviteCode)
        }
        setShowInviteDialog(true)
    }

    const copyInviteLink = () => {
        if (building?.inviteCode) {
            const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
            const inviteLink = `${siteUrl}/auth/join?code=${building.inviteCode}`
            navigator.clipboard.writeText(inviteLink)
            toast.success("Invite link copied to clipboard!")
        }
    }

    const copyInviteCode = () => {
        if (building?.inviteCode) {
            navigator.clipboard.writeText(building.inviteCode)
            toast.success("Invite code copied to clipboard!")
        }
    }

    if (isLoadingBuilding || !building) {
        return (
            <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
                <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75">
                    <p className="text-center">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-6">
                {/* Building Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">{building.name}</h1>
                        <p className="text-sm text-zinc-400">
                            Created {new Date(building.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <button
                        onClick={handleInviteClick}
                        className="rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-6 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
                    >
                        Invite
                    </button>
                </div>

                {/* Residents List */}
                <div>
                    <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                        Residents ({building.residents?.length || 0})
                    </h2>
                    
                    {building.residents && building.residents.length > 0 ? (
                        <div className="space-y-3">
                            {building.residents.map((resident) => (
                                <div
                                    key={resident.id}
                                    className="flex items-start justify-between p-4 bg-black/25 rounded-md border border-zinc-700/50"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-zinc-100">
                                                {resident.displayName}
                                            </h3>
                                            {resident.type === 'owner' && (
                                                <span className="text-yellow-400 text-lg" title="Building Owner">
                                                    👑
                                                </span>
                                            )}
                                        </div>
                                        
                                        {resident.phoneNumber && (
                                            <p className="text-sm text-zinc-400 mt-1">
                                                📞 {resident.phoneNumber}
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
                                    </div>
                                    
                                    <div className="text-xs text-zinc-500">
                                        Joined {new Date(resident.joinedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center py-8">
                            No residents found. Invite people to join your building!
                        </p>
                    )}
                </div>
            </div>

            {/* Invite Dialog */}
            {showInviteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-md backdrop-blur-lg bg-black/90 px-8 py-6 rounded-md text-zinc-100/75 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-zinc-100">Invite to Building</h3>
                            <button
                                onClick={() => setShowInviteDialog(false)}
                                className="text-zinc-400 hover:text-zinc-100 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* QR Code */}
                        {qrCodeDataUrl && (
                            <div className="flex flex-col items-center space-y-4">
                                <div className="bg-white p-4 rounded-md">
                                    <Image src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
                                </div>
                                <p className="text-sm text-zinc-400 text-center">
                                    Scan this QR code to join the building
                                </p>
                            </div>
                        )}

                        {/* Invite Link */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-300">Invite Link:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/join?code=${building.inviteCode}`}
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

                        {/* Invite Code */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-300">Invite Code:</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={building.inviteCode}
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
            )}
        </div>
    )
}

export default BuildingPage