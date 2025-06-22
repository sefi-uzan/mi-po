'use client'
import { client } from "@/lib/client"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { LocaleSelector } from "../../components/locale-selector"
import { useLocale } from "next-intl"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Building, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"

const GroupCreate = () => {
    const t = useTranslations()
    const locale = useLocale()
    const router = useRouter()
    const [groupType, setGroupType] = useState<'building' | 'family' | ''>('')
    const [groupName, setGroupName] = useState('')

    const createGroupMutation = useMutation({
        mutationFn: async () => {
            if (!groupType || !groupName.trim()) {
                throw new Error('Missing required fields')
            }

            const payload = {
                name: groupName.trim(),
                type: groupType
            }

            const res = await client.group.createGroup.$post(payload)
            return await res.json()
        },
        onSuccess: (data) => {
            toast.success(t('Toast.groupCreated'))
            if (data.group?.id) {
                router.push(`/groups/group/${data.group.id}`)
            } else {
                router.push('/groups')
            }
        },
        onError: (error) => {
            toast.error(error.message || t('Toast.groupCreateFailed'))
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createGroupMutation.mutate()
    }

    const isFormValid = groupType && groupName.trim()

    return (
        <div className="container flex flex-col items-center justify-center gap-6">
            <LocaleSelector initialLocale={locale} />
            <div className="w-full max-w-lg backdrop-blur-lg bg-black/15 px-6 py-6 rounded-md text-zinc-100/75">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href="/groups"
                        className="p-2 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100">{t('GroupCreate.title')}</h1>
                        <p className="text-sm text-zinc-400">{t('GroupCreate.description')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                            {t('GroupCreate.groupType')}
                        </label>
                        <p className="text-xs text-zinc-400 mb-4">
                            {t('GroupCreate.selectGroupType')}
                        </p>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => setGroupType('building')}
                                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                                    groupType === 'building'
                                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-100'
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-600'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Building className="w-5 h-5 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">{t('GroupCreate.buildingType')}</h3>
                                        <p className="text-sm opacity-75">{t('GroupCreate.buildingDescription')}</p>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGroupType('family')}
                                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                                    groupType === 'family'
                                        ? 'bg-green-600/20 border-green-500/50 text-green-100'
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800/70 hover:border-zinc-600'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Users className="w-5 h-5 mt-0.5" />
                                    <div>
                                        <h3 className="font-medium">{t('GroupCreate.familyType')}</h3>
                                        <p className="text-sm opacity-75">{t('GroupCreate.familyDescription')}</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {groupType && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                {t('GroupCreate.groupName')}
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder={t('GroupCreate.groupNamePlaceholder')}
                                maxLength={100}
                                className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                        <Link
                            href="/groups"
                            className="flex-1 px-4 py-2 rounded-md bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800/70 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 transition-all duration-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        >
                            {t('GroupCreate.back')}
                        </Link>
                        <button
                            type="submit"
                            disabled={!isFormValid || createGroupMutation.isPending}
                            className="flex-1 px-4 py-2 rounded-md bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-500/50 text-blue-300 hover:text-blue-100 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createGroupMutation.isPending ? t('GroupCreate.creating') : t('GroupCreate.createGroup')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default GroupCreate 