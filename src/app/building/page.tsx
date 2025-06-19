'use client'
import { BuildingHeader } from "@/app/components/building-header"
import { InviteDialog } from "@/app/components/invite-dialog"
import { ResidentCard } from "@/app/components/resident-card"
import { client } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import QRCode from "qrcode"
import { useState } from "react"
import { toast } from "react-hot-toast"

const BuildingPage = () => {
    const [showInviteDialog, setShowInviteDialog] = useState(false)
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
    const [currentUserId, setCurrentUserId] = useState<string>("")
    const queryClient = useQueryClient()

    const { data: building, isPending: isLoadingBuilding } = useQuery({
        queryKey: ["get-building"],
        queryFn: async () => {
            const res = await client.building.getBuilding.$get()
            const data = await res.json()
            setCurrentUserId(data.currentUserId)
            return data
        }
    })

    const { data: presenceData } = useQuery({
        queryKey: ["check-presence"],
        queryFn: async () => {
            const res = await client.building.checkPresence.$get()
            const data = await res.json()
            return data.reduce((acc: Record<string, boolean>, item: { residentId: string; isPresent: boolean }) => {
                acc[item.residentId] = item.isPresent
                return acc
            }, {})
        },
        refetchInterval: 5000,
        enabled: !!building
    })

    const togglePresenceMutation = useMutation({
        mutationFn: async () => {
            const res = await client.building.togglePresence.$post()
            return await res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["check-presence"] })
            toast.success("Presence status updated!")
        },
        onError: () => {
            toast.error("Failed to update presence status")
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

    const handleTogglePresence = () => {
        togglePresenceMutation.mutate()
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
                <BuildingHeader 
                    building={building}
                    onInviteClick={handleInviteClick}
                    presenceData={presenceData}
                />

                <div>
                    <h2 className="text-xl font-semibold text-zinc-100 mb-4">
                        Residents ({building.residents?.length || 0})
                    </h2>
                    
                    {building.residents && building.residents.length > 0 ? (
                        <div className="space-y-3">
                            {building.residents.map((resident) => (
                                <ResidentCard
                                    key={resident.id}
                                    resident={resident}
                                    currentUserId={currentUserId}
                                    presenceData={presenceData}
                                    onTogglePresence={resident.id === currentUserId ? handleTogglePresence : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-400 text-center py-8">
                            No residents found. Invite people to join your building!
                        </p>
                    )}
                </div>
            </div>

            <InviteDialog
                show={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                inviteCode={building.inviteCode || ""}
                qrCodeDataUrl={qrCodeDataUrl}
            />
        </div>
    )
}

export default BuildingPage