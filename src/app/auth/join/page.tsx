'use client'
import { JoinGroup } from "@/app/components/join-group"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const JoinGroupContent = () => {
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get('code') || ''

  return (
   <JoinGroup initialInviteCode={inviteCode} />
  )
}

const JoinGroupPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinGroupContent />
    </Suspense>
  )
}

export default JoinGroupPage