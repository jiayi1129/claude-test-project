# Product Requirements Document
# FitBook — Fitness Studio Booking & Management Platform
### For Pilates & Yoga Studios

**Version:** 1.0
**Date:** 2026-03-27
**Research Sources:** Mindbody, Glofox, Momence, Hapana

---

## Overview

FitBook is a full-stack booking and studio management platform designed specifically for pilates and yoga studios. It enables studio owners to manage classes, memberships, staff, and payments while giving members a seamless self-service booking experience.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Google + email/password)
- **Payments:** Stripe (subscriptions, one-time, POS)
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend
- **SMS:** Twilio
- **Deployment:** Vercel + Supabase (or Railway)

## User Roles

| Role | Description |
|---|---|
| **Studio Owner / Admin** | Full access to all settings, reports, staff, billing |
| **Instructor / Staff** | Manages own schedule, views rosters, checks in members |
| **Front Desk** | Books/cancels for members, processes payments, handles check-ins |
| **Member** | Books classes, manages membership, views history |

---

## Feature 1: Class Scheduling & Booking

### Overview
The core scheduling engine lets studios create, manage, and publish class schedules. Members book in real time through a web interface or mobile-optimized app.

### User Stories

**As a studio admin, I want to:**
- Create one-off and recurring classes (daily/weekly/custom cadence)
- Set class capacity (total spots + online booking cap separately)
- Assign instructors, rooms, and equipment to each class
- Edit or cancel a single occurrence or all future occurrences of a recurring series
- Quickly substitute an instructor without rebuilding the class
- Configure booking and cancellation windows (e.g., "members can book up to 7 days in advance, cancel up to 2 hours before")
- Set late-cancel and no-show fees
- Create virtual/livestream classes with auto-delivered Zoom links

**As a member, I want to:**
- Browse classes by date, instructor, class type, or location
- Book a class in 2 clicks
- Choose my spot in the room (spot/mat reservation) for studios with fixed layouts
- Cancel a booking and receive credit back if within the cancellation window
- View my upcoming and past bookings in my account
- Book on behalf of a guest

### Data Model
```
Studio
  - id, name, timezone, logo, address, settings

ClassTemplate (recurring series)
  - id, studioId, name, description, classType (yoga/pilates/etc)
  - instructorId, roomId, durationMinutes
  - capacity, onlineCapacity
  - recurrenceRule (RRULE string)
  - bookingWindowDays, cancelWindowHours
  - lateCancelFee, noShowFee
  - virtualLink, isVirtual

ClassSession (individual occurrence)
  - id, templateId, startAt, endAt
  - instructorId (override)
  - capacity (override), onlineCapacity (override)
  - status (scheduled | cancelled | completed)
  - spotsLayout (JSON for Pick-a-Spot)

Booking
  - id, sessionId, memberId
  - status (booked | waitlisted | cancelled | late_cancelled | no_show | checked_in)
  - spotId (nullable, for spot reservation)
  - bookedAt, cancelledAt, checkedInAt
  - creditsUsed, amountCharged
  - bookingSource (web | app | front_desk | walk_in)
```

### Acceptance Criteria
- [ ] Studio can create a recurring class series (e.g., "Monday Vinyasa, 7am, every week")
- [ ] Each occurrence appears independently in the schedule view
- [ ] Editing one occurrence does not affect others unless "edit all future" is selected
- [ ] Booking reduces available spots in real time
- [ ] Members cannot book past the booking window or after class starts
- [ ] Cancellation within the window restores the credit; outside the window applies the late-cancel fee
- [ ] Spot selection UI renders the room layout and greys out taken spots
- [ ] Instructor substitution updates all future occurrences in a series or just one

---

## Feature 2: Member Management

### Overview
A centralized member database with profiles, waivers, booking history, payment records, and communication tools.

### User Stories

**As a studio admin, I want to:**
- View a member's full profile: contact info, membership status, visit history, payment history, signed waivers, and notes
- Add internal notes to member profiles (visible to staff, not members)
- Create custom intake forms and attach them to new member sign-ups
- Require members to sign a digital liability waiver before their first class
- Segment members by status (active, lapsed, new) for targeted outreach
- Tag members (e.g., "VIP", "corporate plan", "referred by X")

**As a member, I want to:**
- Create an account with email/password or Google sign-in
- Complete my profile with emergency contact, health notes, photo
- Sign waivers digitally during onboarding (with timestamp + IP logging)
- View my full booking history and credit balance
- Refer a friend and track referral rewards
- Manage my notification preferences

