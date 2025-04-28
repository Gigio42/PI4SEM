import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Your middleware logic goes here
  
  return NextResponse.next();
}

// Optional: Configure paths that this middleware should run on
export const config = {
  matcher: [
    // Add your path patterns here
    '/adm/:path*', // Protected admin routes
  ],
};
