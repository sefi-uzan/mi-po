import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { GroupPageClient } from "@/app/components/group-page-client"
import { LocaleSelector } from "@/app/components/locale-selector"
import { getLocale, getTranslations } from "next-intl/server"



const GroupPage = async ({ params }: {params: Promise<{groupId: string}>}) => {
  const { groupId } = await params
  const locale = await getLocale()
  const t = await getTranslations()

  if (!groupId) {
    return (
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <div className="w-full max-w-4xl backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75">
          <p className="text-center text-red-400">{t('GroupPage.groupNotFound')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-6">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <Link
          href="/groups"
          className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('GroupPage.backToGroups')}
        </Link>
        <LocaleSelector initialLocale={locale} />
      </div>
      <GroupPageClient />
    </div>
  )
}

export default GroupPage 