import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePhoneNumber(phoneNumber: string): string | null {
  // Remove all non-digit characters except the leading +
  let normalized = phoneNumber.replace(/[^\d+]/g, '')
  
  // Handle Israeli phone numbers
  if (normalized.startsWith('0')) {
    // Convert local Israeli format (0XX-XXX-XXXX) to international (+972XX-XXX-XXXX)
    normalized = '+972' + normalized.substring(1)
  } else if (normalized.startsWith('972')) {
    // Add + if missing
    normalized = '+' + normalized
  } else if (!normalized.startsWith('+972')) {
    // Assume it's Israeli if no country code
    normalized = '+972' + normalized
  }

  const israelE164Regex = /^\+972[2-9]\d{7,8}$/
    
  return israelE164Regex.test(normalized) ? normalized : null
}
