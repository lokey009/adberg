# medianode.ai - AI-Powered Video Ad Creation Platform

A modern, high-quality AI video ad creation platform with authentication powered by Supabase and database management with Prisma.

## 🚀 Features

- **Modern Authentication**: Secure login/signup with Supabase Auth
- **User Dashboard**: Personalized dashboard for managing video projects
- **Protected Routes**: Secure access to authenticated areas
- **Responsive Design**: Beautiful UI that works on all devices
- **Database Integration**: Prisma ORM with PostgreSQL via Supabase
- **Type Safety**: Full TypeScript support throughout the application

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase with Prisma ORM
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## ⚡ Quick Start

1. **Clone the repository**

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```sh
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration for Prisma
DATABASE_URL="your_supabase_database_url_with_pooling"
DIRECT_URL="your_supabase_direct_database_url"
```

4. **Set up the database**
Run the SQL migration in your Supabase SQL editor:
```sh
# Copy the contents of prisma/migrations/001_initial_setup.sql
# and run it in your Supabase SQL editor
```

5. **Generate Prisma client**
```sh
npx prisma generate
```

6. **Start the development server**
```sh
npm run dev
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and anon key from the API settings
3. Run the SQL migration from `prisma/migrations/001_initial_setup.sql` in the SQL editor
4. Enable Row Level Security (RLS) policies are included in the migration

### Authentication Flow

- Users can sign up with email/password
- Email confirmation is required (configurable in Supabase Auth settings)
- User profiles are automatically created in the database upon first sign-in
- Protected routes redirect unauthenticated users to the home page

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Navigation.tsx  # Main navigation with auth integration
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx # Authentication state management
├── lib/
│   ├── supabase.ts     # Supabase client configuration
│   ├── prisma.ts       # Prisma client configuration
│   └── userService.ts  # User-related database operations
├── pages/
│   ├── Index.tsx       # Landing page
│   └── Dashboard.tsx   # Protected dashboard
└── App.tsx             # Main app with routing
```

## 🎨 Design System

The application follows a modern dark theme with:
- **Primary Color**: Purple (#6366f1)
- **Accent Color**: Green (#10b981)
- **Typography**: Montserrat (headings) + Open Sans (body)
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

## 🔒 Security Features

- Row Level Security (RLS) enabled on all database tables
- JWT-based authentication with Supabase
- Protected API routes with user context
- Input validation with Zod schemas
- XSS protection with proper sanitization

## 📝 License

This project is licensed under the MIT License.

# DermaLogic B2 Cloud Storage Integration

This project includes integration with Backblaze B2 cloud storage for image uploads in the skin studio feature.

## Configuration

The B2 integration is configured to work with a private bucket, which provides better security for your files. The application handles authentication and access to the files through a proxy endpoint.

### B2 Configuration

The following environment variables need to be set in your `.env` file:

```
B2_ACCESS_KEY_ID=your_b2_key_id
B2_SECRET_ACCESS_KEY=your_b2_secret_key
B2_IMAGE_BUCKET_NAME=your_bucket_name
B2_ENDPOINT=s3.us-east-005.backblazeb2.com
```

## How It Works

1. **File Upload**: When a user uploads an image in the skin studio, the file is:
   - Saved locally for immediate access
   - Uploaded to B2 for persistent storage
   - Enhanced and processed
   - The enhanced version is also uploaded to B2

2. **File Access**: Since the B2 bucket is private, direct URLs to the files won't work. Instead, the application:
   - Uses a proxy endpoint (`/skin-studio/b2-proxy/<file_path>`) to serve files from B2
   - Caches downloaded files locally for faster access
   - Handles authentication with B2 automatically

3. **Frontend**: The frontend displays images using the proxy URLs, which are automatically generated when files are uploaded.

## Troubleshooting

If images are not displaying properly:

1. Check the B2 bucket permissions in the Backblaze dashboard
2. Verify that the B2 credentials are correct in your `.env` file
3. Look at the server logs for any authentication or download errors
4. Use the debug information in the upload panel to see the exact URLs being used

## Testing B2 Integration

You can use the included test scripts to verify your B2 configuration:

```bash
# Test B2 access and bucket configuration
python api/test_b2_access.py

# Test file listing and downloading
python api/test_b2_direct.py

# Test presigned URL generation (may not work with all B2 configurations)
python api/test_b2_presigned.py
```

## Security Considerations

- The B2 bucket is kept private to prevent unauthorized access to files
- Authentication is handled server-side for better security
- Files are cached locally to improve performance and reduce B2 API calls
- The server acts as a proxy to avoid exposing B2 credentials to the client
