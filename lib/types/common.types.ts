// Common types used across the application

/**
 * Generic action result type for server actions
 * @template T - The type of data returned on success
 */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
