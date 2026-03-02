import { devices, type PlaywrightTestConfig } from '@playwright/test';
import { getSites } from './sites';

/**
 * Device profile used to build project combinations.
 */
type DeviceProfile = {
  key: string;
  deviceName: keyof typeof devices;
};

const deviceProfiles: DeviceProfile[] = [
  { key: 'chromium-desktop', deviceName: 'Desktop Chrome' },
  { key: 'firefox-desktop', deviceName: 'Desktop Firefox' },
  { key: 'webkit-mobile', deviceName: 'iPhone 13' }
];

/**
 * Creates a matrix of projects for each site and device.
 */
export function createProjects(): PlaywrightTestConfig['projects'] {
  const sites = getSites();

  return sites.flatMap((site) =>
    deviceProfiles.map((profile) => ({
      name: `${site.key}::${profile.key}`,
      use: {
        ...devices[profile.deviceName],
        baseURL: site.baseURL
      }
    }))
  );
}
