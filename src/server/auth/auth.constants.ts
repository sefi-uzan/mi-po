export const AUTH_CONSTANTS = {
    VERIFICATION_CODE_LENGTH: 6,
    VERIFICATION_EXPIRY_MINUTES: 10,
    COOKIE_EXPIRY_DAYS: 30,
  } as const
  
  export const AUTH_EVENTS = {
    VERIFICATION_SENT: 'auth.verification_sent',
    VERIFICATION_SUCCESS: 'auth.verification_success',
    USER_REGISTERED: 'auth.user_registered',
  } as const