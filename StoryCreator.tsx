import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Slider } from '../components/ui/slider';

const StoryCreator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [duration, setDuration] = useState('60');
  const [language, setLanguage] = useState('english');
  const [voiceStyle, setVoiceStyle] = useState('Friendly');
  const [storyType, setStoryType] = useState('ai-prompt');
  const [addHook, setAddHook] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [sceneLimit, setSceneLimit] = useState(5);
  const [maxSceneLimit, setMaxSceneLimit] = useState(10);
  
  useEffect(() => {
    // Check for active session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getSession();
  }, []);
  
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan_id')
          .eq('id', user.id)
          .single();
        
        if (!profile) return;
        
        const planId = (profile as any).subscription_plan_id || 'free';
        
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single();
          
        if (plan) {
          setUserPlan(plan);
          setMaxSceneLimit(plan.max_scene_count);
          setSceneLimit(Math.max(5, Math.floor(plan.max_scene_count / 2)));
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };
    
    fetchUserPlan();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/refine-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          storyContent,
          settings: {
            emotion,
            duration: parseInt(duration),
            language,
            voiceStyle,
            addHook,
            isManualInput: storyType === 'manual-input',
            userSelectedSceneLimit: sceneLimit
          }
        })
      });
      
      // Handle response
      if (response.ok) {
        const data = await response.json();
        navigate('/review-story', { state: { data } });
      } else {
        console.error('Error refining story');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Scene Limit</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Choose how many scenes your story should have (max {maxSceneLimit} for your plan)
        </p>
        
        <div className="flex items-center gap-4">
          <div className="w-full">
            <Slider
              value={[sceneLimit]}
              min={2}
              max={maxSceneLimit}
              step={1}
              onValueChange={(value) => setSceneLimit(value[0])}
            />
          </div>
          <div className="w-12 text-center font-medium">
            {sceneLimit}
          </div>
        </div>
        
        {userPlan && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Your {userPlan.name} plan allows up to {maxSceneLimit} scenes per story
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Add form fields for other properties here */}
        <button 
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default StoryCreator; 