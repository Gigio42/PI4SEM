import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple API endpoint to provide authentication status
 * This is a simple implementation - in a real app you would verify tokens/cookies
 */
export async function GET(req: NextRequest) {
  console.log("Session API called");
  
  // For now, return authenticated: true to bypass login requirements
  return NextResponse.json({
    authenticated: true,
    user: {
      id: 1,
      name: "Authenticated User",
      email: "user@example.com"
    }
  });
}
