// Environment variable validation
// Ensures all required environment variables are present and valid

interface EnvConfig {
    baseUrl: string;
    itemsBookingsUrl: string;
    elegantDomain: string;
    elegantAuth: string;
    clerkPublishableKey: string;
    mode: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

class EnvValidator {
    private config: EnvConfig | null = null;

    /**
     * Validates and returns environment configuration
     * Throws error if any required variables are missing
     */
    getConfig(): EnvConfig {
        if (this.config) {
            return this.config;
        }

        const requiredVars = {
            VITE_XANO_BASE_URL: import.meta.env.VITE_XANO_BASE_URL,
            VITE_XANO_ITEMS_BOOKINGS_URL: import.meta.env.VITE_XANO_ITEMS_BOOKINGS_URL,
            VITE_ELEGANT_DOMAIN: import.meta.env.VITE_ELEGANT_DOMAIN,
            VITE_ELEGANT_AUTH: import.meta.env.VITE_ELEGANT_AUTH,
            VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
        };

        // Validate all required variables are present
        const missingVars: string[] = [];

        Object.entries(requiredVars).forEach(([key, value]) => {
            if (!value || value.trim() === '') {
                missingVars.push(key);
            }
        });

        if (missingVars.length > 0) {
            const errorMessage = [
                '❌ Missing required environment variables:',
                ...missingVars.map(key => `   - ${key}`),
                '',
                '📝 To fix this:',
                '   1. Copy .env.example to .env',
                '   2. Fill in all required values',
                '   3. Restart the development server',
            ].join('\n');

            throw new Error(errorMessage);
        }

        // Create validated config object
        this.config = {
            baseUrl: requiredVars.VITE_XANO_BASE_URL,
            itemsBookingsUrl: requiredVars.VITE_XANO_ITEMS_BOOKINGS_URL,
            elegantDomain: requiredVars.VITE_ELEGANT_DOMAIN,
            elegantAuth: requiredVars.VITE_ELEGANT_AUTH,
            clerkPublishableKey: requiredVars.VITE_CLERK_PUBLISHABLE_KEY,
            mode: import.meta.env.MODE || 'development',
            isDevelopment: import.meta.env.MODE === 'development',
            isProduction: import.meta.env.MODE === 'production',
        };

        return this.config;
    }
}

const envValidator = new EnvValidator();

// Validate immediately on import
export const env = envValidator.getConfig();
