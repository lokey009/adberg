import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  VideoIcon, Clock, Languages, Music, Mic, Heart, 
  ArrowRight, Sparkles, Volume2, Anchor, Smile, Frown,
  FlameIcon, Zap, DumbbellIcon, Eye, Star, HeartHandshake, Coffee,
  Settings, Wand2, Lock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/theme';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/auth';

const emotions = [
  { name: 'Happy', color: '#FFD166', icon: <Smile className="h-3 w-3" /> },
  { name: 'Sad', color: '#118AB2', icon: <Frown className="h-3 w-3" /> },
  { name: 'Anger', color: '#EF476F', icon: <FlameIcon className="h-3 w-3" /> },
  { name: 'Fear', color: '#6B6B6B', icon: <Eye className="h-3 w-3" /> },
  { name: 'Surprise', color: '#06D6A0', icon: <Zap className="h-3 w-3" /> },
  { name: 'Love', color: '#E26CA5', icon: <Heart className="h-3 w-3" /> },
  { name: 'Wonder', color: '#3A86FF', icon: <Star className="h-3 w-3" /> },
  { name: 'Calm', color: '#8A6552', icon: <Coffee className="h-3 w-3" /> }
];

const storyPromptExamples = [
  "A curious fish explores the ocean beyond his coral reef",
  "Explain how climate change affects global ecosystems",
  "The history of artificial intelligence in 5 key moments",
  "A visual guide to the solar system and its planets",
  "How smartphones have evolved over the past decade",
  "A journey through the human digestive system",
  "Two siblings discover a magical door in their backyard"
];

// Add a throttle utility function at the top of the file after imports
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

// Helper function to get scene limit based on plan type
const getSceneLimitByPlan = (planId) => {
  // Hardcoded scene limits as specified
  switch (planId) {
    case 'free':
      return 3;
    case 'basic':
      return 5;
    case 'pro':
      return 10;
    case 'business':
      return 15;
    default:
      return 3; // Default to free plan limit
  }
};

// Add CSS for custom slider style
const getSliderColor = (maxLimit) => {
  switch (maxLimit) {
    case 3: return 'bg-gray-400 dark:bg-gray-600'; // Free Plan
    case 5: return 'bg-blue-400 dark:bg-blue-600'; // Basic Plan
    case 10: return 'bg-purple-400 dark:bg-purple-600'; // Pro Plan
    case 15: return 'bg-green-400 dark:bg-green-600'; // Business Plan
    default: return 'bg-gray-400 dark:bg-gray-600';
  }
};

