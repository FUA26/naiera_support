/**
 * Public Settings Data Module
 *
 * Fetches public settings from Backoffice API
 */

export interface PublicSettings {
  siteName: string;
  siteSubtitle: string | null;
  siteDescription: string | null;
  siteLogoUrl: string | null;
  citizenName: string | null;
  contactAddress: string | null;
  contactPhones: string[] | null;
  contactEmails: string[] | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialYouTube: string | null;
  copyrightText: string | null;
  versionNumber: string | null;
  heroBackgroundUrl: string | null;
}

const BACKOFFICE_API_URL = process.env.BACKOFFICE_API_URL || 'http://localhost:3001';

export async function getPublicSettings(): Promise<PublicSettings> {
  // Return defaults immediately if BACKOFFICE_API_URL is not set (during build or if env missing)
  if (!BACKOFFICE_API_URL || BACKOFFICE_API_URL === 'http://localhost:3001' && process.env.NODE_ENV === 'production') {
    return getDefaultSettings();
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${BACKOFFICE_API_URL}/api/public/settings`, {
      cache: 'no-store',
      signal: controller.signal,
      next: { revalidate: 60 } // Revalidate every minute
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Validate response has expected data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response');
    }

    return data;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    // Return defaults immediately on any error
    return getDefaultSettings();
  }
}

function getDefaultSettings(): PublicSettings {
  return {
    siteName: 'Super App Naiera',
    siteSubtitle: 'Kabupaten Naiera',
    siteDescription: null,
    siteLogoUrl: null,
    citizenName: 'Warga Naiera',
    contactAddress: null,
    contactPhones: null,
    contactEmails: null,
    socialFacebook: null,
    socialTwitter: null,
    socialInstagram: null,
    socialYouTube: null,
    copyrightText: null,
    versionNumber: '1.0.0',
    heroBackgroundUrl: null,
  };
}
