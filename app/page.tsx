'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  Music,
  ChevronRight,
  BarChart2,
  Headphones,
  User,
  Sparkles,
  Disc3,
  LineChart,
  Radio,
  Heart,
  HelpCircle,
  Github as GithubIcon
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const splineContainerRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 10);

      // Calculate scroll progress for animations (0 to 1) - smoother transition
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      // Use a smaller divisor for smoother, slower animations
      const progress = Math.min(scrollY / (scrollHeight * 0.4), 1);

      // Use requestAnimationFrame for smoother animations
      requestAnimationFrame(() => {
        setScrollProgress(progress);
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e6f4ff] via-[#c9e6ff] to-[#a3d8ff] relative overflow-hidden">
      {/* Spline 3D Component - Main Element (Always Centered) */}
      <div
        ref={splineContainerRef}
        className="fixed top-0 left-0 w-full h-full transition-all duration-700 ease-in-out"
        style={{
          opacity: 1 - scrollProgress * 0.3,
          // Keep the 3D element centered
          transform: 'none'
        }}
      >
        <iframe
          src='https://my.spline.design/celestialflowabstractdigitalform-2nM8hCsy0TaSM5J1vbOU9oNX/'
          style={{ border: 'none' }}
          width='100%'
          height='100%'
          className="absolute inset-0"
          title="Celestial Flow Abstract Digital Form"
        ></iframe>
      </div>

      {/* Subtle background gradient for better text visibility */}
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          opacity: 0.7
        }}
      ></div>

      {/* Header - with scroll animation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-3 bg-white/80 backdrop-blur-md shadow-sm' : 'py-4 bg-transparent'
        }`}
        style={{
          transform: `translateY(${scrollProgress > 0.8 ? '-100%' : '0'})`,
        }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <div className="bg-[#3b82f6] rounded-full p-1.5 mr-2 transition-transform group-hover:scale-110">
              <Music size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-[#1e3a8a]">
              SoundLens
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-[#1e3a8a] hover:text-[#3b82f6] transition-colors text-sm font-medium">
              Log In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm shadow-sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Centered on top of Spline with better text visibility */}
      <section className="min-h-screen flex items-center justify-center px-6 relative">
        <div
          ref={heroContentRef}
          className="container mx-auto max-w-6xl relative z-10 transition-all duration-700 ease-out"
          style={{
            transform: `translateY(${scrollProgress * -5}%)`,
            opacity: 1 - scrollProgress * 0.8
          }}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative z-10 max-w-xl mx-auto">
              {/* Hero content with better visibility */}
              <div className="bg-white/30 backdrop-blur-md p-8 rounded-3xl shadow-lg">
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  <span className="text-white drop-shadow-lg">Sound</span>
                  <span className="text-[#22c55e] drop-shadow-lg">Lens</span>
                </h1>

                <p className="text-xl md:text-2xl text-white mb-10 max-w-lg mx-auto leading-relaxed drop-shadow-md font-medium">
                  Discover your music identity and unlock insights about your unique listening journey
                </p>

                <div className="flex justify-center">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="px-8 py-4 text-lg bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-sm rounded-md flex items-center justify-center transition-all"
                    >
                      Get Started <ChevronRight size={20} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content that appears as you scroll */}
      <section
        className="min-h-screen flex items-center px-6 relative"
        style={{
          opacity: Math.min(scrollProgress * 2.5, 1),
          transform: `translateY(${(1 - Math.min(scrollProgress * 2, 1)) * 50}px)`
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 mb-16 md:mb-0 relative z-10">
              {/* Card matching the screenshot exactly */}
              <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-xl max-w-lg mx-auto md:mx-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#1e3a8a]">
                  Discover Your <br />
                  <span className="text-[#3b82f6]">Music Identity</span>
                </h1>

                <p className="text-lg text-[#1e3a8a]/80 mb-8 leading-relaxed">
                  Connect your music streaming services and unlock personalized insights about your unique listening journey.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-base bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-sm rounded-md flex items-center justify-center">
                      Get Started <ChevronRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-3 text-base border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/5 rounded-md">
                      Login with Spotify
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Removed the circular container with music icons */}
            <div className="md:w-1/2"></div>
          </div>
        </div>
      </section>

      {/* Features Section with scroll animations */}
      <section className="py-20 px-6 bg-white/50 relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div
            className="text-center mb-16 transition-all duration-700"
            style={{
              opacity: Math.min((scrollProgress - 0.2) * 3, 1),
              transform: `translateY(${Math.max(1 - (scrollProgress - 0.2) * 3, 0) * 50}px)`
            }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center w-14 h-14 mx-auto bg-[#3b82f6]/10 rounded-full">
                <Sparkles size={28} className="text-[#3b82f6]" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e3a8a]">
              Discover Your Music Flow
            </h2>
            <p className="text-lg text-[#1e3a8a]/70 max-w-2xl mx-auto">
              Unlock powerful insights and visualizations about your music listening habits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - with staggered animation */}
            <div
              className="bg-white/70 p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700 hover:shadow-lg group"
              style={{
                opacity: Math.min((scrollProgress - 0.25) * 3, 1),
                transform: `translateY(${Math.max(1 - (scrollProgress - 0.25) * 3, 0) * 50}px)`
              }}
            >
              <div className="bg-[#3b82f6]/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 size={24} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">Detailed Analytics</h3>
              <p className="text-[#1e3a8a]/70 text-sm leading-relaxed">
                Get deep insights into your listening patterns, favorite genres, and discover new music based on your unique taste profile.
              </p>
            </div>

            {/* Feature 2 - with staggered animation */}
            <div
              className="bg-white/70 p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700 hover:shadow-lg group"
              style={{
                opacity: Math.min((scrollProgress - 0.3) * 3, 1),
                transform: `translateY(${Math.max(1 - (scrollProgress - 0.3) * 3, 0) * 50}px)`
              }}
            >
              <div className="bg-[#3b82f6]/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                <Headphones size={24} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">Multiple Services</h3>
              <p className="text-[#1e3a8a]/70 text-sm leading-relaxed">
                Connect both Spotify and YouTube Music to get a complete, unified picture of your music consumption across platforms.
              </p>
            </div>

            {/* Feature 3 - with staggered animation */}
            <div
              className="bg-white/70 p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700 hover:shadow-lg group"
              style={{
                opacity: Math.min((scrollProgress - 0.35) * 3, 1),
                transform: `translateY(${Math.max(1 - (scrollProgress - 0.35) * 3, 0) * 50}px)`
              }}
            >
              <div className="bg-[#3b82f6]/10 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                <User size={24} className="text-[#3b82f6]" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">Personalized Profile</h3>
              <p className="text-[#1e3a8a]/70 text-sm leading-relaxed">
                Create a detailed profile to get music recommendations that perfectly match your lifestyle, mood, and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with scroll animations */}
      <section className="py-20 px-6 bg-[#f0f9ff] relative">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div
            className="text-center mb-12 transition-all duration-700"
            style={{
              opacity: Math.min((scrollProgress - 0.4) * 3, 1),
              transform: `translateY(${Math.max(1 - (scrollProgress - 0.4) * 3, 0) * 50}px)`
            }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center w-14 h-14 mx-auto bg-[#3b82f6]/10 rounded-full">
                <HelpCircle size={28} className="text-[#3b82f6]" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e3a8a]">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#1e3a8a]/70 max-w-2xl mx-auto">
              Everything you need to know about SoundLens
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 - with staggered animation */}
            <div
              className="bg-white p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.45) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.45) * 3, 0) * -50}px)`
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">What is SoundLens?</h3>
              <p className="text-[#1e3a8a]/70 leading-relaxed">
                SoundLens is an open-source web application that connects to your music streaming services and provides detailed analytics and insights about your listening habits, favorite genres, artists, and more.
              </p>
            </div>

            {/* FAQ Item 2 - with staggered animation */}
            <div
              className="bg-white p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.5) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.5) * 3, 0) * 50}px)`
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">Which music services are supported?</h3>
              <p className="text-[#1e3a8a]/70 leading-relaxed">
                Currently, SoundLens supports Spotify, with plans to add YouTube Music integration in the near future. We're also exploring integration with other popular streaming platforms.
              </p>
            </div>

            {/* FAQ Item 3 - with staggered animation */}
            <div
              className="bg-white p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.55) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.55) * 3, 0) * -50}px)`
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">Is SoundLens free to use?</h3>
              <p className="text-[#1e3a8a]/70 leading-relaxed">
                Yes! SoundLens is completely free and open-source. You can use all features without any cost, and developers can contribute to the project on GitHub.
              </p>
            </div>

            {/* FAQ Item 4 - with staggered animation */}
            <div
              className="bg-white p-6 rounded-xl border border-white/80 shadow-md transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.6) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.6) * 3, 0) * 50}px)`
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-[#1e3a8a]">How is my data handled?</h3>
              <p className="text-[#1e3a8a]/70 leading-relaxed">
                We take privacy seriously. SoundLens only accesses the data you explicitly authorize through the Spotify OAuth process. Your listening data is stored securely and is never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Contribution Section with scroll animations */}
      <section className="py-16 px-6 bg-white relative">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div
              className="md:w-1/2 transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.65) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.65) * 3, 0) * -50}px)`
              }}
            >
              <div className="inline-block mb-4">
                <div className="flex items-center justify-center w-14 h-14 bg-[#3b82f6]/10 rounded-full">
                  <GithubIcon size={28} className="text-[#3b82f6]" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#1e3a8a]">
                Open Source Project
              </h2>
              <p className="text-[#1e3a8a]/70 mb-6 leading-relaxed">
                SoundLens is an open-source project and welcomes contributions from developers of all skill levels. Help us build the best music analytics platform!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://github.com/soundlens/soundlens" target="_blank" rel="noopener noreferrer">
                  <Button size="md" className="px-6 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white shadow-md flex items-center">
                    <GithubIcon size={18} className="mr-2" /> View on GitHub
                  </Button>
                </a>
                <a href="https://github.com/soundlens/soundlens/issues/new" target="_blank" rel="noopener noreferrer">
                  <Button size="md" variant="outline" className="px-6 py-2 border border-[#1e293b] text-[#1e293b] hover:bg-[#1e293b]/5">
                    Report an Issue
                  </Button>
                </a>
              </div>
            </div>
            <div
              className="md:w-1/2 transition-all duration-700"
              style={{
                opacity: Math.min((scrollProgress - 0.7) * 3, 1),
                transform: `translateX(${Math.max(1 - (scrollProgress - 0.7) * 3, 0) * 50}px)`
              }}
            >
              <div className="bg-[#f8fafc] p-6 rounded-xl border border-[#e2e8f0] font-mono text-sm text-[#334155] overflow-hidden">
                <div className="flex items-center mb-4 text-[#64748b]">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444] mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b] mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-[#10b981] mr-2"></div>
                  <span className="ml-2 text-xs">Terminal</span>
                </div>
                <div className="space-y-2">
                  <p><span className="text-[#3b82f6]">$</span> git clone https://github.com/soundlens/soundlens.git</p>
                  <p><span className="text-[#3b82f6]">$</span> cd soundlens</p>
                  <p><span className="text-[#3b82f6]">$</span> npm install</p>
                  <p><span className="text-[#3b82f6]">$</span> npm run dev</p>
                  <p className="text-[#10b981]">✓ Ready on http://localhost:3000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with scroll animations */}
      <section className="py-16 px-6 bg-[#f0f9ff] relative">
        <div
          className="container mx-auto max-w-4xl text-center relative z-10 transition-all duration-700"
          style={{
            opacity: Math.min((scrollProgress - 0.75) * 3, 1),
            transform: `translateY(${Math.max(1 - (scrollProgress - 0.75) * 3, 0) * 50}px)`
          }}
        >
          <div className="inline-block mb-4">
            <div className="flex items-center justify-center w-14 h-14 mx-auto bg-[#3b82f6]/10 rounded-full">
              <Heart size={28} className="text-[#3b82f6]" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e3a8a]">
            Ready to Explore Your Music Identity?
          </h2>
          <p className="text-lg text-[#1e3a8a]/80 mb-8 max-w-2xl mx-auto">
            Connect your Spotify account and discover insights about your listening habits
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3 text-base bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-md">
                Get Started <ChevronRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-base border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/5">
                Login with Spotify
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#e2e8f0] bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-[#3b82f6] rounded-full p-1.5 mr-2">
                <Music size={16} className="text-white" />
              </div>
              <span className="text-base font-bold text-[#1e3a8a]">
                SoundLens
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 mb-6 md:mb-0">
              <a href="#" className="text-[#1e3a8a]/60 hover:text-[#3b82f6] text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-[#1e3a8a]/60 hover:text-[#3b82f6] text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-[#1e3a8a]/60 hover:text-[#3b82f6] text-sm transition-colors">Contact Us</a>
              <a href="https://github.com/soundlens/soundlens" target="_blank" rel="noopener noreferrer" className="text-[#1e3a8a]/60 hover:text-[#3b82f6] text-sm transition-colors flex items-center">
                <GithubIcon size={14} className="mr-1" /> GitHub
              </a>
            </div>

            <div className="text-[#1e3a8a]/60 text-xs">
              &copy; {new Date().getFullYear()} SoundLens - Open Source Project
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

