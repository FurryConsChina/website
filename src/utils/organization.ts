import type { Organization } from "@/types/organization";

export function getOrganizationLink(organization: Organization, type: string) {
  return organization.links.find((link) => link.type === type)?.value ?? null;
}
