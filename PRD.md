# Mi-Po (מי פה) — Product Requirements Document

> **"Who's Here"** — An emergency presence-tracking system for buildings and families during missile attacks in Israel.

---

## 1. Product Overview

Mi-Po allows apartment buildings and families to quickly coordinate during emergencies (primarily missile attacks requiring shelter). Users create or join groups, then track who is safe, who is present in the shelter, and who may need help.

### Core Value Proposition
- **During a siren:** Residents open the app and mark themselves as "present" / "safe" / "need help"
- **Group admins** see a real-time dashboard of who's accounted for
- **Neighbors** can identify who might need assistance (elderly, mobility-impaired)

---

## 2. User Roles

| Role | Permissions |
|------|-------------|
| **Admin** (group creator) | All member permissions + edit group name, delete group, invite members |
| **Member** | View group members, update own presence status, update own profile, leave group |

---

## 3. Authentication

### 3.1 Method
Phone-based SMS verification via Twilio Verify. No passwords.

### 3.2 Phone Number Normalization
All phone numbers are normalized to Israeli E.164 format (`+972XXXXXXXXX`):
- `05X-XXX-XXXX` → `+9725XXXXXXXX`
- `9725XXXXXXXX` → `+9725XXXXXXXX`
- Numbers without country code assumed Israeli
- Validation regex: `/^\+972[2-9]\d{7,8}$/`

### 3.3 Flows

#### 3.3.1 Create Account (+ optionally join a group)
1. User enters phone number
2. System sends 6-digit SMS code (10-minute expiry)
3. User enters code + display name (3–10 chars)
4. Optionally provide an invite code to auto-join a group
5. System creates user, generates JWT, sets signed HTTP-only cookie
6. Redirects to `/groups` dashboard

#### 3.3.2 Join Group (new user)
1. User arrives with invite code (from URL query param `?code=XXXXXXXXXX` or manual entry)
2. Enters phone number → receives SMS code
3. Enters code + display name + invite code + optional details
4. System creates user, joins group, generates JWT
5. Redirects to `/groups` dashboard

#### 3.3.3 Login (existing user)
1. User enters phone number
2. System sends 6-digit SMS code
3. User enters code
4. System verifies, finds existing user by phone, generates JWT
5. Redirects to `/groups` dashboard

### 3.4 Session Management
- **JWT** signed with HS256 algorithm, stored in signed HTTP-only cookie named `token`
- **Expiration:** Configurable via `JWT_EXPIRATION_TIME` env var (default: 3,600,000ms = 1 hour)
- **Cookie settings:** `httpOnly: true`, `secure: true` (production), `sameSite: lax`, `path: /`
- **No refresh token flow** implemented (despite `JWT_REFRESH_SECRET` env var existing)

### 3.5 Verification Code Resend
- 10-minute countdown timer before allowing resend
- UI shows countdown: "Resend code in {time}"
- After expiry: "You can request a new code" (clickable)

---

## 4. Groups

### 4.1 Group Types
| Type | Description | Icon |
|------|-------------|------|
| `building` | Apartment buildings, condos, residential properties | Building icon |
| `family` | Family members and close relatives | Users icon |

### 4.2 Group Creation
1. Authenticated user navigates to `/groups/create`
2. Selects group type (building or family)
3. Enters group name (1–100 chars)
4. System generates a 10-character alphanumeric invite code (`[A-Z0-9]{10}`)
5. Creator is automatically added as `admin`
6. Redirects to group dashboard

### 4.3 Invite System
- **Invite code:** 10-character uppercase alphanumeric string, unique per group
- **QR Code:** Generated client-side using `qrcode` library, encodes the join URL
- **Invite link:** `{domain}/auth/join?code={inviteCode}`
- **Sharing:** Copy-to-clipboard for both link and raw code
- Members can view invite dialog; invite code is visible to all group members

### 4.4 Joining a Group
- Via invite link (pre-fills invite code)
- Via manual code entry on join page
- Via invite code entry from the groups dashboard (join dialog)
- Duplicate membership check: prevents joining same group twice

