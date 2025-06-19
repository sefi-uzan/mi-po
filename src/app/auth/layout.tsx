import type { Metadata } from "next"
import { Providers } from "../components/providers"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Mi Po",
  description: "An emergency situation building resident system",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
                <span>Mi Po</span>
              </h1>
              <p className="text-[#ececf399] text-lg/7 md:text-xl/8 text-pretty sm:text-wrap sm:text-center text-center mb-8">
                You can join a building or create a new one.
                <br />
                You can also log in to your existing building.
              </p>
              {children}
            </div>
  )
}
