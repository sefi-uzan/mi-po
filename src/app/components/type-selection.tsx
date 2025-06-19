"use client"

import Link from "next/link"

export const TypeSelection = () => {
  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-4">
      <Link
        href="/auth/create"
        className="w-full rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800 cursor-pointer flex items-center justify-center"
      >
        Create a building
      </Link>

      <Link
        href="/auth/join"
        className="w-full rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800 cursor-pointer flex items-center justify-center"
      >
        Join a building
      </Link>

      <p className="text-center text-sm text-zinc-400 mt-4">
        I already have a building,{" "}
        <Link
          href="/auth/login"
          className="text-zinc-200 hover:text-white underline transition"
        >
          log in
        </Link>
        .
      </p>
    </div>
  )
}
