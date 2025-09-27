import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import Discord from "next-auth/providers/discord";
import Twitter from "next-auth/providers/twitter";
import LinkedIn from "next-auth/providers/linkedin";
// Dynamic provider configuration based on environment variables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAvailableProviders(): any[] {
  const providers: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Google OAuth
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      })
    );
  }

  // GitHub OAuth
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
      })
    );
  }

  // Facebook OAuth
  if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
    providers.push(
      Facebook({
        clientId: process.env.AUTH_FACEBOOK_ID,
        clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      })
    );
  }

  // Apple OAuth
  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
    providers.push(
      Apple({
        clientId: process.env.AUTH_APPLE_ID,
        clientSecret: process.env.AUTH_APPLE_SECRET,
      })
    );
  }

  // Discord OAuth
  if (process.env.AUTH_DISCORD_ID && process.env.AUTH_DISCORD_SECRET) {
    providers.push(
      Discord({
        clientId: process.env.AUTH_DISCORD_ID,
        clientSecret: process.env.AUTH_DISCORD_SECRET,
      })
    );
  }

  // Twitter OAuth
  if (process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET) {
    providers.push(
      Twitter({
        clientId: process.env.AUTH_TWITTER_ID,
        clientSecret: process.env.AUTH_TWITTER_SECRET,
      })
    );
  }

  // LinkedIn OAuth
  if (process.env.AUTH_LINKEDIN_ID && process.env.AUTH_LINKEDIN_SECRET) {
    providers.push(
      LinkedIn({
        clientId: process.env.AUTH_LINKEDIN_ID,
        clientSecret: process.env.AUTH_LINKEDIN_SECRET,
      })
    );
  }

  return providers;
}

// Get provider metadata for UI display
export function getProviderMetadata() {
  const providers = getAvailableProviders();

  return providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    type: provider.type,
    // Add display information for UI
    displayName: getProviderDisplayName(provider.id as string),
    iconColor: getProviderIconColor(provider.id as string),
  }));
}

function getProviderDisplayName(id: string): string {
  const names: Record<string, string> = {
    google: "Google",
    github: "GitHub",
    facebook: "Facebook",
    apple: "Apple",
    discord: "Discord",
    twitter: "X (Twitter)",
    linkedin: "LinkedIn",
  };
  return names[id] || id;
}

function getProviderIconColor(id: string): string {
  const colors: Record<string, string> = {
    google: "#4285f4",
    github: "#333",
    facebook: "#1877f2",
    apple: "#000",
    discord: "#5865f2",
    twitter: "#1da1f2",
    linkedin: "#0077b5",
  };
  return colors[id] || "#666";
}