### 4.5 Group Management (Admin only)
- **Edit group name:** Inline dialog
- **Delete group:** Requires typing group name to confirm. Cascading delete removes all members and presence data.

### 4.6 Leaving a Group (Non-admin members)
- Requires typing group name to confirm
- Warning: "You will no longer be able to access group resources and will need to be invited again."

### 4.7 Constants
```
INVITE_CODE_LENGTH: 10
MAX_GROUP_SIZE: 50 (defined but not enforced in code)
GROUP_NAME_MAX_LENGTH: 100
```

---

## 5. Presence Tracking

### 5.1 Status Values
| Status | Color | Description |
|--------|-------|-------------|
| `present` | Green (`green-500`) | Person is in the shelter / accounted for |
| `safe` | Blue (`blue-500`) | Person is safe but not physically present |
| `absent` | Red (`red-500`) | Person is not accounted for |
| `need_help` | Orange (`orange-400`) | Person needs assistance |
| `unknown` | Gray (`zinc-400`) | Default state, no update received |

### 5.2 Updating Presence
- Each user sets their own status per group
- Dropdown selector in the group page header ("My Status")
- **Upsert logic:** If no presence record exists, creates one; otherwise updates existing
- Toast notification on success/failure

### 5.3 Group Status Summary
Displayed in group header as colored stat badges:
- Total members count
- Count per status (present, safe, absent, need_help, unknown)

### 5.4 Polling
- Presence data polls every **5 seconds** (`refetchInterval: 5000`)
- Group details (members list) polls every **5 seconds**
- No WebSocket/real-time push — polling only

### 5.5 Presence Display on Member Cards
Each resident card shows:
- Colored dot indicator matching presence status
- Status text label
- Last updated timestamp (if available)

---

## 6. Member Profiles

### 6.1 User Fields
| Field | Constraints | Notes |
|-------|------------|-------|
| `phone` | varchar(20), unique, required | Normalized to +972 format |
| `displayName` | varchar(10), required, 3–10 chars | Shown on member cards |
| `isVerified` | boolean, default false | Set to true on creation |

### 6.2 Group Member Fields
| Field | Constraints | Notes |
|-------|------------|-------|
| `role` | enum: admin, member | Default: member |
| `details` | text, optional | Free-text additional info (e.g., apartment number, floor, special needs) |
| `joinedAt` | timestamp | Auto-set |

### 6.3 Editing Profile
- Members can edit their display name (3–10 chars) and details via dialog
- Display name change is global (affects all groups)
- Details field is per-group

---

## 7. Resident Card Display

Each member in the group page is shown as a card with:
- **Display name** (with "You" badge for current user)
- **Role badge:** "Group Owner" (admin who created) or "Group Admin" (admin) — zinc pill
- **Phone number** (displayed directly)
- **Verification badge:** ✓ if verified
- **Details** (if provided): additional text line
- **Presence status:** Colored dot + label
- **Joined date**

### 7.1 Card Sorting
- Current user's card appears first
- Admins appear before members
- Within same role, sorted by join date

---

## 8. Internationalization (i18n)

### 8.1 Supported Languages
| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Hebrew | `he` | RTL |

### 8.2 Implementation
- Language preference stored in `locale` cookie
- Locale selector on home page (flag icons: US flag, Israel flag)
- `next-intl` library with server-side `getRequestConfig`
- RTL detection via `rtl-detect` library
- `<html lang={locale} dir={direction}>` set dynamically
- All user-facing strings are in translation files (`locale/en.json`, `locale/he.json`)

### 8.3 Translation Namespaces
`App`, `Auth`, `TypeSelection`, `CreateUser`, `JoinGroup`, `LoginUser`, `GroupsDashboard`, `GroupCreate`, `GroupPage`, `GroupHeader`, `ResidentCard`, `InviteDialog`, `FormFields`, `Tooltips`, `Presence`, `Toast`

---

## 9. Database Schema

