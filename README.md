# SoundLens - Know Your Music Flow

SoundLens is a modern web application that provides personalized insights into your music listening habits by connecting to your favorite streaming services like Spotify and YouTube Music.

## 🎵 Features

- **User Authentication**: Secure email/password signup and login with JWT authentication
- **Detailed User Profiles**: Comprehensive onboarding flow collecting music preferences and lifestyle information
- **Music Service Integration**: Connect with Spotify and YouTube Music (coming soon)
- **Personalized Analytics**: Get insights into your listening patterns, favorite genres, and artists
- **Responsive Design**: Beautiful dark-themed UI that works on all devices
- **MongoDB Integration**: Secure storage of user profiles and preferences

## 🚀 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js, JWT
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS with custom animations
- **API Integration**: Spotify Web API

## 📋 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB database
- Spotify Developer account (for API keys)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Base URL
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# MongoDB
MONGODB_URI=your-mongodb-connection-string

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# JWT
JWT_SECRET=your-jwt-secret
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/soundlens.git
   cd soundlens
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔧 Project Structure

```
soundlens/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── connect-services/ # Service connection page
├── components/           # React components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── onboarding/       # Onboarding flow components
│   ├── services/         # Service connection components
│   └── ui/               # UI components
├── lib/                  # Utility functions
├── models/               # MongoDB models
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## 📱 User Flow

1. **Home Page**: Users are greeted with an attractive landing page showcasing the app's features
2. **Sign Up**: Users create an account with email and password
3. **Onboarding**: Users complete a detailed questionnaire about their music preferences and lifestyle
4. **Connect Services**: Users connect their Spotify account and (in the future) YouTube Music
5. **Dashboard**: Users view their music statistics and insights

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [NextAuth.js](https://next-auth.js.org/)
