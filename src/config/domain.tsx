/**
 * Domain Configuration for MotorWatch
 * Production Domain: motorwatch.tech
 */

export const DOMAIN_CONFIG = {
  production: 'https://motorwatch.tech',
  development: 'http://localhost:5173',
  staging: 'https://staging.motorwatch.tech',
};

// Automatically detect current environment
export const getCurrentDomain = () => {
  if (typeof window === 'undefined') return DOMAIN_CONFIG.production;
  
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Use the current port if on localhost
    return `http://localhost:${port || '5173'}`;
  }
  
  if (hostname.includes('staging')) {
    return DOMAIN_CONFIG.staging;
  }
  
  return DOMAIN_CONFIG.production;
};

// Get redirect URLs for OAuth
export const getRedirectUrl = (path: string = '') => {
  return `${getCurrentDomain()}${path}`;
};