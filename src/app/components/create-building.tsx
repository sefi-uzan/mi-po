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

export const CreateBuilding = () => {
  const t = useTranslations()
  const [step, setStep] = useState<'phone' | 'create'>('phone')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [buildingName, setBuildingName] = useState("")
  const [details, setDetails] = useState("")
  const router = useRouter()
  
  const countdown = useCountdown(60) // 1 minute countdown

  const { mutate: sendSms, isPending: isSendingSms } = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const res = await client.auth.sendSmsCode.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      setStep('create')
      countdown.start() // Start countdown when SMS is sent
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: createBuilding, isPending: isCreating } = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string; name: string; buildingName: string; details?: string }) => {
      await client.auth.createOwner.$post(data)
    },
    onSuccess: () => {
      router.push("/building")
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  if (step === 'phone') {
    return (
      <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
        <h2 className="text-xl font-semibold text-center text-zinc-100">{t('CreateBuilding.createBuilding')}</h2>
        <p className="text-sm text-center text-zinc-400">{t('CreateBuilding.createStepDescription')}</p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendSms({ phoneNumber })
          }}
          className="flex flex-col gap-4"
        >
          <InputWithTooltip
            type="tel"
            placeholder={t('FormFields.phoneNumber')}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            tooltip={t('Tooltips.phoneNumberCreate')}
          />
          <button
            disabled={isSendingSms}
            type="submit"
            className="cursor-pointer rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isSendingSms ? t('CreateBuilding.sending') : t('CreateBuilding.sendSmsCode')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      <h2 className="text-xl font-semibold text-center text-zinc-100">{t('CreateBuilding.createBuilding')}</h2>
      <p className="text-sm text-center text-zinc-400">{t('CreateBuilding.createStepDescription')}</p>
      
      <form
        onSubmit={(e) => {
          e.preventDefault()
          createBuilding({ phoneNumber, code, name, buildingName, details })
        }}
        className="flex flex-col gap-4"
      >
        <InputWithTooltip
          type="text"
          placeholder={t('FormFields.verificationCode')}
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value)}
          required
          tooltip={t('Tooltips.verificationCode')}
          description={
            countdown.isActive 
              ? t('CreateBuilding.resendCodeIn', { time: countdown.formatTime }) 
              : countdown.isFinished 
                ? t('CreateBuilding.canRequestNewCode') 
                : undefined
          }
        />
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
          placeholder={t('FormFields.buildingName')}
          value={buildingName}
          maxLength={20}
          onChange={(e) => setBuildingName(e.target.value)}
          required
          tooltip={t('Tooltips.buildingName')}
        />
        <TextareaWithTooltip
          placeholder={t('FormFields.additionalDetailsOptional')}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          tooltip={t('Tooltips.additionalDetailsJoin')}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-zinc-600 hover:ring-zinc-500 h-12 px-4 py-3 bg-transparent text-zinc-300 transition"
          >
            {t('CreateBuilding.back')}  
          </button>
          <button
            disabled={isCreating}
            type="submit"
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-4 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isCreating ? t('CreateBuilding.creating') : t('CreateBuilding.createBuilding')}
          </button>
        </div>
      </form>
    </div>
  )
}
