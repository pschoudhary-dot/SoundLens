# SoundLens - Discover Your Music Identity

SoundLens is a modern web application that provides personalized insights into your music listening habits by connecting to your favorite streaming services like Spotify and YouTube Music. Visualize your music taste, discover patterns in your listening behavior, and get recommendations tailored to your unique preferences.

![SoundLens Banner](public/images/soundlens-banner.png)

## 🎵 Features

- **User Authentication**: Secure email/password signup and login with JWT authentication and 30-day session persistence
- **OAuth Integration**: One-click login and connection with Spotify
- **Detailed User Profiles**: Comprehensive onboarding flow collecting music preferences and lifestyle information
- **Music Service Integration**: Connect with Spotify and YouTube Music
- **Personalized Analytics**: Get insights into your listening patterns, favorite genres, and artists
- **Responsive Design**: Beautiful dark-themed UI with 3D elements that works on all devices
- **MongoDB Integration**: Secure storage of user profiles and preferences
- **Real-time Feedback**: Loading indicators and visual feedback for all user interactions

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with App Router
- **Authentication**: NextAuth.js, JWT, Custom authentication flow
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS with custom animations and shadcn/ui components
- **3D Elements**: Spline for interactive 3D backgrounds
- **API Integration**: Spotify Web API, YouTube Music API (coming soon)
- **State Management**: React Context API and localStorage for persistence

## 📋 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Spotify Developer account (for API keys)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Base URL and NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback/spotify

# JWT
JWT_SECRET=your-jwt-secret
```

> **Note:** For production, make sure to update the `NEXTAUTH_URL` and `SPOTIFY_REDIRECT_URI` to your production domain.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/soundlens/soundlens.git
   cd soundlens
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your environment variables in `.env.local` as described above.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Spotify Developer Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/) and create a new application.

2. Add `http://localhost:3000/api/auth/callback/spotify` as a Redirect URI in your Spotify app settings.

3. Copy your Client ID and Client Secret to your `.env.local` file.

## 🔧 Project Structure

```
soundlens/
├── app/                  # Next.js app directory (App Router)
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── user/         # User-related endpoints
│   │   └── spotify/      # Spotify API endpoints
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── connect-services/ # Service connection page
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── onboarding/       # Onboarding flow components
│   ├── services/         # Service connection components
│   ├── ui/               # UI components
│   └── user/             # User profile components
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── mongoose.ts       # Database connection
│   └── utils.ts          # General utilities
├── models/               # MongoDB models
├── public/               # Static assets
│   ├── images/           # Images and icons
│   └── spline/           # 3D Spline models
└── types/                # TypeScript type definitions
```

## 📱 User Flow

1. **Landing Page**: Users are greeted with an attractive landing page featuring a 3D interactive background and showcasing the app's features
2. **Sign Up**: Users create an account with email and password or sign in with Spotify
3. **Onboarding**: Users complete a detailed questionnaire about their music preferences, including:
   - Personal information (date of birth, country, language)
   - Music preferences (favorite genres, artists, platforms)
   - Listening habits (when and how they listen to music)
4. **Connect Services**: Users connect their Spotify account and YouTube Music
5. **Dashboard**: Users view their music statistics and insights, including:
   - Top tracks and artists
   - Listening patterns
   - Genre distribution
   - Mood analysis
   - Personalized recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and project structure
- Write clean, maintainable, and testable code
- Add appropriate comments and documentation
- Test your changes thoroughly before submitting a PR
- Keep PR scope focused on a single feature or bug fix

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) - Music data
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Spline](https://spline.design/) - 3D design tool
- [Lucide Icons](https://lucide.dev/) - Icon library
- [date-fns](https://date-fns.org/) - Date utility library

## 📸 Screenshots

![Landing Page](public/images/screenshot-landing.png)
![Dashboard](public/images/screenshot-dashboard.png)
![Profile](public/images/screenshot-profile.png)

## 📊 Current Status

SoundLens is currently in active development. We're working on enhancing the dashboard with more detailed analytics and expanding the music service integrations.
