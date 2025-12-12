# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/be4c2035-2ce2-40ce-9414-b820b7a49d11

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/be4c2035-2ce2-40ce-9414-b820b7a49d11) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables (REQUIRED)
# Copy .env.example to .env
cp .env.example .env

# Then edit .env and fill in your actual values
# You MUST configure these before the app will work

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Setup

### Required Environment Variables

This application requires the following environment variables to be set before it will run:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_XANO_BASE_URL` | Base URL for Xano API | `https://your-instance.xano.io/api:base` |
| `VITE_XANO_ITEMS_BOOKINGS_URL` | Items/Bookings API URL | `https://your-instance.xano.io/api:items` |
| `VITE_ELEGANT_DOMAIN` | Your application domain | `your-domain.com` |
| `VITE_ELEGANT_AUTH` | Authentication key | `your-auth-key` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk authentication key | `pk_test_xxx...` |

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and fill in your values:**
   ```bash
   # Use your preferred editor
   nano .env
   # or
   code .env
   ```

3. **Never commit `.env` to git** (it's already in `.gitignore`)

### Troubleshooting

**Error: "Missing required environment variables"**
- Make sure you have created a `.env` file in the `frontend` directory
- Verify all required variables are set and not empty
- Restart the development server after changing `.env`

**Error: "Failed to fetch" or API errors**
- Check that your API URLs are correct and accessible
- Verify your authentication keys are valid
- Ensure CORS is configured on your backend
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/be4c2035-2ce2-40ce-9414-b820b7a49d11) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
