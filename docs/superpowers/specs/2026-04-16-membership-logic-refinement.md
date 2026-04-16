# Membership Logic Refinement Plan

## 1. Objective
Refine the `MembershipPanel` and dashboard to:
1. Hide payment UI for users with an `ACTIVE` membership.
2. Automatically prompt for payment only when a membership is `EXPIRED` or nonexistent.
3. Update the `Membership` status to `EXPIRED` if the current date passes the `expiryDate`.

## 2. Changes
- **Backend (`/api/memberships/mine`)**: Add logic to check `expiryDate` and mark as `EXPIRED` if needed.
- **Frontend (`MembershipPanel`)**: Only show payment UI if `membership === null` OR `membership.status === 'EXPIRED'`.
- **Display**: Show "Your membership is active" when the status is `ACTIVE`.

## 3. Implementation Steps
1. Update API to auto-expire memberships.
2. Update UI logic in `MembershipPanel` to check status before showing payment options.

**Are you ready for me to apply these logic updates?**
