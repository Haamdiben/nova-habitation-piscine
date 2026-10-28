export interface SocialLink {
  label: string;
  url: string;
}

/** Social network links filled in the back office (empty or placeholder "#" links are left out). */
export function socialLinks(info: any): SocialLink[] {
  const links: [string, string | undefined][] = [
    ['Facebook', info?.facebookUrl],
    ['Instagram', info?.instagramUrl],
    ['LinkedIn', info?.linkedinUrl],
  ];
  return links
    .map(([label, url]) => ({ label, url: (url ?? '').trim() }))
    .filter((link) => link.url !== '' && link.url !== '#');
}
