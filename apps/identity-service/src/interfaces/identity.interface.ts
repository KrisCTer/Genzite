/**
 * Exported interfaces for cross-service consumption.
 * Other services should depend on these interfaces, NOT on concrete service classes.
 */

export interface IUserLookup {
  findById(id: string): Promise<{ id: string; email: string; name: string; roles: string[] } | null>;
  findByEmail(email: string): Promise<{ id: string; email: string; name: string } | null>;
}

export interface ITokenValidator {
  validateToken(token: string): Promise<{ userId: string; roles: string[] } | null>;
}
