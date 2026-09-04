export const USER_ROLES = ['admin', 'agent'] as const;

export type UserRole = (typeof USER_ROLES)[number];
