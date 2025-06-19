import type { Metadata } from "next"
import { Toaster } from "react-hot-toast"
import { Providers } from "./components/providers"
import "./globals.css"
import { getLocale } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import {getLangDir} from 'rtl-detect';
import {getTranslations} from 'next-intl/server';

const t = await getTranslations();
export const metadata: Metadata = {
  title: t('App.title'),
  description: t('App.description'),
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const direction = getLangDir(locale);
  
  return (
    <html lang={locale} dir={direction}>
      <body className="antialiased">
        <NextIntlClientProvider>
        <Providers>
          <main className="flex min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex-col items-center justify-center relative isolate">
            <div className="absolute inset-0 -z-10 opacity-50 mix-blend-soft-light bg-[url('/noise.svg')] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        
              {children}
          </main>
          <Toaster position="bottom-center" />
        </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
