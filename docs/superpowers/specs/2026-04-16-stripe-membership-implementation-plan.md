# Membership & Donation Strategy Plan

## 1. Goal
Implement a reliable, one-time payment system for annual memberships using Stripe Checkout and provide a foundation for future donations.

## 2. Membership Architecture (One-time, 1-Year Pass)
- **Database**:
  - `Membership`: Status (`ACTIVE`, `PENDING`, `EXPIRED`), `expiryDate` (set to `now + 365 days` upon payment).
- **Stripe Integration**:
  - **Checkout Session**: Created via `/api/admin/memberships/checkout` (Mode: `payment`, Line Item: `Annual Membership`).
  - **Webhook**: Listen for `checkout.session.completed`, update database status to `ACTIVE` and `expiryDate` to `now + 365 days`.

## 3. Implementation Steps
1.  **Stripe Configuration**: Confirm Stripe product IDs in `.env.local`.
2.  **Checkout API**: Implement `POST /api/admin/memberships/checkout` to create a Stripe session.
3.  **Webhook Handler**: Implement `POST /api/webhooks/stripe` to handle `checkout.session.completed`.
4.  **UI Integration**: Add a "Pay Membership" button in `MembershipPanel` that initiates the Stripe Checkout flow.
5.  **Validation**: Test the flow from end to end using Stripe CLI.

## 4. Verification & Testing
- **Test 1**: Verify Checkout Session creation redirects to Stripe.
- **Test 2**: Verify Webhook correctly updates `Membership` status to `ACTIVE` in Supabase.
- **Test 3**: Verify `expiryDate` is correctly set.

## Questions for User
1. Do you already have a Stripe product created in your dashboard? (I need the **Price ID** if you do).
2. Are you using Stripe CLI? (I can help you set it up if needed).

---

**Does this plan work for you? If yes, I will write the detailed implementation plan (using `writing-plans` skill).**
