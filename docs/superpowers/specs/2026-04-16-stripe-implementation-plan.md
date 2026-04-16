# Membership Stripe Implementation Plan

## 1. Prerequisites
- **Stripe Product ID**: `prod_ULJggcxX0PHnDF`
- **Stripe CLI**: We will set this up for local webhook testing.

## 2. API Implementation
- **Checkout API (`/api/admin/memberships/checkout`)**:
    - Receives `tier` and `userId`.
    - Creates a Stripe Checkout session using the provided Product ID.
    - `mode: 'payment'`.
    - `success_url`: `http://10.0.0.72:3001/dashboard?success=true`.
    - `cancel_url`: `http://10.0.0.72:3001/membership?canceled=true`.
- **Webhook API (`/api/webhooks/stripe`)**:
    - Receives raw body from Stripe.
    - Verifies signature using `STRIPE_WEBHOOK_SECRET`.
    - On `checkout.session.completed`, updates the `Membership` in Prisma.

## 3. UI Implementation
- **MembershipPanel**:
    - Add a "Pay with Stripe" button.
    - Calls `/api/admin/memberships/checkout` and redirects the user to the returned Stripe URL.

## 4. Setup Steps
1. **Env Setup**: Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.local`.
2. **Stripe CLI Setup**: Provide instructions to install and run the CLI for local webhook tunneling.
3. **Webhook Creation**: Implement the webhook route.

## 5. Timeline
- **Phase 1**: Setup environment & Checkout API.
- **Phase 2**: Webhook implementation & Database integration.
- **Phase 3**: UI integration and testing.

**Are you ready to start with Phase 1?**
