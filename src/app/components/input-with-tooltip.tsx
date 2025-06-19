"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface InputWithTooltipProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tooltip?: string
  description?: string
}

export const InputWithTooltip = ({ tooltip, description, className, ...props }: InputWithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div>
    <div className="relative">
      <input
        {...props}
        className={cn(
          "w-full text-base/6 rounded-md bg-black/50 hover:bg-black/75 focus-visible:outline-none ring-2 ring-transparent hover:ring-zinc-800 focus:ring-zinc-800 focus:bg-black/75 transition h-12 px-4 py-2 text-zinc-100",
          tooltip && "pr-12", // Add padding for icon when tooltip exists
          className
        )}
      />
      
      {tooltip && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <div className="w-5 h-5 rounded-full bg-zinc-600 hover:bg-zinc-500 transition cursor-help flex items-center justify-center">
              <span className="text-xs text-zinc-200 font-medium">?</span>
            </div>
            
            {showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-zinc-800 text-zinc-100 text-sm rounded-md shadow-lg border border-zinc-700 z-10">
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-800"></div>
                {tooltip}
              </div>
            )}
          </div>
        </div>
      )}
      
      
    </div>
    {description && (
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
      )}
    </div>
  )
} 