# Mi-Po

A building and family management system for emergency situations in Israel.

## What it does

During missile attacks when everyone needs to get to shelters, Mi-Po helps you keep track of who's safe and who might need help. It's designed for apartment buildings and families to quickly coordinate during emergencies.

Key features:
- Check if everyone in your building made it to the shelter
- Track last known location of residents if a building is hit
- Request assistance from neighbors if you have mobility issues or need help
- Manage multiple groups (buildings or families)

## Self-hosting

You'll need:
- A PostgreSQL database (I use neon.tech)
- A Twilio account for SMS verification
- Cloudflare Workers if you want to deploy the backend there

Create a `.env` file with these variables:

```bash
DATABASE_URL="postgresql://..."

TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_VERIFY_SERVICE_SID="your_verify_sid"

JWT_SECRET="random_secret_string"
JWT_REFRESH_SECRET="another_random_secret"
JWT_EXPIRATION_TIME="3600000"

NEXT_PUBLIC_CF_WORKERS_URL="https://api.yourdomain.com/"
DOMAIN=".yourdomain.com"
```

Then run the usual:
```bash
yarn install
yarn dev
```