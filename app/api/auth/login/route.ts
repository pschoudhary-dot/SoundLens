import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update login statistics
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-default-secret-do-not-use-in-production',
      { expiresIn: '30d' } // Extended to 30 days for better persistence
    );

    // Return user info and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      spotifyConnected: user.spotifyConnected,
      youtubeConnected: user.youtubeConnected,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount
    };

    return NextResponse.json({ user: userResponse, token });
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    );
  }
}
