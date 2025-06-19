"use client"

import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { InputWithTooltip } from "./input-with-tooltip"
import { TextareaWithTooltip } from "./textarea-with-tooltip"
import { useCountdown } from "../hooks/use-countdown"
import { HTTPException } from "hono/http-exception"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"

interface JoinBuildingProps {
  initialInviteCode?: string
}

export const JoinBuilding = ({ initialInviteCode = "" }: JoinBuildingProps) => {
  const t = useTranslations()
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [buildingInviteCode, setBuildingInviteCode] = useState(initialInviteCode)
  const [details, setDetails] = useState("")
  const [smsCodeSent, setSmsCodeSent] = useState(false)
  const router = useRouter()
  
  const countdown = useCountdown(600) // 1 minute countdown

  const { mutate: sendSms, isPending: isSendingSms } = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const res = await client.auth.sendSmsCode.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      setSmsCodeSent(true)
      countdown.start()
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: joinBuilding, isPending: isJoining } = useMutation({
    mutationFn: async (data: { phoneNumber?: string; code?: string; name: string; buildingInviteCode: string; details?: string }) => {
      await client.auth.createResident.$post(data)
    },
    onSuccess: () => {
      router.push("/building")
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    joinBuilding({ 
      phoneNumber: phoneNumber || undefined, 
      code: code || undefined, 
      name, 
      buildingInviteCode, 
      details 
    })
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      <h2 className="text-xl font-semibold text-center text-zinc-100">{t('JoinBuilding.joinBuilding')}</h2>
      <p className="text-sm text-center text-zinc-400">{t('JoinBuilding.joinStepDescription')}</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <InputWithTooltip
          type="text"
          placeholder={t('FormFields.yourName')}
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          required
          tooltip={t('Tooltips.yourName')}
        />
        
        <InputWithTooltip
          type="text"
          placeholder={t('FormFields.buildingInviteCode')}
          value={buildingInviteCode}
          onChange={(e) => setBuildingInviteCode(e.target.value)}
          required
          tooltip={t('Tooltips.buildingInviteCode')}
        />

        <div className="space-y-2">
          <InputWithTooltip
            type="tel"
            placeholder={t('FormFields.phoneNumberOptional')}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            tooltip={t('Tooltips.phoneNumberJoin')}
          />
          
          {phoneNumber && !smsCodeSent && (
            <button
              type="button"
              onClick={() => sendSms({ phoneNumber })}
              disabled={isSendingSms}
              className="cursor-pointer w-full rounded-md text-sm ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-zinc-600 hover:ring-zinc-500 h-10 px-4 py-2 bg-transparent text-zinc-300 transition"
            >
              {isSendingSms ? t('JoinBuilding.sending') : t('JoinBuilding.sendVerificationCode')}
            </button>
          )}

          {smsCodeSent && (
            <InputWithTooltip
              type="text"
              placeholder={t('FormFields.verificationCode')}
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
              tooltip={t('Tooltips.verificationCode')}
              description={
                countdown.isActive 
                  ? t('JoinBuilding.resendCodeIn', { time: countdown.formatTime }) 
                  : countdown.isFinished 
                    ? t('JoinBuilding.canRequestNewCode') 
                    : undefined
              }
            />
          )}
        </div>

        <TextareaWithTooltip
          placeholder={t('FormFields.additionalDetailsOptional')}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          tooltip={t('Tooltips.additionalDetailsJoin')}
        />

        <button
          disabled={isJoining}
          type="submit"
          className="cursor-pointer rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
        >
          {isJoining ? t('JoinBuilding.joining') : t('JoinBuilding.joinBuilding')}
        </button>
      </form>
    </div>
  )
}