### Data Model
```
User
  - id, email, name, phone, avatar
  - role (admin | instructor | front_desk | member)
  - studioId (for staff), createdAt

MemberProfile
  - userId, studioId
  - emergencyContact, healthNotes
  - referralCode, referredBy
  - tags (string[])
  - marketingOptIn

Waiver
  - id, studioId, title, content, version, isActive

WaiverSignature
  - id, waiverId, userId
  - signedAt, ipAddress, signatureData

IntakeForm
  - id, studioId, fields (JSON schema)

IntakeResponse
  - id, formId, userId, responses (JSON), submittedAt

Note (staff notes on member)
  - id, memberId, authorId, content, createdAt
```

### Acceptance Criteria
- [ ] New member sign-up flow: account creation → intake form → waiver signature → first booking
- [ ] Waiver signature stored with timestamp and IP; displayed in admin member profile
- [ ] Member list filterable by: membership status, visit count, join date, tag
- [ ] Credit balance visible on member profile and dashboard
- [ ] Referral link generated per member; referral tracked when referred member completes first class

---

## Feature 3: Memberships, Packs & Payments

### Overview
Flexible pricing engine supporting unlimited memberships, class packs, drop-ins, and intro offers. All payments processed via Stripe.

### User Stories

**As a studio admin, I want to:**
- Create membership plans (e.g., "Unlimited Monthly - $149/mo", "8-Class Pack - $120")
- Set access rules per plan (e.g., certain class types, booking priority)
- Create intro offers (e.g., "First month $49")
- Pause or cancel a member's membership from the admin panel
- Process payments manually at the front desk (POS)
- Issue refunds and credits
- Configure auto-pay retry logic for failed payments
- View all outstanding invoices and payment history

**As a member, I want to:**
- Browse and purchase memberships or class packs online
- Pay with credit card, Apple Pay, or Google Pay
- See my remaining credits and membership renewal date
- Update my payment method
- Pause my membership for up to 4 weeks per year

### Pricing Types
| Type | Description |
|---|---|
| Unlimited Membership | Recurring subscription, books any class |
| Class Pack | Fixed number of credits, expire after N days |
| Drop-In | Single class purchase |
| Intro Offer | One-time discounted first purchase (e.g., 2 weeks unlimited for $29) |
| Trial Class | Free or paid single trial session |

### Data Model
```
MembershipPlan
  - id, studioId, name, description
  - type (unlimited | pack | drop_in | intro | trial)
  - price, billingCycle (monthly | weekly | annual | once)
  - creditCount (for packs), creditExpireDays
  - allowedClassTypes (null = all)
  - bookingPriorityDays (early access window)
  - isActive, isIntroOffer, maxPurchasesPerMember

MemberMembership
  - id, memberId, planId
  - status (active | paused | cancelled | expired)
  - startDate, endDate, nextBillingDate
  - creditsRemaining, creditsTotal
  - stripeSubscriptionId, stripeCustomerId
  - pausedUntil

Payment
  - id, memberId, amount, currency
  - type (membership | pack | drop_in | manual | refund)
  - status (paid | pending | failed | refunded)
  - stripePaymentIntentId, stripeInvoiceId
  - description, createdAt

CreditLedger
  - id, memberId, delta (positive=credit, negative=debit)
  - reason (purchase | booking | cancellation | refund | admin_adjustment)
  - relatedId (bookingId or paymentId)
  - createdAt, expiresAt
```

### Stripe Integration
- Subscriptions for recurring memberships (webhook-driven state machine)
- PaymentIntents for class packs and drop-ins
- Customer portal for members to manage billing themselves
- Webhooks: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Failed payment retry: 3 attempts over 7 days, then membership paused

### Acceptance Criteria
- [ ] Admin can create and publish a membership plan in < 2 minutes
- [ ] Member can purchase a plan and immediately receive credits
- [ ] Stripe subscription created on plan purchase; credits auto-renewed on billing date
- [ ] Late cancel / no-show fees charged to card on file automatically
- [ ] Membership can be paused via admin panel; billing pauses in Stripe
- [ ] POS flow: staff selects member, selects plan or drop-in, processes card on file or new card
- [ ] Credit ledger shows full audit trail of every debit and credit

---

## Feature 4: Waitlist Management

### Overview
Automatic waitlist handles full classes gracefully, converting waitlisted members to confirmed bookings when spots open up.

### User Stories

**As a studio admin, I want to:**
- Configure waitlist behaviour per class (enabled/disabled, max waitlist size)
- Choose waitlist mode: Auto-Add (first in line gets the spot automatically) or First-to-Claim (notify all, first to respond gets it)
- View the waitlist for any class
- Manually move a member from waitlist to confirmed (and vice versa)
- Set a deadline for waitlist conversions (e.g., no auto-adds within 30 minutes of class)

