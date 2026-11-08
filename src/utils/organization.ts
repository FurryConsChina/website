export function getOrganizationLink(organization: { links: { type: string; value: string }[] }, type: string) {
  return organization.links.find((link) => link.type === type)?.value ?? null;
}
