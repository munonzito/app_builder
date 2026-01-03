import { ApiConfig } from '../config/api';
import { authService } from './authService';

export class ApiException extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiException';
  }
}

class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await authService.getIdToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse(response: Response): Promise<Record<string, any>> {
    if (response.ok) {
      const text = await response.text();
      if (!text) {
        return { success: true };
      }
      return JSON.parse(text);
    }
    throw new ApiException(response.status, await response.text());
  }

  async get(endpoint: string): Promise<Record<string, any>> {
    const headers = await this.getHeaders();
    const url = `${ApiConfig.baseUrl}${endpoint}`;
    console.log('[ApiService] GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    console.log('[ApiService] Response status:', response.status);
    return this.handleResponse(response);
  }

  async post(endpoint: string, body: Record<string, any>): Promise<Record<string, any>> {
    const headers = await this.getHeaders();
    const url = `${ApiConfig.baseUrl}${endpoint}`;
    console.log('[ApiService] POST', url);
    console.log('[ApiService] Headers:', JSON.stringify(headers, null, 2));
    console.log('[ApiService] Body:', JSON.stringify(body, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    console.log('[ApiService] Response status:', response.status);
    return this.handleResponse(response);
  }

  async put(endpoint: string, body: Record<string, any>): Promise<Record<string, any>> {
    const response = await fetch(`${ApiConfig.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string): Promise<Record<string, any>> {
    const response = await fetch(`${ApiConfig.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const apiService = ApiService.getInstance();
