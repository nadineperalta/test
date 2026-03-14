/** Standard return type for all server actions and async mutations. */
export type ActionResult = Promise<{ error: string | null }>;
