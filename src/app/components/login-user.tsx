"use client"

import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { InputWithTooltip } from "./input-with-tooltip"
import { useCountdown } from "../hooks/use-countdown"
import { HTTPException } from "hono/http-exception"
import { toast } from "react-hot-toast"
import { useTranslations } from 'next-intl'

export const LoginUser = () => {
  const t = useTranslations()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const router = useRouter()
  
  const countdown = useCountdown(600) // 10 minute countdown

  const { mutate: sendVerificationCode, isPending: isSendingSms } = useMutation({
    mutationFn: async (data: { phone: string }) => {
      const res = await client.auth.sendVerificationCode.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      setStep('code')
      countdown.start()
      toast.success(t('Auth.verificationCodeSent', { phone: phoneNumber }))
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: loginAccount, isPending: isLoggingIn } = useMutation({
    mutationFn: async (data: { phone: string; code: string }) => {
      const res = await client.auth.login.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      toast.success("Logged in successfully!")
      router.push("/groups")
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
            tooltip={t('Tooltips.phoneNumberLogin')}
          />
          <button
            disabled={isSendingSms}
            type="submit"
            className="cursor-pointer rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isSendingSms ? t('LoginUser.sending') : t('LoginUser.sendSmsCode')}
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
          loginAccount({ phone: phoneNumber, code })
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
          tooltip={t('Tooltips.verificationCodeLogin')}
          description={
            countdown.isActive 
              ? t('LoginUser.resendCodeIn', { time: countdown.formatTime }) 
              : countdown.isFinished 
                ? t('LoginUser.canRequestNewCode')
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
            {isSendingSms ? t('LoginUser.sending') : "Resend code"}
          </button>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-zinc-600 hover:ring-zinc-500 h-12 px-4 py-3 bg-transparent text-zinc-300 transition"
          >
            {t('LoginUser.back')}  
          </button>
          <button
            disabled={isLoggingIn}
            type="submit"
            className="cursor-pointer flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-4 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isLoggingIn ? t('LoginUser.loggingIn') : t('Auth.loginToAccount')}
          </button>
        </div>
      </form>
    </div>
  )
} 