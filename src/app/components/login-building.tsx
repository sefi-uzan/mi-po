"use client"

import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { InputWithTooltip } from "./input-with-tooltip"
import { useCountdown } from "../hooks/use-countdown"
import { HTTPException } from "hono/http-exception"
import { toast } from "react-hot-toast"
import {useTranslations} from 'next-intl';

export const LoginBuilding = () => {
  const t = useTranslations()
  const [loginMethod, setLoginMethod] = useState<'phone' | 'name'>('phone')
  const [step, setStep] = useState<'initial' | 'code'>('initial')
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [buildingInviteCode, setBuildingInviteCode] = useState("")
  const router = useRouter()
  
  const countdown = useCountdown(60) // 1 minute countdown

  const { mutate: sendSms, isPending: isSendingSms } = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const res = await client.auth.sendSmsCode.$post(data)
      return await res.json()
    },
    onSuccess: () => {
      setStep('code')
      countdown.start()
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: loginPhone, isPending: isLoggingInPhone } = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      await client.auth.loginPhone.$post(data)
    },
    onSuccess: () => {
      router.push("/building")
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const { mutate: loginName, isPending: isLoggingInName } = useMutation({
    mutationFn: async (data: { name: string; buildingInviteCode: string }) => {
      await client.auth.loginName.$post(data)
    },
    onSuccess: () => {
      router.push("/building")
    },
    onError: (err: HTTPException) => {
      toast.error(err.message)
    }
  })

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'initial') {
      sendSms({ phoneNumber })
    } else {
      loginPhone({ phoneNumber, code })
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginName({ name, buildingInviteCode })
  }

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      <h2 className="text-xl font-semibold text-center text-zinc-100">{t('LoginBuilding.loginToBuilding')}</h2> 
      <p className="text-sm text-center text-zinc-400">{t('LoginBuilding.description')}</p>
      
      {/* Login Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setLoginMethod('phone')
            setStep('initial')
          }}
          className={`flex-1 rounded-md text-sm py-2 px-4 transition ${
            loginMethod === 'phone'
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-transparent text-zinc-400 hover:text-zinc-300 cursor-pointer'
          }`}
        >
          {t('Auth.phoneNumber')}
        </button>
        <button
          onClick={() => {
            setLoginMethod('name')
            setStep('initial')
          }}
          className={`flex-1 rounded-md text-sm py-2 px-4 transition ${
            loginMethod === 'name'
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-transparent text-zinc-400 hover:text-zinc-300 cursor-pointer'
          }`}
        >
          {t('Auth.nameCode')}
        </button>
      </div>

      {loginMethod === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
          {step === 'initial' ? (
            <>
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
                className="rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800 cursor-pointer"
              >
                {isSendingSms ? t('LoginBuilding.sending') : t('LoginBuilding.sendSmsCode')}
              </button>
            </>
          ) : (
            <>
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
                    ? t('LoginBuilding.resendCodeIn', { time: countdown.formatTime }) 
                    : countdown.isFinished 
                      ? t('LoginBuilding.canRequestNewCode') 
                      : undefined
                }
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('initial')}
                  className="flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-zinc-600 hover:ring-zinc-500 h-12 px-4 py-3 bg-transparent text-zinc-300 transition"
                >
                  {t('LoginBuilding.back')}
                </button>
                <button
                  disabled={isLoggingInPhone}
                  type="submit"
                  className="flex-1 rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-4 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
                >
                  {isLoggingInPhone ? t('LoginBuilding.loggingIn') : t('LoginBuilding.login')}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {loginMethod === 'name' && (
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
          <InputWithTooltip
            type="text"
            placeholder={t('FormFields.yourName')}
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            required
            tooltip={t('Tooltips.yourNameLogin')}
          />
          
          <InputWithTooltip
            type="text"
            placeholder={t('FormFields.buildingInviteCode')}
            value={buildingInviteCode}
            onChange={(e) => setBuildingInviteCode(e.target.value)}
            required
            tooltip={t('Tooltips.buildingInviteCodeLogin')}
          />

          <button
            disabled={isLoggingInName}
            type="submit"
            className="rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
          >
            {isLoggingInName ? t('LoginBuilding.loggingIn') : t('LoginBuilding.login')}
          </button>
        </form>
      )}
    </div>
  )
} 