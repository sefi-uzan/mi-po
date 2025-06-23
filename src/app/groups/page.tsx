'use client'
import { client } from "@/lib/client"
import { useQuery } from "@tanstack/react-query"
import { Building, Crown, User, Users } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { LocaleSelector } from "../components/locale-selector"
import { JoinGroupDialog } from "../components/join-group-dialog"
import { useState } from "react"

const GroupsDashboard = () => {
    const t = useTranslations()
    const locale = useLocale()
    const [showJoinDialog, setShowJoinDialog] = useState(false)

    const { data: groups, isPending: isLoadingGroups } = useQuery({
        queryKey: ["get-my-groups"],
        queryFn: async () => {
            const res = await client.group.getMyGroups.$get()
            const data = await res.json()
            return data.groups || []
        }
    })

    if (isLoadingGroups) {
        return (
            <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
                <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75">
                    <p className="text-center">{t('GroupsDashboard.loading')}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
            <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-zinc-100">
                    {t('GroupsDashboard.title')}
                </h1>
                <LocaleSelector initialLocale={locale} />
            </div>

            <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75">
                                 {!groups || groups.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="mb-4">
                            <Users className="mx-auto h-12 w-12 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-200 mb-2">
                            {t('GroupsDashboard.noGroupsTitle')}
                        </h3>
                        <p className="text-zinc-400 mb-6">
                            {t('GroupsDashboard.noGroupsDescription')}
                        </p>
                        <div className="flex items-center gap-2 justify-center">
                                <button
                                    onClick={() => setShowJoinDialog(true)}
                                    className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    {t('GroupsDashboard.joinGroup')}
                                </button>
                                <Link
                                    href={`/groups/create`}
                                    className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {t('GroupsDashboard.createGroup')}
                                </Link>
                            </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-zinc-200">
                                {t('GroupsDashboard.yourGroups')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowJoinDialog(true)}
                                    className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    {t('GroupsDashboard.joinGroup')}
                                </button>
                                <Link
                                    href={`/groups/create`}
                                    className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {t('GroupsDashboard.createGroup')}
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <Link
                                    key={group.group.id}
                                    href={`/groups/${group.group.id}`}
                                    className="block p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors border border-zinc-700"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            {group.group.type === 'building' ? (
                                                <Building className="h-5 w-5 text-blue-400" />
                                            ) : (
                                                <Users className="h-5 w-5 text-green-400" />
                                            )}
                                            <h3 className="font-medium text-zinc-200">
                                                {group.group.name}
                                            </h3>
                                        </div>
                                        {group.role === 'admin' && (
                                            <Crown className="h-4 w-4 text-yellow-400" />
                                        )}
                                    </div>

                                  

                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="capitalize">
                                            {group.group.type}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {group.role === 'admin' ? t('GroupsDashboard.admin') : t('GroupsDashboard.member')}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <JoinGroupDialog
                show={showJoinDialog}
                onClose={() => setShowJoinDialog(false)}
            />
        </div>
    )
}

export default GroupsDashboard 