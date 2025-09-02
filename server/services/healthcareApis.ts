import axios from 'axios';
import { decrypt } from './encryption';
import { z } from 'zod';

/**
 * Interface for Healthcare API configuration
 */
export interface HealthcareApiConfig {
  id: string;
  name: string;
  baseUrl: string;
  authType: 'bearer' | 'basic' | 'oauth2' | 'apiKey' | 'custom';
  authConfig: {
    tokenKey?: string;
    headerName?: string;
    queryParamName?: string;
  };
  scopes?: string[];
  headers?: Record<string, string>;
  enabled: boolean;
  providerType: 'core' | 'case-specific';
  dataCategories: string[];
}

/**
 * Schema for validating API response data
 */
const patientDataSchema = z.object({
  patientId: z.string(),
  // Add more fields as needed based on the specific API response
});

type PatientData = z.infer<typeof patientDataSchema>;

/**
 * Main class for healthcare API integrations
 */
export class HealthcareApiService {
  private apiConfigs: Map<string, HealthcareApiConfig>;
  private authTokens: Map<string, { token: string; expiresAt: Date }>;

  constructor() {
    this.apiConfigs = new Map();
    this.authTokens = new Map();
  }

  /**
   * Register a healthcare API
   */
  public registerApi(config: HealthcareApiConfig): void {
    this.apiConfigs.set(config.id, config);
  }

  /**
   * Get API configuration by ID
   */
  public getApiConfig(apiId: string): HealthcareApiConfig | undefined {
    return this.apiConfigs.get(apiId);
  }

  /**
   * Get all registered API configurations
   */
  public getAllApiConfigs(): HealthcareApiConfig[] {
    return Array.from(this.apiConfigs.values());
  }

  /**
   * Get API configurations by provider type
   */
  public getApisByType(providerType: 'core' | 'case-specific'): HealthcareApiConfig[] {
    return Array.from(this.apiConfigs.values()).filter(
      config => config.providerType === providerType
    );
  }

