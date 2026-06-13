export interface ISiteLookup {
  findById(id: string): Promise<{ id: string; name: string; subdomain: string; ownerId: string } | null>;
  findBySubdomain(subdomain: string): Promise<{ id: string; name: string } | null>;
}
