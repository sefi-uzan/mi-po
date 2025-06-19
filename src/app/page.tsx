import { cn } from "@/lib/utils"
import { TypeSelection } from "./components/type-selection"
import { LocaleSelector } from "./components/locale-selector"
import Image from "next/image"
import {getTranslations, getLocale} from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('App');
  const locale = await getLocale();
    return (    
    <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
    <h1
      className={cn(
        "inline-flex tracking-tight flex-col gap-1 transition text-center",
        "font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-none lg:text-[4rem]",
        "bg-gradient-to-r from-20% bg-clip-text text-transparent",
        "from-white to-gray-50"
      )}
    >
      <Image src="/logo.png" alt={t('title')} width={100} height={100} />
      <span className="text-2xl font-bold">{t('title')}</span>
    </h1>

    <p className="text-[#ececf399] text-lg/7 md:text-xl/8 text-pretty sm:text-wrap sm:text-center text-center mb-8">
      {t('description')}
    </p>
    
    <LocaleSelector initialLocale={locale} />
    
    <TypeSelection />
    </div>
)
}
