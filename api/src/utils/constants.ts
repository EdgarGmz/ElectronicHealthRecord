// Prescription status constants
export const PRESCRIPTION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISCONTINUED: 'discontinued',
  SUSPENDED: 'suspended',
} as const;

export const PRESCRIPTION_STATUS_VALUES = Object.values(PRESCRIPTION_STATUS);

export type PrescriptionStatus = typeof PRESCRIPTION_STATUS[keyof typeof PRESCRIPTION_STATUS];

// Helper function to parse boolean query params
export const parseBooleanQuery = (value: unknown): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};
