// Simple script to check if environment variables are properly set
// Run with: node scripts/check-env.js

console.log('Checking environment variables...\n');

const requiredVars = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REDIRECT_URI',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'MONGODB_URI',
  'JWT_SECRET'
];

let allSet = true;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName} is not set`);
    allSet = false;
  } else {
    // Show a preview of the value (first few characters)
    const preview = value.length > 10 ? `${value.substring(0, 5)}...` : value;
    console.log(`✅ ${varName} is set: ${preview}`);
  }
}

console.log('\n');

if (!allSet) {
  console.error('❌ Some required environment variables are missing. Please check your .env.local file.');
  console.log('Make sure you have the following variables set:');
  console.log(requiredVars.join('\n'));
} else {
  console.log('✅ All required environment variables are set!');
}

// Check if Spotify redirect URI is valid
const spotifyRedirectUri = process.env.SPOTIFY_REDIRECT_URI;
if (spotifyRedirectUri) {
  try {
    const url = new URL(spotifyRedirectUri);
    console.log('✅ SPOTIFY_REDIRECT_URI is a valid URL:', url.toString());
    
    // Check if the redirect URI matches the expected format
    if (!url.pathname.includes('/api/auth/callback/spotify')) {
      console.warn('⚠️ SPOTIFY_REDIRECT_URI may not be correct. Expected path to include: /api/auth/callback/spotify');
    }
    
    // Check if the hostname matches NEXTAUTH_URL
    if (process.env.NEXTAUTH_URL) {
      const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
      if (url.hostname !== nextAuthUrl.hostname) {
        console.warn('⚠️ SPOTIFY_REDIRECT_URI hostname does not match NEXTAUTH_URL hostname');
        console.warn(`   SPOTIFY_REDIRECT_URI: ${url.hostname}`);
        console.warn(`   NEXTAUTH_URL: ${nextAuthUrl.hostname}`);
      }
    }
  } catch (error) {
    console.error('❌ SPOTIFY_REDIRECT_URI is not a valid URL:', spotifyRedirectUri);
  }
}
