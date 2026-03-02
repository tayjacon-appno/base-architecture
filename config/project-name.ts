/**
 * Parsed representation of a generated Playwright project name.
 */
export type ParsedProjectName = {
  siteKey: string;
  deviceKey: string;
};

/**
 * Parses project names with format `siteKey::deviceKey`.
 */
export function parseProjectName(projectName: string): ParsedProjectName {
  const [siteKey = 'unknown-site', deviceKey = 'unknown-device'] = projectName.split('::');
  return { siteKey, deviceKey };
}
