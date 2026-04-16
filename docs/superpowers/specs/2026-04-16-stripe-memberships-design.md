# Membership via Stripe Hosted Checkout

## Objective
Implement an annual membership payment system using Stripe Hosted Checkout. Instead of recurring subscriptions, this will use one-time payments that grant 12 months of membership access.

## Scope
- Create a new API route (`/api/admin/memberships/checkout`) for creating Stripe Checkout Sessions (mode: 'payment').
- Update the webhook handler to listen for `checkout.session.completed` to verify payment and set the `expiryDate` to 1 year from the payment date.
- Update `MembershipPanel` to redirect users to Stripe Checkout.
- Admin dashboard remains the primary interface for status overrides.

## Updated Design
1. **Frontend**: The `MembershipPanel` triggers a POST request to `/api/admin/memberships/checkout` with the `tier` and `userId`.
2. **Backend**:
   - Create Stripe Checkout Session (`mode: 'payment'`).
   - `success_url` redirects back to `/dashboard`.
   - Webhook: When `checkout.session.completed` fires, set `status` to `ACTIVE` and `expiryDate` to `now + 1 year` in the Prisma database.
3. **Admin**: No changes required to current status management.

## Key Design Choices
- **One-time payments only**: Avoids complexity of subscription management, cancellations, and complex webhooks.
- **Expiry Logic**: Handled at the database level via the `expiryDate` field.
- **No Content Restriction**: Keeping it simple for now as requested.

## Questions for User
1. Are you ready to proceed with this plan?
2. Shall I provide the implementation plan (using `writing-plans` skill) next?