**As a member, I want to:**
- Be automatically added to the waitlist when a class is full
- Receive an immediate notification when a spot opens and I'm moved off the waitlist
- Know my position on the waitlist
- Leave the waitlist without penalty (if outside the cancellation window)

### Logic (Auto-Add Mode)
```
When a booking is cancelled:
  1. Find the class session
  2. If spots available AND session hasn't started:
     a. Get first waitlisted booking (ordered by bookedAt)
     b. Attempt to deduct credit from member
     c. If successful: move booking to "booked", send confirmation notification
     d. If failed (no credit): skip to next member, notify skipped member
  3. Repeat until spot is filled or waitlist exhausted
```

### Data Model
```
(Waitlist is modelled via Booking.status = 'waitlisted')

WaitlistConfig (per ClassTemplate)
  - enabled, mode (auto_add | first_to_claim)
  - maxWaitlistSize
  - cutoffMinutesBeforeClass

WaitlistNotification
  - bookingId, sentAt, expiresAt (for first-to-claim)
  - claimed (bool)
```

### Acceptance Criteria
- [ ] Class shows "Join Waitlist" button when at capacity
- [ ] Waitlist position displayed to member in their bookings view
- [ ] On cancellation, system automatically promotes next member (Auto-Add mode) within 60 seconds
- [ ] Promoted member receives email + SMS notification with confirmation
- [ ] If member on waitlist has no valid credit/payment, they are skipped and notified
- [ ] No auto-adds occur within the configured cutoff window before class

---

## Feature 5: Check-In System

### Overview
Multiple check-in methods for member arrival tracking. Attendance data feeds directly into reporting.

### User Stories

**As a studio admin/staff, I want to:**
- Check in members manually from the class roster view
- See a live view of who has checked in vs. who is booked
- Mark members as no-show after class ends (triggers no-show fee if applicable)

**As a member, I want to:**
- Check in by scanning a QR code at the studio entrance
- See a confirmation on my screen when checked in

### Check-In Methods
1. **Staff manual check-in** — tap member name on the class roster in the admin app
2. **QR code self check-in** — member shows QR code (from their profile/app); front desk scans it or kiosk reads it
3. **Member self check-in kiosk** — tablet at studio entrance; member types name or scans QR code

### Data Model
```
CheckIn
  - id, bookingId, memberId, sessionId
  - method (manual | qr_code | kiosk)
  - checkedInAt, checkedInBy (staffId, nullable)

QRCode
  - id, memberId, token (UUID), expiresAt
```

### Acceptance Criteria
- [ ] Each member has a unique QR code accessible from their profile
- [ ] QR code links to a check-in endpoint; valid for current day's booked classes
- [ ] Manual check-in updates booking status to "checked_in" instantly
- [ ] Class roster shows real-time check-in count (e.g., "12/16 checked in")
- [ ] After class end time + 15 minutes, any "booked" status auto-transitions to "no_show"
- [ ] No-show fee charged automatically if configured

---

## Feature 6: Staff & Instructor Management

### Overview
Manage instructors and front desk staff with role-based access, scheduling, and basic payroll tracking.

### User Stories

**As a studio admin, I want to:**
- Invite staff via email with a specific role (instructor, front desk)
- Set each instructor's bio, photo, specialties, and public profile
- View an instructor's schedule across all classes they're assigned to
- Configure pay rates: flat per-class rate, hourly rate, or percentage of revenue
- Generate a payroll report for a given period (total classes taught, total pay owed)
- Restrict instructor access to only their own schedule and rosters

**As an instructor, I want to:**
- Log in and see only my upcoming classes
- View the roster for my classes (names, check-in status)
- Mark attendance and add notes for my classes

### Data Model
```
StaffProfile
  - userId, studioId, bio, specialties (string[])
  - photo, instagramHandle
  - isPublic (show on studio's public page)

PayRate
  - staffId, type (flat_per_class | hourly | percentage)
  - amount, effectiveFrom

TimeEntry (for hourly staff)
  - staffId, clockedInAt, clockedOutAt, notes

PayrollReport
  - staffId, periodStart, periodEnd
  - classesTaught, hoursWorked, totalPay
  - generatedAt, generatedBy
```

### Acceptance Criteria
- [ ] Admin can invite staff by email; staff receive onboarding email with role pre-assigned
- [ ] Instructor login shows only "My Schedule" and "My Rosters" views
- [ ] Front desk login can book/cancel for members and process payments but cannot see financial reports
- [ ] Payroll report downloadable as CSV for a date range, broken down by staff member
- [ ] Public instructor profiles shown on studio's booking page with bio and class schedule

