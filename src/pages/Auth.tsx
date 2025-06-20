import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [isNextVideoReady, setIsNextVideoReady] = useState(false);

  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Sample video URLs from showcase - using actual video sources
  const showcaseVideos = [
    {
      url: '/beauty brand.mov',
      startTime: 0
    },
    {
      url: '/sodaCommercial.mp4',
      startTime: 0
    },
    {
      url: '/NasaCommercialSaveNasa.mp4',
      startTime: 0
    },
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      startTime: 0
    }
  ];

  // Handle video switching only when next video is ready
  const switchToNextVideo = () => {
    if (isNextVideoReady) {
      const newCurrentIndex = nextVideoIndex;
      const newNextIndex = (nextVideoIndex + 1) % showcaseVideos.length;

      setCurrentVideoIndex(newCurrentIndex);
      setNextVideoIndex(newNextIndex);
      setIsNextVideoReady(false);
    }
  };

  // Initialize next video index properly
  useEffect(() => {
    const newNextIndex = (currentVideoIndex + 1) % showcaseVideos.length;
    setNextVideoIndex(newNextIndex);
    setIsNextVideoReady(false);
  }, [currentVideoIndex, showcaseVideos.length]);

  // Auto-rotate videos every 3 seconds, but only if next video is ready
  useEffect(() => {
    const interval = setInterval(() => {
      switchToNextVideo();
    }, 3000);

    return () => clearInterval(interval);
  }, [isNextVideoReady, nextVideoIndex, currentVideoIndex]);

  // Handle when next video is ready to play
  const handleNextVideoReady = () => {
    setIsNextVideoReady(true);
  };

  // Handle video loaded and set start time
  const handleVideoLoaded = (videoElement: HTMLVideoElement, videoIndex: number) => {
    const video = showcaseVideos[videoIndex];
    if (video.startTime > 0) {
      // Wait for video to be ready before setting start time
      const setStartTime = () => {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          videoElement.currentTime = video.startTime;

        } else {
          // Wait a bit more and try again
          setTimeout(setStartTime, 100);
        }
      };
      setStartTime();
    }
  };

  // Handle video errors
  const handleVideoError = (videoIndex: number) => {
    console.error(`Video ${videoIndex} failed to load: ${showcaseVideos[videoIndex].url}`);
    // If next video fails to load, mark it as ready anyway to continue rotation
    if (videoIndex === nextVideoIndex) {
      console.log(`Marking failed video ${videoIndex} as ready to continue rotation`);
      setIsNextVideoReady(true);
    }
  };

  // Force video rotation if stuck (fallback mechanism)
  useEffect(() => {
    const forceRotationTimer = setTimeout(() => {
      if (!isNextVideoReady) {
        setIsNextVideoReady(true);
      }
    }, 5000); // Wait 5 seconds max for next video to load

    return () => clearTimeout(forceRotationTimer);
  }, [currentVideoIndex, nextVideoIndex, isNextVideoReady]);

  // Authentication handlers
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(signInData.email, signInData.password);

      if (error) {
        console.error('Sign in error:', error);

        // Provide specific error messages
        if (error.message.includes('Invalid login credentials')) {
          alert('Invalid email or password. Please check your credentials or sign up if you don\'t have an account.');
        } else if (error.message.includes('Email not confirmed')) {
          alert('Please check your email and click the confirmation link before signing in.');
        } else {
          alert(`Sign in failed: ${error.message}`);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Unexpected sign in error:', err);
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        name: signUpData.name
      });

      if (error) {
        console.error('Sign up error:', error);
        // Error is already handled by AuthContext with toast
      } else {
        // Check if email confirmation is required
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is immediately signed in (email confirmation disabled)
          navigate('/dashboard');
        } else {
          // Email confirmation required - show message
          alert('Please check your email and click the confirmation link to complete registration.');
        }
      }
    } catch (err) {
      console.error('Unexpected sign up error:', err);
    }

    setIsLoading(false);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Google auth error:', error);
      }
    } catch (err) {
      console.error('Unexpected Google auth error:', err);
    }

    setIsLoading(false);
  };

  // Test function to check Supabase connection
  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Supabase session test:', { data, error });
    } catch (err) {
      console.error('Supabase connection test failed:', err);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex overflow-hidden">
      {/* Left Side - Video Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 z-10"></div>
        
        {/* Full Screen Video Container */}
        <div className="relative w-full h-full z-20">
          {/* Video Display - Full Screen */}
          <div className="relative w-full h-full">
            {/* Current Video */}
            <video
              key={`current-${currentVideoIndex}`}
              src={showcaseVideos[currentVideoIndex].url}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onLoadedData={(e) => handleVideoLoaded(e.target as HTMLVideoElement, currentVideoIndex)}
              onCanPlay={(e) => handleVideoLoaded(e.target as HTMLVideoElement, currentVideoIndex)}
              onError={() => handleVideoError(currentVideoIndex)}
            />

            {/* Next Video - Hidden but preloading */}
            {nextVideoIndex < showcaseVideos.length && (
              <video
                key={`next-${nextVideoIndex}`}
                src={showcaseVideos[nextVideoIndex].url}
                muted
                loop
                preload="auto"
                onCanPlayThrough={handleNextVideoReady}
                onLoadedData={(e) => handleVideoLoaded(e.target as HTMLVideoElement, nextVideoIndex)}
                onCanPlay={(e) => handleVideoLoaded(e.target as HTMLVideoElement, nextVideoIndex)}
                onError={() => handleVideoError(nextVideoIndex)}
                className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
              />
            )}

            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>

            {/* Video Info */}
            <div className="absolute bottom-8 left-8 text-white z-30">
              <p className="text-lg font-semibold mb-1">AI-Generated Video Ad</p>
              <p className="text-sm text-white/80">Sample {currentVideoIndex + 1} of {showcaseVideos.length}</p>
            </div>

            {/* Video Indicators - Overlay */}
            <div className="absolute bottom-8 right-8 flex gap-2 z-30">
              {showcaseVideos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentVideoIndex ? 'bg-primary w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Showcase Text - Overlay */}
            <div className="absolute top-8 left-8 text-white z-30">
              <h2 className="text-2xl font-bold mb-2">
                See AI Video Creation in Action
              </h2>
              <p className="text-white/90 text-base max-w-md">
                Watch real examples of AI-generated video ads created for businesses like yours
              </p>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Auth Card */}
          <Card className="bg-gray-900/90 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
                <p className="text-gray-400">Sign in to your account or create a new one</p>
              </div>

              {/* Auth Tabs */}
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                  <TabsTrigger value="signin" className="text-white data-[state=active]:bg-primary">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-white data-[state=active]:bg-primary">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-6 mt-6">
                  {/* Google Sign In */}
                  <Button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">Or continue with email</span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                        required
                        className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        required
                        className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <button className="text-primary hover:text-primary/80 text-sm font-medium">
                      Forgot your password?
                    </button>
                  </div>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-6 mt-6">
                  {/* Google Sign Up */}
                  <Button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">Or create account with email</span>
                    </div>
                  </div>

                  {/* Sign Up Form */}
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                        required
                        className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        required
                        className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required
                        className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Sign Up Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>

                  {/* Terms */}
                  <p className="text-xs text-gray-400 text-center">
                    By creating an account, you agree to our{' '}
                    <button className="text-primary hover:text-primary/80">Terms of Service</button>
                    {' '}and{' '}
                    <button className="text-primary hover:text-primary/80">Privacy Policy</button>
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