### 9.1 Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, auto-generated |
| `phone` | varchar(20) | NOT NULL, UNIQUE |
| `display_name` | varchar(10) | NOT NULL |
| `is_verified` | boolean | DEFAULT false |
| `created_at` | timestamp | DEFAULT now() |
| `updated_at` | timestamp | DEFAULT now() |

#### `groups`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, auto-generated |
| `name` | varchar(255) | NOT NULL |
| `type` | enum(`building`, `family`) | NOT NULL |
| `invite_code` | varchar(10) | NOT NULL, UNIQUE |
| `created_by` | uuid | FK → users.id |
| `created_at` | timestamp | DEFAULT now() |
| `updated_at` | timestamp | DEFAULT now() |

#### `group_members`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK → users.id (CASCADE DELETE) |
| `group_id` | uuid | FK → groups.id (CASCADE DELETE) |
| `role` | enum(`admin`, `member`) | DEFAULT 'member' |
| `details` | text | nullable |
| `joined_at` | timestamp | DEFAULT now() |

#### `presence`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | FK → users.id (CASCADE DELETE) |
| `group_id` | uuid | FK → groups.id (CASCADE DELETE) |
| `status` | enum(`safe`, `present`, `need_help`, `unknown`, `absent`) | DEFAULT 'unknown' |
| `last_updated` | timestamp | DEFAULT now() |

#### `nudges` (schema defined, not yet implemented in UI)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, auto-generated |
| `from_user_id` | uuid | FK → users.id |
| `to_user_id` | uuid | FK → users.id |
| `group_id` | uuid | FK → groups.id |
| `message` | text | nullable |
| `sent_at` | timestamp | DEFAULT now() |

### 9.2 Enums
- `group_type`: `building`, `family`
- `member_role`: `admin`, `member`
- `presence_status`: `safe`, `present`, `need_help`, `unknown`, `absent`

### 9.3 Cascade Behavior
- Deleting a **user** cascades to: `group_members`, `presence`
- Deleting a **group** cascades to: `group_members`, `presence`
- Nudges do **not** cascade on user/group delete

---

## 10. API Endpoints

All endpoints are under `/api` base path. Uses superjson serialization.

### 10.1 Auth Endpoints (public)
| Method | Path | Input | Description |
|--------|------|-------|-------------|
| POST | `/api/auth/sendVerificationCode` | `{ phone: string }` | Send SMS verification code |
| POST | `/api/auth/create` | `{ phone, code, displayName, inviteCode? }` | Create account (+ optionally join group) |
| POST | `/api/auth/login` | `{ phone, code }` | Login existing user |

### 10.2 Auth Endpoints (authenticated)
| Method | Path | Input | Description |
|--------|------|-------|-------------|
| GET | `/api/auth/getCurrentUser` | — | Get current user profile |
| POST | `/api/auth/updateUser` | `{ displayName }` | Update display name |

### 10.3 Group Endpoints (all authenticated)
| Method | Path | Input | Description |
|--------|------|-------|-------------|
| POST | `/api/group/createGroup` | `{ name, type }` | Create a new group |
| POST | `/api/group/joinGroup` | `{ inviteCode }` | Join group by invite code |
| GET | `/api/group/getMyGroups` | — | List user's groups with roles |
| GET | `/api/group/getCurrentGroupMember` | `{ groupId }` | Get current user's membership in group |
| POST | `/api/group/getGroupDetails` | `{ groupId }` | Get group info + members + user role |
| POST | `/api/group/updateGroup` | `{ groupId, name? }` | Update group (admin only) |
| POST | `/api/group/updateGroupMemberDetails` | `{ groupId, displayName?, details? }` | Update own member details |
| POST | `/api/group/deleteGroup` | `{ groupId }` | Delete group (admin only) |
| POST | `/api/group/leaveGroup` | `{ groupId }` | Leave group |

### 10.4 Presence Endpoints (all authenticated)
| Method | Path | Input | Description |
|--------|------|-------|-------------|
| GET | `/api/presence/getGroupPresence` | `{ groupId }` | Get all presence records for group |
| POST | `/api/presence/updatePresence` | `{ groupId, status }` | Update own presence in group |

