"use client"

import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { InputWithTooltip } from "./input-with-tooltip"
import { useCountdown } from "../hooks/use-countdown"
import { HTTPException } from "hono/http-exception"
import { toast } from "react-hot-toast"
import { useTranslations } from "next-intl"

export const CreateUser = () => {
  const t = useTranslations()
  const [step, setStep] = useState<'phone' | 'details'>('phone')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [displayName, setDisplayName] = useState("")
  const router = useRouter()
  
  const countdown = useCountdown(600) // 10 minute countdown

  const { mutate: sendVerificationCode, isPending: isSendingSms } = useMutation({
    mutationFn: async (data: { phone: string }) => {
      const res = await client.auth.sendVerificationCode.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      setStep('details')
      countdown.start()
      toast.success(t('Auth.verificationCodeSent', { phone: phoneNumber }))
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: createAccount, isPending: isCreating } = useMutation({
    mutationFn: async (data: { phone: string; code: string; displayName: string }) => {
      const res = await client.auth.create.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      toast.success("Account created successfully!")
      router.push("/groups/create")
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const handleResendCode = () => {
    sendVerificationCode({ phone: phoneNumber })
  }

  if (step === 'phone') {
    return (
      <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
        <h2 className="text-xl font-semibold text-center text-zinc-100">{t('Auth.stepPhone')}</h2>
        <p className="text-center text-sm text-zinc-400">{t('Auth.enterPhoneNumber')}</p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendVerificationCode({ phone: phoneNumber })
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
            {isSendingSms ? t('CreateUser.sending') : t('CreateUser.sendSmsCode')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      <h2 className="text-xl font-semibold text-center text-zinc-100">{t('Auth.stepDetails')}</h2>
      <p className="text-center text-sm text-zinc-400">{t('Auth.enterVerificationCode')}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          createAccount({ phone: phoneNumber, code, displayName })
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
              ? t('CreateUser.resendCodeIn', { time: countdown.formatTime }) 
              : countdown.isFinished 
                ? t('CreateUser.canRequestNewCode')
                : undefined
          }
        />
        {countdown.isFinished && (
          <button
            type="button"
            onClick={handleResendCode}
            className="text-sm text-zinc-200 hover:text-white underline transition"
            disabled={isSendingSms}
          >
            {isSendingSms ? t('CreateUser.sending') : "Resend code"}
          </button>
        )}
        <InputWithTooltip
          type="text"
          placeholder={t('FormFields.yourName')}
          value={displayName}
          minLength={3}
          maxLength={10}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          tooltip={t('Tooltips.yourName')}
        />
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-zinc-600 hover:ring-zinc-500 h-12 px-4 py-3 bg-transparent text-zinc-300 transition"
          >
            {t('CreateUser.back')}  
          </button>
          <button
            disabled={isCreating}
            type="submit"
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-4 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isCreating ? t('CreateUser.creating') : t('Auth.createAccount')}
          </button>
        </div>
      </form>
    </div>
  )
}
