/**
 * Brand configuration. The HayesX website (hayesx.net) could not be reached from
 * the build environment, so the palette and wordmark here are provisional: the
 * palette is taken from the HayesX-250 itself (carbon-fiber structure, PFD blue,
 * red torque-seal / BRS handle) and the wordmark is set in type.
 *
 * To apply the official brand kit:
 *   1. Drop the logo into /public/brand/ and set `logo` below (SVG preferred).
 *   2. Adjust the color tokens in app/globals.css (:root and dark theme blocks).
 *   3. Replace /public/icons/* (192, 512, maskable, apple-touch) with official icons.
 */
export const BRAND = {
  name: 'HayesX',
  appName: 'HayesX',
  product: 'HayesX-250',
  tagline: 'Personal eVTOL flight, from your backyard.',
  company: 'HayesX Inc.',
  location: 'Las Vegas, Nevada',
  website: 'https://hayesx.net',
  // e.g. { src: '/brand/hayesx-logo.svg', width: 132, height: 28, invertOnDark: true }
  logo: null,
  themeColor: '#0E1116',
  background: '#0E1116',
}