---

## Feature 7: Reporting & Analytics

### Overview
Business intelligence dashboard giving studio owners real-time and historical insight into revenue, attendance, member retention, and instructor performance.

### Reports

| Report | Key Metrics |
|---|---|
| **Revenue Report** | Total revenue by day/week/month, breakdown by payment type (membership, pack, drop-in, fees) |
| **Attendance Report** | Classes by fill rate, average attendance per instructor, peak hours heatmap |
| **Membership Report** | Active members, new members, churned members, MRR, average membership duration |
| **Retention Cohort** | % of members still active after 30/60/90 days since first class |
| **Waitlist Report** | Most waitlisted classes, waitlist conversion rate |
| **No-Show / Late Cancel Report** | Members with highest no-show rates, revenue recovered from fees |
| **Payroll Report** | Pay owed per instructor for a given period |
| **Class Performance** | Revenue per class, fill rate, member satisfaction (future: ratings) |

### Data Model
```
(Reports are computed queries; no separate storage except for generated exports)

ReportExport
  - id, type, generatedBy, generatedAt, fileUrl, params (JSON)
```

### Acceptance Criteria
- [ ] Admin dashboard home shows: today's revenue, today's bookings, active members, upcoming classes
- [ ] All reports filterable by date range and location
- [ ] Every report exportable to CSV
- [ ] Revenue chart shows MoM comparison
- [ ] Membership health widget shows active / new / churned counts with trend arrows
- [ ] Reports load in < 3 seconds for up to 12 months of data

---

## Feature 8: Notifications & Communications

### Overview
Automated transactional notifications keep members informed. Studio-initiated campaigns for marketing.

### Notification Types

| Trigger | Channel | Recipient |
|---|---|---|
| Booking confirmed | Email + SMS | Member |
| Booking cancelled (by member) | Email | Member |
| Booking cancelled (by studio) | Email + SMS | Member |
| Waitlist spot opened (auto-add) | Email + SMS | Member |
| Waitlist spot claimed | Email | Member |
| Class reminder | Email + SMS | Member (24h + 1h before) |
| No-show fee charged | Email | Member |
| Membership renewal upcoming | Email | Member (7 days before) |
| Membership payment failed | Email + SMS | Member |
| Membership cancelled | Email | Member |
| New member signed up | Email | Admin |
| Class cancelled | Email + SMS | All booked members |

### Studio Broadcast (simple campaigns)
- Admin can send a one-off email to: all active members, specific membership tier, or custom segment
- Basic HTML email composer with studio branding

### Data Model
```
NotificationLog
  - id, userId, type, channel (email | sms)
  - status (sent | failed | bounced), sentAt
  - metadata (JSON)

BroadcastCampaign
  - id, studioId, subject, body, audience (JSON filter)
  - sentAt, recipientCount
```

### Acceptance Criteria
- [ ] Booking confirmation email sent within 30 seconds of booking
- [ ] Class reminder emails sent at exactly 24h and 1h before class start
- [ ] Studio can disable any notification type globally
- [ ] Members can opt out of marketing/broadcast emails (transactional always sent)
- [ ] All notification sends logged with status for debugging

---

## MVP Scope (Phase 1)

The following features constitute the MVP to be implemented:

| Feature | Priority |
|---|---|
| Auth (studio admin + member) | P0 |
| Class scheduling (create, edit, recurring) | P0 |
| Member booking & cancellation | P0 |
| Memberships & class packs (Stripe) | P0 |
| Waitlist (auto-add mode) | P0 |
| Manual check-in | P0 |
| Basic admin dashboard | P0 |
| Booking confirmation emails | P0 |
| Member profiles & waivers | P1 |
| QR code check-in | P1 |
| Staff management & roles | P1 |
| Payroll reports | P1 |
| Reporting & analytics | P1 |
| Spot/mat reservation | P2 |
| SMS notifications | P2 |
| Broadcast campaigns | P2 |
| Virtual class (Zoom) integration | P2 |

---

## Non-Functional Requirements

- **Performance:** Page load < 2s; booking action < 500ms response
- **Security:** All PII encrypted at rest; PCI-compliant (no raw card data stored); HTTPS only
- **Availability:** 99.9% uptime target
- **Mobile:** Fully responsive; optimised for mobile booking flow
- **Timezone:** All times stored as UTC; displayed in studio's configured timezone
- **Accessibility:** WCAG 2.1 AA compliant