  /**
   * Set authentication token for an API
   */
  public setAuthToken(apiId: string, token: string, expiresInSeconds?: number): void {
    const expiresAt = expiresInSeconds
      ? new Date(Date.now() + expiresInSeconds * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 24 hours

    this.authTokens.set(apiId, {
      token,
      expiresAt
    });
  }

  /**
   * Check if we have a valid token for an API
   */
  private hasValidToken(apiId: string): boolean {
    const tokenInfo = this.authTokens.get(apiId);
    if (!tokenInfo) return false;
    return new Date() < tokenInfo.expiresAt;
  }

  /**
   * Get auth headers for a request
   */
  private getAuthHeaders(apiId: string): Record<string, string> {
    const config = this.apiConfigs.get(apiId);
    if (!config) throw new Error(`API configuration not found for ID: ${apiId}`);

    const headers: Record<string, string> = { ...config.headers };

    // If we have a token and it's valid, add it to the headers
    if (this.hasValidToken(apiId)) {
      const tokenInfo = this.authTokens.get(apiId)!;
      
      if (config.authType === 'bearer') {
        headers['Authorization'] = `Bearer ${tokenInfo.token}`;
      } else if (config.authType === 'basic') {
        headers['Authorization'] = `Basic ${tokenInfo.token}`;
      } else if (config.authType === 'apiKey' && config.authConfig.headerName) {
        headers[config.authConfig.headerName] = tokenInfo.token;
      }
    }

    return headers;
  }

  /**
   * Fetch patient data from a healthcare API
   */
  public async fetchPatientData(
    apiId: string, 
    patientId: string, 
    dataCategories?: string[]
  ): Promise<any> {
    const config = this.apiConfigs.get(apiId);
    if (!config) throw new Error(`API configuration not found for ID: ${apiId}`);
    if (!config.enabled) throw new Error(`API ${config.name} is disabled`);

    // Determine which categories to fetch
    const categories = dataCategories || config.dataCategories;
    
    try {
      const headers = this.getAuthHeaders(apiId);
      
      const response = await axios.get(
        `${config.baseUrl}/patients/${patientId}`, 
        { 
          headers,
          params: {
            categories: categories.join(',')
          }
        }
      );

      // Validate the response data against the schema
      // In a real implementation, we would have different schemas for different APIs
      return response.data;
    } catch (error) {
      console.error(`Error fetching patient data from ${config.name}:`, error);
      throw new Error(`Failed to fetch data from ${config.name}: ${error.message}`);
    }
  }

  /**
   * Fetch specific health data from a healthcare API
   */
  public async fetchHealthData(
    apiId: string,
    patientId: string,
    dataType: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<any> {
    const config = this.apiConfigs.get(apiId);
    if (!config) throw new Error(`API configuration not found for ID: ${apiId}`);
    if (!config.enabled) throw new Error(`API ${config.name} is disabled`);

    try {
      const headers = this.getAuthHeaders(apiId);
      
      // Build query params
      const params: Record<string, string> = {};
      
      if (options?.startDate) {
        params.startDate = options.startDate.toISOString();
      }
      
      if (options?.endDate) {
        params.endDate = options.endDate.toISOString();
      }
      
      if (options?.limit) {
        params.limit = options.limit.toString();
      }
      
      const response = await axios.get(
        `${config.baseUrl}/patients/${patientId}/data/${dataType}`, 
        { headers, params }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching health data from ${config.name}:`, error);
      throw new Error(`Failed to fetch data from ${config.name}: ${error.message}`);
    }
  }

  /**
   * Register a new external healthcare API
   */
  public async registerExternalApi(
    name: string,
    baseUrl: string,
    authType: 'bearer' | 'basic' | 'oauth2' | 'apiKey' | 'custom',
    authConfig: any,
    providerType: 'core' | 'case-specific',
    dataCategories: string[]
  ): Promise<HealthcareApiConfig> {
    // Generate a unique ID for the API
    const id = `api_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
    
    const config: HealthcareApiConfig = {
      id,
      name,
      baseUrl,
      authType,
      authConfig,
      enabled: true,
      providerType,
      dataCategories
    };
    
    this.registerApi(config);
    
    // In a real implementation, we would persist this configuration to a database
    return config;
  }
}

// Create a singleton instance of the service
export const healthcareApiService = new HealthcareApiService();

// Register core healthcare APIs
healthcareApiService.registerApi({
  id: 'fhir_core',
  name: 'FHIR API',
  baseUrl: 'https://api.fhir.org/v1',
  authType: 'bearer',
  authConfig: {},
  enabled: true,
  providerType: 'core',
  dataCategories: ['vitals', 'medications', 'conditions', 'allergies', 'immunizations', 'labs']
});

healthcareApiService.registerApi({
  id: 'healthkit',
  name: 'Apple HealthKit',
  baseUrl: 'https://api.healthkit.example.com/v1',
  authType: 'oauth2',
  authConfig: {
    tokenKey: 'access_token',
    headerName: 'Authorization'
  },
  scopes: ['read.vitals', 'read.activity'],
  enabled: false, // Disabled until configured
  providerType: 'core',
  dataCategories: ['vitals', 'activity', 'sleep']
});

// Example function to integrate with a case-specific provider
export async function integrateWithCaseSpecificProvider(
  providerInfo: {
    name: string;
    baseUrl: string;
    authType: 'bearer' | 'basic' | 'oauth2' | 'apiKey' | 'custom';
    authDetails: any;
  },
  dataCategories: string[]
): Promise<HealthcareApiConfig> {
  try {
    // In a real implementation, we would validate the provider credentials here
    
    return await healthcareApiService.registerExternalApi(
      providerInfo.name,
      providerInfo.baseUrl,
      providerInfo.authType,
      providerInfo.authDetails,
      'case-specific',
      dataCategories
    );
  } catch (error) {
    console.error('Error integrating with case-specific provider:', error);
    throw new Error(`Failed to integrate with provider: ${error.message}`);
  }
}