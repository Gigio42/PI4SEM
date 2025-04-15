import { NextRequest, NextResponse } from 'next/server';

// Default settings to return when no settings exist yet
const defaultSettings = {
  general: {
    siteName: 'UXperiment Labs',
    siteDescription: 'Plataforma de laboratórios de UX',
    contactEmail: 'contato@uxperimentlabs.com',
    maxUploadSize: 10, // Número em vez de string
    mainColor: '#663399',
    accentColor: '#ff6b6b'
  },
  appearance: {
    theme: 'system',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    showLoginLogo: true,
    enableDarkMode: true,
    sidebarCollapsed: false,
    animationsEnabled: true
  },
  security: {
    twoFactorAuth: false,
    passwordExpiry: 0, // Número em vez de string
    sessionTimeout: 30, // Número em vez de string
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
// Using the same reference as the main settings endpoint
let settings = { ...defaultSettings };

// Get a specific setting
export async function GET(
  request: NextRequest,
  { params }: { params: { section: string; key: string } }
) {
  const { section, key } = params;
  
  // Check if section exists
  if (!settings[section]) {
    // If section doesn't exist, check if it exists in default settings
    if (defaultSettings[section]) {
      settings[section] = { ...defaultSettings[section] };
    } else {
      return NextResponse.json({ error: `Section '${section}' not found` }, { status: 404 });
    }
  }
  
  // Check if key exists in section
  if (settings[section][key] === undefined) {
    // If key doesn't exist in section but exists in default settings, use that
    if (defaultSettings[section] && defaultSettings[section][key] !== undefined) {
      settings[section][key] = defaultSettings[section][key];
      return NextResponse.json({ value: settings[section][key] });
    }
    
    return NextResponse.json({ error: `Key '${key}' not found in section '${section}'` }, { status: 404 });
  }
  
  return NextResponse.json({ value: settings[section][key] });
}

// Update a specific setting
export async function PUT(
  request: NextRequest,
  { params }: { params: { section: string; key: string } }
) {
  try {
    const { section, key } = params;
    const body = await request.json();
    
    // Validate body
    if (body.value === undefined) {
      return NextResponse.json({ error: "Request body must contain 'value' property" }, { status: 400 });
    }
    
    // Ensure section exists
    if (!settings[section]) {
      settings[section] = {};
    }
    
    // Update setting
    settings[section][key] = body.value;
    console.log(`Updated setting via PUT: ${section}.${key} = ${body.value}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Setting ${section}.${key} updated successfully`,
      value: settings[section][key]
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
