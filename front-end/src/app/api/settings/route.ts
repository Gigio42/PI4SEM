import { NextResponse } from 'next/server';

// Define types for our settings structure
type SettingsSection = 'general' | 'appearance' | 'security' | 'notifications';

interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    maxUploadSize: string;
    mainColor: string;
    accentColor: string;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    showLoginLogo: boolean;
    enableDarkMode: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    passwordExpiry: string;
    sessionTimeout: string;
    allowRegistration: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    componentUpdates: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
  [key: string]: Record<string, any>; // Allow additional dynamic sections
}

// Default settings to return when no settings exist yet
const defaultSettings: Settings = {
  general: {
    siteName: 'UXperiment Labs',
    siteDescription: 'Plataforma de laboratórios de UX',
    contactEmail: 'contato@uxperimentlabs.com',
    maxUploadSize: '10',
    mainColor: '#663399',
    accentColor: '#ff6b6b'
  },
  appearance: {
    theme: 'system',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    showLoginLogo: true,
    enableDarkMode: true
  },
  security: {
    twoFactorAuth: false,
    passwordExpiry: '0', 
    sessionTimeout: '30',
    allowRegistration: true
  },
  notifications: {
    emailNotifications: true,
    componentUpdates: true,
    securityAlerts: true,
    marketingEmails: false
  }
};

// Store settings in memory for the development server
let settings: Settings = { ...defaultSettings };

export async function GET() {
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle updating a single setting
    if (body.section && body.key !== undefined && body.value !== undefined) {
      const section = body.section as string;
      const key = body.key as string;
      
      // Create the section if it doesn't exist
      if (!settings[section]) {
        settings[section] = {} as any;
      }
      
      // Update the setting
      settings[section][key] = body.value;
      
      console.log(`Updated setting: ${section}.${key} = ${body.value}`);
      return NextResponse.json({ 
        success: true, 
        message: `Setting ${section}.${key} updated successfully` 
      });
    }
    
    // Handle updating multiple settings
    if (Array.isArray(body)) {
      body.forEach(setting => {
        if (setting.section && setting.key !== undefined) {
          const section = setting.section as string;
          const key = setting.key as string;
          
          // Create the section if it doesn't exist
          if (!settings[section]) {
            settings[section] = {} as any;
          }
          
          // Update the setting
          settings[section][key] = setting.value;
          console.log(`Updated setting: ${section}.${key} = ${setting.value}`);
        }
      });
      return NextResponse.json({ 
        success: true, 
        message: `${body.length} settings updated successfully` 
      });
    }
    
    return NextResponse.json({ 
      error: 'Invalid request body', 
      expected: 'Object with section, key, value or array of such objects' 
    }, { status: 400 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
