import { cn } from "@/lib/utils"
import { TypeSelection } from "./components/type-selection"

export default async function Home() {
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
      An emergency situation building resident system
    </p>
    <TypeSelection />
    </div>
)
}