### 10.5 Health Check
| Method | Path | Response |
|--------|------|----------|
| GET | `/api` | `{ "message": "Hello World" }` |

---

## 11. Page Routes

| Route | Auth Required | Description |
|-------|---------------|-------------|
| `/` | No | Landing page: logo, description, language selector, create/join/login buttons |
| `/auth/create` | No | Account creation flow (phone → code → name) |
| `/auth/join` | No | Join group flow (phone → code → name + invite code). Accepts `?code=` query param |
| `/auth/login` | No | Login flow (phone → code) |
| `/groups` | Yes | Dashboard listing all user's groups |
| `/groups/create` | Yes | Create new group form (type + name) |
| `/groups/[groupId]` | Yes | Group detail page with members, presence, actions |

---

## 12. UI/UX Design Specifications

### 12.1 Visual Theme
- **Background:** Dark gradient (`zinc-950` → `zinc-900` → `zinc-950`) with noise texture overlay
- **Cards/Containers:** Semi-transparent black (`bg-black/15` or `bg-zinc-800/30`) with backdrop blur
- **Text:** Light text on dark background (`zinc-100`, `zinc-300`, `zinc-400`)
- **Buttons:** Light gradient buttons (`from-zinc-300 to-zinc-200`) with ring focus states
- **Accent colors:** Status-specific (green, blue, red, orange, gray)

### 12.2 Layout
- Centered single-column layout
- Max width `sm` for auth forms, responsive for group pages
- Full-height viewport with flex centering
- Mobile-first responsive design

### 12.3 Notifications
- Toast notifications (`react-hot-toast`) at bottom-center
- Success/error messages for all mutations

### 12.4 Dialogs
Dialogs used for: invite sharing, group editing, group deletion, member detail editing, leaving group, joining group from dashboard.

All destructive actions (delete group, leave group) require typing the group name to confirm.

---

## 13. Unimplemented / Planned Features

Based on schema and code analysis:

1. **Nudges system:** Database table exists (`nudges`) but no API endpoints, service, or UI implemented. Intended to allow users to "nudge" specific members to check in.
2. **MAX_GROUP_SIZE enforcement:** Constant defined (50) but not enforced in join logic.
3. **Refresh token rotation:** `JWT_REFRESH_SECRET` env var exists but no refresh flow implemented.
4. **Admin transfer:** No way to transfer admin role or promote members.
5. **Multiple admins:** Schema supports it but only the creator gets admin role.
6. **User deletion / account management:** No endpoint or UI for deleting accounts.
7. **Password/alternative auth:** Phone-only auth with no fallback.

---

## 14. External Dependencies

| Service | Purpose | Required |
|---------|---------|----------|
| **PostgreSQL** (Neon serverless) | Primary database | Yes |
| **Twilio Verify** | SMS verification codes | Yes |
| **Cloudflare Workers** | API hosting (production) | Production only |

### 14.1 Environment Variables
```
DATABASE_URL              # PostgreSQL connection string
TWILIO_ACCOUNT_SID        # Twilio account SID
TWILIO_AUTH_TOKEN         # Twilio auth token
TWILIO_VERIFY_SERVICE_SID # Twilio Verify service SID
JWT_SECRET                # HMAC key for JWT signing + cookie signing
JWT_REFRESH_SECRET        # (unused) Reserved for refresh tokens
JWT_EXPIRATION_TIME       # JWT TTL in milliseconds (e.g., "3600000")
NEXT_PUBLIC_CF_WORKERS_URL # Production API base URL
DOMAIN                    # Cookie domain (e.g., ".yourdomain.com")
NODE_ENV                  # "production" or "development"
```

---

## 15. Security Considerations

- All auth endpoints validate phone format (Israeli E.164)
- JWT stored in signed, HTTP-only cookies (not localStorage)
- Admin-only operations checked server-side
- Group deletion cascades cleanup
- Verification codes are 6-digit, 10-minute expiry via Twilio (not custom)
- CORS enabled via jstack defaults
- Input validation via Zod schemas on all endpoints
