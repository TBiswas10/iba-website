export const DONATION_STATUS = {
  PENDING: "PENDING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
} as const;

export type DonationStatus = (typeof DONATION_STATUS)[keyof typeof DONATION_STATUS];
