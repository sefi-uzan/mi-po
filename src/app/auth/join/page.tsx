'use client'
import { JoinBuilding } from "@/app/components/join-building"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const JoinBuildingContent = () => {
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code') || ''

  return (
   <JoinBuilding initialInviteCode={inviteCode} />
  )
}

const JoinBuildingPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinBuildingContent />
    </Suspense>
  )
}

export default JoinBuildingPage