const StoryBuilder = React.memo(() => {
  const navigate = useNavigate();
  const [storyInput, setStoryInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [language, setLanguage] = useState('english');
  const [voiceStyle, setVoiceStyle] = useState('Narrative');
  const [duration, setDuration] = useState('60');
  const [currentExample, setCurrentExample] = useState(0);
  const [addHook, setAddHook] = useState(true);
  const { theme } = useTheme();
  
  // Add state for shake animation
  const [isShaking, setIsShaking] = useState(false);
  
  // Add state to control tab selection
  const [activeTab, setActiveTab] = useState("generate");
  
  // Add scene limit states
  const [sceneLimit, setSceneLimit] = useState(3); // Default to free plan limit
  const [displaySceneLimit, setDisplaySceneLimit] = useState(3); // State for immediate display
  const [maxSceneLimit, setMaxSceneLimit] = useState(3); // Default to free plan limit
  const [userPlan, setUserPlan] = useState(null);
  
  // Add a state to track if user is scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef(null);
  
  // Add animation style for the shake effect
  useEffect(() => {
    // Add shake animation to the document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
        100% { transform: translateX(0); }
      }
      .animate-shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Fetch user's subscription plan to get max scene limit
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        // Get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Get user profile with subscription plan ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan_id')
          .eq('id', user.id)
          .single();
        
        if (!profile) return;
        
        // Default to free plan if no plan is set
        const planId = (profile as any).subscription_plan_id || 'free';
        
        // Set max scene limit based on user's plan using the helper function
        const sceneLimitForPlan = getSceneLimitByPlan(planId);
        setMaxSceneLimit(sceneLimitForPlan);
        
        // Set initial scene limit to the same value (user can adjust down if needed)
        setSceneLimit(sceneLimitForPlan);
        setDisplaySceneLimit(sceneLimitForPlan);
        
        // Get the plan details for additional info
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (plan) {
          setUserPlan({
            ...plan,
            max_scene_count: sceneLimitForPlan // Override with our hardcoded value
          });
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };
    
    fetchUserPlan();
  }, []);
  
  const handleContinue = useCallback(() => {
    // Prepare the data to be sent to the next view
    const storyData = {
      storyType: activeTab === 'manual' ? 'manual' : 'ai-prompt',
      storyContent: activeTab === 'manual' ? storyInput : promptInput,
      user_prompt: promptInput, // Always store the original prompt if available
      settings: {
        emotion: selectedEmotion,
        language,
        voiceStyle,
        duration: parseInt(duration),
        addHook,
        // Add a flag for manual input to use a different prompt template
        isManualInput: activeTab === 'manual',
        // Scene limit user selected based on their plan
        sceneLimit: sceneLimit,
        // Include plan info for context
        maxSceneLimit: maxSceneLimit,
        planType: (() => {
          switch(maxSceneLimit) {
            case 3: return 'free';
            case 5: return 'basic';
            case 10: return 'pro';
            case 15: return 'business';
            default: return 'custom';
          }
        })()
      },
      timestamp: new Date().toISOString()
    };
    
    // Log the data as formatted JSON
    console.log('Data being sent to Story Refinement:');
    console.log(JSON.stringify(storyData, null, 2));
    
    // Pass the data to the next view using React Router's state
    navigate('/review-story', { state: { storyData } });
  }, [promptInput, storyInput, selectedEmotion, language, voiceStyle, duration, addHook, navigate, sceneLimit, maxSceneLimit, activeTab]);
  
  // Cycle through prompt examples for the placeholder
  // Only if user hasn't entered any text
  useEffect(() => {
    if (promptInput.length === 0) {
      const interval = setInterval(() => {
        setCurrentExample((prev) => (prev + 1) % storyPromptExamples.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promptInput]);
  
  // Optimize emotion buttons to prevent unnecessary re-renders
  const emotionButtons = useMemo(() => (
    <div className="flex flex-wrap gap-2">
      {emotions.map((emotion) => (
        <button
          key={emotion.name}
          type="button"
          onClick={() => setSelectedEmotion(emotion.name)}
          className={`px-3 py-2 rounded-full text-sm ${
            selectedEmotion === emotion.name
              ? theme === 'dark'
                ? 'bg-gray-700 text-white font-medium shadow-md'
                : 'bg-gray-800 text-white font-medium shadow-md'
              : theme === 'dark'
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: emotion.color }}
            />
            <span>{emotion.name}</span>
          </div>
        </button>
      ))}
    </div>
  ), [selectedEmotion, setSelectedEmotion, theme]);
  
  // Enhance scroll optimization - pause animations during scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!isScrolling) {
        setIsScrolling(true);
      }
      
      // Clear previous timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      
      // Set a timer to turn off isScrolling state after scrolling stops
      scrollTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }, 50); // Reduced throttle time for more responsive handling

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Set CSS optimizations for smoother scrolling
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'auto';
      // Add GPU acceleration for the entire page
      document.body.style.transform = 'translateZ(0)';
    }
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.style.scrollBehavior = '';
        document.body.style.transform = '';
      }
    };
  }, [isScrolling]);
  
  // Add function to trigger shake animation
  const handleManualTabClick = (e) => {
    e.preventDefault(); // Prevent actual tab change
    e.stopPropagation(); // Stop event bubbling to prevent tab change
    
    if (!isShaking) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container-custom py-16">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden">
          <motion.div 
            animate={{ 
              y: [0, -25, 0],
              opacity: [0.08, 0.15, 0.08]
            }} 
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-10 w-96 h-96 rounded-full bg-pixar-orange/20 blur-3xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 25, 0],
              opacity: [0.07, 0.12, 0.07]
            }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-10 w-[500px] h-[500px] rounded-full bg-pixar-blue/20 blur-3xl"
          />
        </div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`inline-block mb-3 px-4 py-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 shadow-lg backdrop-blur-sm border border-gray-700' : 'bg-white shadow-lg backdrop-blur-sm border border-pixar-blue/10'}`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-pixar-purple" />
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Create Your Content</span>
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 pixar-text-gradient tracking-tight">
              Content Builder
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-muted-foreground'} max-w-xl`}>
              Craft your content with our intuitive editor or AI-powered generator
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area - 8 columns */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className={`${theme === 'dark' ? 'border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg' : 'border-pixar-blue/10 bg-white/80 backdrop-blur-sm shadow-lg'}`}>
              <CardHeader className={`${theme === 'dark' ? 'border-b border-gray-700 bg-gradient-to-r from-gray-800/80 to-transparent' : 'border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-transparent'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${theme === 'dark' ? 'bg-pixar-blue/20' : 'bg-pixar-blue/5'} rounded-lg`}>
                      <VideoIcon className="h-5 w-5 text-pixar-blue" />
                    </div>
                    <div>
                      <CardTitle className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : ''}`}>Content Creation</CardTitle>
                      <CardDescription className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Choose your preferred method to create your content
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs 
                  value={activeTab}
                  className="w-full"
                  onValueChange={(value) => {
                    // Prevent switching to manual tab only for free users
                    if (value === "manual" && maxSceneLimit === 3) {
                      return false;
                    }
                    setActiveTab(value);
                  }}
                >
                  <TabsList className={`grid w-full grid-cols-2 ${theme === 'dark' ? 'bg-gray-700/80' : 'bg-gray-100/80'} p-1 rounded-lg h-11`}>
                    <TabsTrigger 
                      value="generate" 
                      className={`rounded-md transition-all ${theme === 'dark' ? 'ring-offset-gray-900 data-[state=active]:bg-gray-600 data-[state=active]:text-pixar-blue data-[state=active]:shadow-sm' : 'ring-offset-white data-[state=active]:bg-white data-[state=active]:text-pixar-blue data-[state=active]:shadow-sm'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-medium">AI Content Generator</span>
                      </div>
                    </TabsTrigger>
                    
                    {maxSceneLimit === 3 ? (
                      // Free plan users get the locked version
                      <div 
                        role="button"
                        onClick={handleManualTabClick}
                        className={`rounded-md transition-all flex items-center justify-center h-11 ${isShaking ? 'animate-shake' : ''} ${theme === 'dark' ? 'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed' : 'bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium">Write Manually</span>
                          <Lock className="h-3 w-3 ml-1" />
                        </div>
                      </div>
                    ) : (
                      // Premium users get access to the manual tab
                      <TabsTrigger 
                        value="manual" 
                        className={`rounded-md transition-all ${theme === 'dark' ? 'ring-offset-gray-900 data-[state=active]:bg-gray-600 data-[state=active]:text-pixar-blue data-[state=active]:shadow-sm' : 'ring-offset-white data-[state=active]:bg-white data-[state=active]:text-pixar-blue data-[state=active]:shadow-sm'}`}
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium">Write Manually</span>
                        </div>
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="generate" className="mt-6 outline-none">
                    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-pixar-blue/10 to-pixar-purple/10 rounded-xl p-6 border border-gray-700 shadow-sm' : 'bg-gradient-to-br from-pixar-blue/5 to-pixar-purple/5 rounded-xl p-6 border border-pixar-blue/10 shadow-sm'}`}>
                      <h3 className="font-semibold text-pixar-blue flex items-center mb-3 text-lg">
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI Content Generator
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} mb-6`}>
                        Enter a simple prompt and let our AI create content for you - stories, explanations, or presentations.
                      </p>

                      <div className="space-y-5">
                        <div>
                          <Label htmlFor="story-prompt" className={`text-sm font-medium mb-2 block ${theme === 'dark' ? 'text-gray-300' : ''}`}>Your Content Idea</Label>
                          <Input
                            id="story-prompt"
                            value={promptInput}
                            onChange={(e) => setPromptInput(e.target.value)}
                            placeholder={storyPromptExamples[currentExample]}
                            className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-pixar-blue text-gray-200' : 'border-pixar-blue/20 focus:border-pixar-blue'} transition-all duration-300 shadow-sm text-base`}
                          />
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'} mt-2`}>
                            Example: "{storyPromptExamples[currentExample]}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-2">
                      <div className={`flex items-start p-4 rounded-xl ${theme === 'dark' ? 'bg-amber-900/20 border border-amber-800/50' : 'bg-amber-50 border border-amber-100'}`}>
                        <Wand2 className="h-6 w-6 text-pixar-orange mr-3 mt-0.5 flex-shrink-0" />
                        <p className={`text-sm ${theme === 'dark' ? 'text-amber-200' : 'text-gray-700'}`}>
                          Our AI will transform your prompt into complete content with visuals, narrative, and structure ready for animation.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4 mt-2">
                    <div>
                      <Label htmlFor="manual-story" className={`flex items-center text-lg mb-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                        <Heart className="mr-2 h-5 w-5 text-pixar-red" />
                        Your Content
                      </Label>
                      <div className={`p-4 rounded-lg mb-3 ${theme === 'dark' ? 'bg-pixar-blue/10 border border-pixar-blue/30' : 'bg-pixar-blue/5 border border-pixar-blue/20'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Write or paste any content you'd like to transform - a story, blog post, article, or any text. We'll preserve your original content while adapting it to an animation-friendly format.
                        </p>
                      </div>
                      <Textarea 
                        id="manual-story" 
                        placeholder="Start writing or paste your content here..." 
                        className={`min-h-[300px] mt-1.5 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-pixar-blue text-gray-200' : 'border-pixar-blue/20 focus:border-pixar-blue'} shadow-sm text-base`}
                        value={storyInput}
                        onChange={(e) => setStoryInput(e.target.value)}
                      />
                      <div className="flex justify-between items-center mt-3">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          Add specific details for better visualization and animation.
                        </p>
                        <Badge variant="secondary" className={`${theme === 'dark' ? 'bg-pixar-blue/20' : 'bg-pixar-blue/10'} text-pixar-blue`}>
                          {storyInput.length} characters
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button 
              onClick={handleContinue} 
              disabled={activeTab === 'generate' ? !promptInput : !storyInput}
              className="w-full bg-gradient-to-r from-pixar-blue to-pixar-purple text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate story
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Settings Panel - 4 columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className={`${theme === 'dark' ? 'border-gray-700 bg-gray-800/80 backdrop-blur-sm shadow-lg' : 'border-pixar-blue/10 bg-white/80 backdrop-blur-sm shadow-lg'} sticky top-24`}>
              <CardHeader className={`${theme === 'dark' ? 'border-b border-gray-700 bg-gradient-to-r from-gray-800/80 to-transparent' : 'border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${theme === 'dark' ? 'bg-pixar-blue/20' : 'bg-pixar-blue/5'} rounded-lg`}>
                    <Settings className="h-5 w-5 text-pixar-blue" />
                  </div>
                  <div>
                    <CardTitle className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : ''}`}>Content Settings</CardTitle>
                    <CardDescription className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Customize your content's characteristics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Scene Limit Selector */}
                {userPlan && (
                  <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50/70 to-white/70 dark:from-gray-800/70 dark:to-gray-900/70 rounded-lg border border-gray-100 dark:border-gray-700/80 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sceneLimit" className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                        <Settings className="h-4 w-4 text-pixar-orange" />
                        Scene Count
                      </Label>
                      <Badge variant="secondary" className="font-mono text-sm bg-pixar-blue/10 text-pixar-blue dark:bg-pixar-blue/20 dark:text-pixar-blue/80">
                        {displaySceneLimit} / {maxSceneLimit}
                      </Badge>
                    </div>
                    <div className="relative">
                      <Slider
                        id="sceneLimit"
                        min={1} 
                        max={maxSceneLimit}
                        step={1}
                        value={[sceneLimit]} // Controlled by the main state
                        onValueChange={(newValue) => {
                          setDisplaySceneLimit(newValue[0]); // Update display immediately
                          setSceneLimit(newValue[0]);
                        }}
                        className={`w-full ${displaySceneLimit === maxSceneLimit ? 'data-[state=active]:accent-pixar-orange' : ''}`}
                        aria-label={`Select scene limit between 1 and ${maxSceneLimit}`}
                      />
                      {/* Custom plan indicator */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div 
                          className={`h-1 rounded-full ${getSliderColor(maxSceneLimit)} opacity-20`}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Min: 1</span>
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-gray-600 dark:text-gray-300 mb-1">
                          {maxSceneLimit} scenes max
                        </span>
                        <span className="bg-pixar-blue/10 dark:bg-pixar-blue/20 text-pixar-blue/80 rounded-full px-2 py-0.5 text-xs">
                          {(() => {
                            switch (maxSceneLimit) {
                              case 3: return 'Free Plan';
                              case 5: return 'Basic Plan';
                              case 10: return 'Pro Plan';
                              case 15: return 'Business Plan';
                              default: return 'Custom Plan';
                            }
                          })()}
                        </span>
                      </div>
                      <span>Max: {maxSceneLimit}</span>
                    </div>
                  </div>
                )}
                
                {/* Language */}
                <div>
                  <Label htmlFor="language" className={`flex items-center font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                    <Languages className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    Language
                  </Label>
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Voice Style */}
                <div>
                  <Label htmlFor="voice-style" className={`flex items-center font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                    <Volume2 className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    Voice Style
                  </Label>
                  <Select
                    value={voiceStyle}
                    onValueChange={setVoiceStyle}
                  >
                    <SelectTrigger className="w-full" id="voice-style">
                      <SelectValue placeholder="Select voice style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Conversational">Conversational</SelectItem>
                      <SelectItem value="Friendly">Friendly</SelectItem>
                      <SelectItem value="Narrative">Narrative</SelectItem>
                      <SelectItem value="Documentary">Documentary</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Emotion Selection */}
                <div>
                  <Label className={`block mb-3 flex items-center font-medium ${theme === 'dark' ? 'text-gray-300' : ''}`}>
                    <Heart className="mr-2 h-4 w-4 text-pixar-red" />
                    Primary Emotion
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.name}
                        type="button"
                        onClick={() => setSelectedEmotion(emotion.name)}
                        className={`min-w-[80px] h-9 rounded-lg text-sm flex items-center justify-center transition-all duration-200 ${
                          selectedEmotion === emotion.name
                            ? 'bg-pixar-blue text-white shadow-sm'
                            : theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 px-2">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: emotion.color }}
                          />
                          <span>{emotion.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hook Option */}
                <div className={`flex items-center justify-between p-4 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-pixar-blue/10 to-transparent border border-gray-700'
                    : 'bg-gradient-to-r from-pixar-blue/5 to-transparent border border-pixar-blue/10'
                }`}>
                  <div className="space-y-0.5">
                    <Label className={`text-base flex items-center font-medium ${theme === 'dark' ? 'text-gray-200' : ''}`}>
                      <Anchor className="mr-2 h-4 w-4 text-pixar-blue" />
                      Attention Hook
                    </Label>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
                      Add an engaging intro
                    </p>
                  </div>
                  <Switch
                    checked={addHook}
                    onCheckedChange={setAddHook}
                    className="data-[state=checked]:bg-pixar-blue"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
});

export default StoryBuilder;