
import { z } from 'zod';

// League validation schemas
export const leagueNameSchema = z
  .string()
  .min(3, 'League name must be at least 3 characters')
  .max(50, 'League name must not exceed 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_']+$/, 'League name contains invalid characters')
  .refine((val) => val.trim().length > 0, 'League name cannot be empty');

export const leagueDescriptionSchema = z
  .string()
  .max(500, 'Description must not exceed 500 characters')
  .optional()
  .transform((val) => val?.trim() || '');

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must not exceed 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), 'Username cannot start or end with a hyphen');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters')
  .refine((val) => val.trim().length > 0, 'Name cannot be empty');

export const inviteCodeSchema = z
  .string()
  .length(6, 'Invite code must be exactly 6 characters')
  .regex(/^[A-Z0-9]+$/, 'Invite code must contain only uppercase letters and numbers');

// Form validation schemas
export const createLeagueSchema = z.object({
  name: leagueNameSchema,
  description: leagueDescriptionSchema,
  isPublic: z.boolean(),
  maxMembers: z.number().min(2).max(500).int()
});

export const joinLeagueSchema = z.object({
  inviteCode: inviteCodeSchema
});

export const userProfileSchema = z.object({
  username: usernameSchema,
  name: nameSchema
});

// Sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeLeagueName = (name: string): string => {
  const sanitized = sanitizeInput(name);
  return sanitized.replace(/[^\w\s\-_']/g, '');
};

export const sanitizeUsername = (username: string): string => {
  const sanitized = sanitizeInput(username);
  return sanitized.replace(/[^\w\-_]/g, '');
};

// Validation helper functions
export const validateAndSanitizeLeague = (data: any) => {
  const validated = createLeagueSchema.parse(data);
  return {
    ...validated,
    name: sanitizeLeagueName(validated.name),
    description: validated.description ? sanitizeInput(validated.description) : ''
  };
};

export const validateAndSanitizeUser = (data: any) => {
  const validated = userProfileSchema.parse(data);
  return {
    ...validated,
    username: sanitizeUsername(validated.username),
    name: sanitizeInput(validated.name)
  };
};
