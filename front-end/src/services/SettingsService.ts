import axios from 'axios';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Define Settings data types
export interface SettingsItem {
  section: string;
  key: string;
  value: any;
}

export interface SettingsData {
  [section: string]: {
    [key: string]: any;
  };
}

class SettingsService {
  /**
   * Get all settings from the API
   */
  async getAllSettings(): Promise<SettingsData> {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      
      // Check if response.data is an array before using reduce
      if (Array.isArray(response.data)) {
        return this.formatSettingsResponse(response.data);
      } else if (typeof response.data === 'object' && response.data !== null) {
        // If API returns already formatted object, use it directly
        return response.data;
      }
      
      // If response is neither array nor object, use defaults
      console.warn('API returned unexpected format, using defaults');
      return this.getDefaultSettings();
    } catch (error) {
      console.warn('Error fetching settings, using defaults:', error);
      // Return default settings when API fails
      return this.getDefaultSettings();
    }
  }

  /**
   * Get settings by section
   */
  async getSettingsBySection(section: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/settings/${section}`);
      
      // Handle potential different response formats
      if (Array.isArray(response.data)) {
        return response.data.reduce((acc: any, setting: SettingsItem) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
      } else if (typeof response.data === 'object' && response.data !== null) {
        return response.data;
      }
      
      return this.getDefaultSettings()[section] || {};
    } catch (error) {
      console.warn(`Error fetching ${section} settings, using defaults:`, error);
      return this.getDefaultSettings()[section] || {};
    }
  }

  /**
   * Get a specific setting
   */
  async getSetting(section: string, key: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/settings/${section}/${key}`);
      return response.data.value || response.data;
    } catch (error) {
      console.warn(`Error fetching setting ${section}.${key}, using default:`, error);
      const defaults = this.getDefaultSettings();
      return defaults[section]?.[key];
    }
  }

  /**
   * Update a specific setting
   */
  async updateSetting(section: string, key: string, value: any): Promise<any> {
    try {
      // First try PUT for updating existing setting
      const response = await axios.put(`${API_URL}/settings/${section}/${key}`, { value });
      return response.data;
    } catch (error) {
      // If 404, the setting doesn't exist yet, so create it
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        try {
          return await this.createSetting(section, key, value);
        } catch (createError) {
          console.error('Error creating setting:', createError);
          // Apply setting locally even if API fails
          this.applySettingToUI(section, key, value);
          // Re-throw so caller knows there was an error with API
          throw createError;
        }
      }
      
      // For other errors, apply setting locally but log the error
      console.error(`Error updating setting ${section}.${key}:`, error);
      this.applySettingToUI(section, key, value);
      throw error;
    }
  }

  /**
   * Create a new setting
   */
  async createSetting(section: string, key: string, value: any): Promise<any> {
    try {
      // Ensure proper value formatting for API
      const formattedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      const response = await axios.post(`${API_URL}/settings`, { 
        section, 
        key, 
        value: formattedValue 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating setting:', error);
      // Apply setting locally even if API fails
      this.applySettingToUI(section, key, value);
      throw error;
    }
  }

  /**
   * Update multiple settings at once (bulk update)
   */
  async updateMultipleSettings(settings: SettingsItem[]): Promise<any> {
    // Apply settings to UI immediately for better user experience
    this.applySettingsToUI(settings);
    
    // In development mode with no backend, just return success
    if (process.env.NODE_ENV === 'development' && 
        (!process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MOCK_API === 'true')) {
      console.info('Running in development mode with mock API. Settings applied locally only.');
      return { success: true, message: 'Settings applied locally (mock mode)' };
    }
    
    try {
      // Try bulk update first
      try {
        console.log('Attempting bulk update to:', `${API_URL}/settings/bulk`);
        const response = await axios.post(`${API_URL}/settings/bulk`, { settings });
        console.log('Bulk update successful:', response.data);
        return response.data;
      } catch (bulkError) {
        // If bulk endpoint failed, fall back to individual updates
        console.warn('Bulk update failed, falling back to individual updates:', bulkError);
        
        // Update each setting individually (sequential)
        const results = [];
        for (const setting of settings) {
          try {
            console.log(`Updating individual setting: ${setting.section}.${setting.key}`);
            const result = await this.updateSetting(
              setting.section, 
              setting.key, 
              setting.value
            );
            results.push(result);
          } catch (error) {
            // Continue with other settings even if one fails
            console.error(`Error updating setting ${setting.section}.${setting.key}:`, error);
          }
        }
        return results.length > 0 
          ? { success: true, message: 'Settings applied via individual updates', results }
          : { success: false, message: 'Failed to update settings via API, but applied locally' };
      }
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      // Settings are already applied to UI at the beginning of the method
      return { success: false, message: 'Failed to update settings via API, but applied locally' };
    }
  }

  /**
   * Apply a single setting to UI
   */
  applySettingToUI(section: string, key: string, value: any): void {
    this.applySettingsToUI([{ section, key, value }]);
  }

  /**
   * Apply settings to UI even when API fails
   * This ensures UI changes are reflected regardless of backend state
   */  applySettingsToUI(settings: SettingsItem[]): void {
    console.log('Applying settings to UI:', settings);
    const root = document.documentElement;
    
    settings.forEach(setting => {
      // Apply general settings
      if (setting.section === 'general') {
        if (setting.key === 'siteName') {
          // Set site name in the document title and as a CSS variable
          document.title = setting.value;
          root.style.setProperty('--site-name', `"${setting.value}"`);
          
          // Store site name in localStorage for components to use
          localStorage.setItem('siteName', setting.value);
          
          // Update page title if it exists
          const pageTitleElement = document.querySelector('.site-title');
          if (pageTitleElement) {
            pageTitleElement.textContent = setting.value;
          }
        }
        
        if (setting.key === 'siteDescription') {
          // Set site description as a CSS variable and in localStorage
          root.style.setProperty('--site-description', `"${setting.value}"`);
          localStorage.setItem('siteDescription', setting.value);
          
          // Update meta description if it exists
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', setting.value);
          }
        }
        
        if (setting.key === 'contactEmail') {
          // Store contact email in localStorage for components to use
          localStorage.setItem('contactEmail', setting.value);
          
          // Update contact email links if they exist
          document.querySelectorAll('a[data-contact-email]').forEach(element => {
            (element as HTMLAnchorElement).href = `mailto:${setting.value}`;
            element.textContent = setting.value;
          });
        }
      }
      
      // Apply theme-related settings
      if (setting.section === 'appearance') {
        if (setting.key === 'primaryColor') {
          root.style.setProperty('--primary', setting.value);
          
          // Convert hex to RGB for transparency
          const hexToRgb = (hex: string) => {
            if (!hex) return null;
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
            return result 
              ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
              : null;
          };
          
          const rgbValue = hexToRgb(setting.value);
          if (rgbValue) {
            root.style.setProperty('--primary-rgb', rgbValue);
          }
          
          // Log the applied color change
          console.log(`Applied primary color: ${setting.value}`);
        }
        
        if (setting.key === 'secondaryColor') {
          root.style.setProperty('--secondary', setting.value);
          
          // Also convert hex to RGB for secondary color
          const hexToRgb = (hex: string) => {
            if (!hex) return null;
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
            return result 
              ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
              : null;
          };
          
          const rgbValue = hexToRgb(setting.value);
          if (rgbValue) {
            root.style.setProperty('--secondary-rgb', rgbValue);
          }
        }
        
        if (setting.key === 'theme') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (setting.value === 'dark' || (setting.value === 'system' && prefersDark)) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
          } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
          }
        }
        
        if (setting.key === 'sidebarCollapsed') {
          // Store in localStorage for persistence
          localStorage.setItem('sidebarCollapsed', String(!!setting.value));
        }
        
        if (setting.key === 'showLoginLogo') {
          // Store setting for login page to use
          localStorage.setItem('showLoginLogo', String(!!setting.value));
          
          // Immediately apply to login logo if on login page
          const loginLogo = document.querySelector('.login-logo');
          if (loginLogo) {
            if (setting.value) {
              loginLogo.classList.remove('hidden');
            } else {
              loginLogo.classList.add('hidden');
            }
          }
        }
      }
      
      // Apply security settings
      if (setting.section === 'security') {
        if (setting.key === 'sessionTimeout') {
          // Store in localStorage for session management
          localStorage.setItem('sessionTimeout', String(setting.value));
        }
        
        if (setting.key === 'twoFactorAuth') {
          // Store 2FA preference
          localStorage.setItem('twoFactorAuth', String(!!setting.value));
          
          // Update UI elements if they exist
          const twoFactorToggle = document.querySelector('[data-setting="twoFactorAuth"]');
          if (twoFactorToggle) {
            (twoFactorToggle as HTMLInputElement).checked = !!setting.value;
          }
          
          // Show/hide 2FA elements based on setting
          document.querySelectorAll('[data-requires-2fa]').forEach(element => {
            if (setting.value) {
              element.classList.remove('hidden');
            } else {
              element.classList.add('hidden');
            }
          });
        }
      }
    });
    
    // Dispatch a custom event to notify components about settings changes
    const event = new CustomEvent('settingsUpdated', { 
      detail: { settings }
    });
    document.dispatchEvent(event);
  }

  /**
   * Helper method to format API response into nested structure
   */
  private formatSettingsResponse(data: SettingsItem[]): SettingsData {
    if (!Array.isArray(data)) {
      console.warn('Expected array for settings formatting, using defaults');
      return this.getDefaultSettings();
    }
    
    return data.reduce((result: SettingsData, item: SettingsItem) => {
      if (!result[item.section]) {
        result[item.section] = {};
      }
      
      // If value is stored as string but is actually JSON, parse it
      try {
        if (typeof item.value === 'string' && 
            (item.value.startsWith('{') || item.value.startsWith('['))
        ) {
          result[item.section][item.key] = JSON.parse(item.value);
        } else {
          result[item.section][item.key] = item.value;
        }
      } catch (e) {
        // If parsing fails, use the original value
        result[item.section][item.key] = item.value;
      }
      
      return result;
    }, {});
  }

  /**
   * Provide default settings for when API fails
   */
  private getDefaultSettings(): SettingsData {
    return {
      general: {
        siteName: 'UXperiment Labs',
        siteDescription: 'Plataforma de desenvolvimento e experimentação de componentes UI',
        contactEmail: 'contato@uxperiment.com',
        maxUploadSize: 10
      },
      appearance: {
        theme: 'system',
        primaryColor: '#6366F1',
        secondaryColor: '#8B5CF6',
        showLoginLogo: true,
        enableDarkMode: true,
        sidebarCollapsed: false
      },
      security: {
        twoFactorAuth: false,
        passwordExpiry: 0,
        sessionTimeout: 30,
        allowRegistration: true
      },
      notifications: {
        emailNotifications: true,
        componentUpdates: true,
        securityAlerts: true,
        marketingEmails: false
      }
    };
  }
}

// Export a singleton instance
export default new SettingsService();
