'use client'
import { JoinBuilding } from "@/app/components/join-building"
import { useSearchParams } from "next/navigation"

const JoinBuildingPage = () => {
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code') || ''

  return (
   <JoinBuilding initialInviteCode={inviteCode} />
  )
}

export default JoinBuildingPage