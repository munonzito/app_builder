import { ApiConfig } from '../config/api';

/**
 * The API endpoint for fetching bundled dependencies.
 * Uses our proxy to avoid CORS issues with Snackager CDN.
 */
export const SNACKAGER_API_URLS = [`${ApiConfig.baseUrl}/api/snackager`];

/**
 * The API endpoint for Snack API calls.
 * Uses our proxy to avoid CORS issues.
 */
export const SNACK_API_URL = `${ApiConfig.baseUrl}/api/expo/snack`;
