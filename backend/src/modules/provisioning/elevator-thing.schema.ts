import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const elevatorThingProvisionBodySchema = z.object({
  thingId: z.string().min(1),
  shaftId: z.string().min(1),
  policyId: z.string().min(1).optional(),
  properties: z.record(z.unknown()).optional()
});

export type ElevatorThingProvisionInput = z.infer<typeof elevatorThingProvisionBodySchema>;

export const elevatorThingPatchBodySchema = z.object({
  properties: z.record(z.unknown()).optional()
});

export type ElevatorThingPatchInput = z.infer<typeof elevatorThingPatchBodySchema>;

export const adminCreateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(['platform_admin', 'building_admin', 'operator', 'viewer'])).min(1),
  buildingIds: z.array(z.string().min(1)).default([])
});

export type AdminCreateUserInput = z.infer<typeof adminCreateUserBodySchema>;
