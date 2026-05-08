import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Dumbbell, Utensils, Users, Settings, LogOut, 
  Search, Bell, Calendar, Plus, Heart, Flame, Timer, 
  ChevronRight, Play, Star, TrendingUp, Filter, CheckCircle2, 
  Pause, Square, ChevronLeft, Trash2, X, Shield, Moon, BellRing, User,
  Save, Eye, EyeOff, Lock, Smartphone, Globe, Sun, Brain as BrainIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [settingsSubView, setSettingsSubView] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [toasts, setToasts] = useState<{id: number, msg: string}[]>([]);
  const [aiInsight, setAiInsight] = useState('Analyzing your data...');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello! I am your FitAI coach. How can I help you reach your goals today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Settings & Theme States
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: '', email: '', weight: '0', height: '0' });
  const [notificationSettings, setNotificationSettings] = useState({ workouts: true, meals: true, community: false });

  // Real App Logic States
  const [isWorkingOut, setIsWorkingOut] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<any>(null);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [consumedMeals, setConsumedMeals] = useState<any[]>([]);
  const [totalCals, setTotalCals] = useState(0);

  const [posts, setPosts] = useState([
    { id: 1, author: 'Athlete_132', time: '2 hours ago', content: 'Just finished the Leg Day Blast program! Feeling like jelly but the AI says my form was 95% accurate today. #FitAI #LegDay', likes: 24, liked: false, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop' },
    { id: 2, author: 'FitnessGuru', time: '5 hours ago', content: 'Morning yoga session complete. Flexibility is improving every day! 🧘‍♂️', likes: 12, liked: true, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop' },
  ]);

  // Auth & Data Initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/auth');
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && parsedUser.id) {
        setUser(parsedUser);
        fetchUserData(parsedUser.id);
        fetchUserLogs(parsedUser.id);
      } else {
        localStorage.removeItem('user');
        navigate('/auth');
      }
    } catch (e) {
      localStorage.removeItem('user');
      navigate('/auth');
    }
  }, []);

  const fetchUserData = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProfile(prev => ({ ...prev, ...data }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchUserLogs = async (userId: number) => {
    try {
      const resDiet = await fetch(`http://localhost:8080/api/diet/${userId}`);
      const resWorkout = await fetch(`http://localhost:8080/api/workout/${userId}`);
      
      if (resDiet.ok) {
        const meals = await resDiet.json();
        setConsumedMeals(meals);
        const total = meals.reduce((acc: number, m: any) => acc + parseInt(m.calories), 0);
        setTotalCals(total);
        generateAiInsight(total, meals.length);
      }
    } catch (err) { console.error(err); }
  };

  const generateAiInsight = (calories: number, mealCount: number) => {
    setIsAiTyping(true);
    setTimeout(() => {
      let insight = "";
      if (calories === 0) insight = "You haven't logged any meals today. AI suggests starting with a protein-rich breakfast!";
      else if (calories < 1200) insight = "You are currently in a high calorie deficit. FitAI recommends 400 more kcal for optimal recovery.";
      else if (calories > 2500) insight = "Calorie intake is high today. FitAI suggests a 45min HIIT session to balance the burn.";
      else insight = "Perfect balance! Your current intake aligns with your metabolic goals. Keep it up!";
      
      setAiInsight(insight);
      setIsAiTyping(false);
    }, 1500);
  };

  // Workout Timer Logic
  useEffect(() => {
    let interval: any;
    if (isWorkingOut && !isPaused) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkingOut, isPaused]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startWorkout = (workout: any) => {
    setActiveWorkout(workout);
    setIsWorkingOut(true);
    setWorkoutTime(0);
    setIsPaused(false);
    addToast(`SESSION STARTED: ${workout.name}`);
  };

  const finishWorkout = async () => {
    const workoutData = {
      exercise: activeWorkout.name,
      reps: activeWorkout.duration,
      date: new Date().toLocaleDateString()
    };

    try {
      await fetch(`http://localhost:8080/api/workout/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });
      setIsWorkingOut(false);
      addToast(`Workout Finished! Saved to log.`);
      setActiveWorkout(null);
    } catch (err) {
      addToast('Error saving workout');
    }
  };

  const addMeal = async (meal: any) => {
    const mealData = {
      meal: meal.name,
      calories: meal.cals,
      date: new Date().toLocaleDateString()
    };

    try {
      const res = await fetch(`http://localhost:8080/api/diet/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealData)
      });
      if (res.ok) {
        setConsumedMeals([mealData, ...consumedMeals]);
        setTotalCals(prev => {
          const newTotal = prev + parseInt(meal.cals);
          generateAiInsight(newTotal, consumedMeals.length + 1);
          return newTotal;
        });
        addToast(`${meal.name} added to your daily log`);
      }
    } catch (err) {
      addToast('Error adding meal');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setAiChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiTyping(true);
    
    setTimeout(() => {
      let response = "That's a great question! Based on your current stats, I recommend focusing on progressive overload and staying hydrated. Would you like a specific plan for that?";
      if (userMsg.toLowerCase().includes('diet')) response = "For your diet, I see you've had " + totalCals + " calories today. Try to keep your protein intake high to support muscle recovery!";
      if (userMsg.toLowerCase().includes('workout')) response = "You've been consistent! Today's AI recommendation is a focused Core and Cardio session.";
      
      setAiChatMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, msg}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handlePost = () => {
    if (!newPostContent.trim()) return;
    const newPost = { id: posts.length + 1, author: userProfile.name + ' (You)', time: 'Just now', content: newPostContent, likes: 0, liked: false, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop' };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    addToast('Post shared successfully!');
  };

  const handleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  const workoutsList = [
    { name: 'Full Body HIIT', duration: '45 min', intensity: 'High', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop' },
    { name: 'Power Yoga', duration: '30 min', intensity: 'Medium', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop' },
    { name: 'Leg Day Blast', duration: '60 min', intensity: 'Elite', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?w=500&auto=format&fit=crop' },
    { name: 'Core Crusher', duration: '20 min', intensity: 'Medium', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop' },
  ];

  const mealsList = [
    { name: 'Oatmeal & Berries', cals: '280', protein: '10g', type: 'Breakfast', image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500&auto=format&fit=crop' },
    { name: 'Avocado Toast', cals: '320', protein: '12g', type: 'Breakfast', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop' },
    { name: 'Boiled Eggs (2)', cals: '155', protein: '13g', type: 'Snack', image: 'https://images.unsplash.com/photo-1582722653844-d0fa6dd9ea42?w=500&auto=format&fit=crop' },
    { name: 'Grilled Chicken', cals: '540', protein: '45g', type: 'Lunch', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop' },
    { name: 'Grilled Salmon', cals: '480', protein: '38g', type: 'Dinner', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop' },
    { name: 'Protein Bowl', cals: '410', protein: '38g', type: 'Dinner', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop' },
    { name: 'Greek Yogurt', cals: '150', protein: '15g', type: 'Snack', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop' },
    { name: 'Protein Shake', cals: '180', protein: '30g', type: 'Post-Workout', image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&auto=format&fit=crop' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Calories', value: totalCals, unit: 'kcal', trend: '+12%', icon: <Flame className="w-5 h-5 text-orange-500" /> },
                { label: 'Steps', value: '8,542', unit: 'steps', trend: '+5%', icon: <Activity className="w-5 h-5 text-blue-500" /> },
                { label: 'Workout Time', value: '45', unit: 'min', trend: '-2%', icon: <Timer className="w-5 h-5 text-indigo-500" /> },
                { label: 'Water', value: '2.4', unit: 'liters', trend: '+18%', icon: <Activity className="w-5 h-5 text-cyan-500" /> },
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-[32px] border shadow-xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-4"><p className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>{stat.icon}</div>
                  <div className="flex items-end gap-2 mb-2"><span className={`text-3xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span><span className="text-gray-500 text-xs font-bold mb-1 uppercase">{stat.unit}</span></div>
                </div>
              ))}
            </div>

            {/* AI Insights Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-6 rounded-[32px] border relative overflow-hidden ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <BrainIcon className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
                  <BrainIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className={`font-black italic uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>FitAI Personal Coach</h3>
              </div>
              <p className={`text-sm font-medium leading-relaxed max-w-2xl ${isDarkMode ? 'text-indigo-200' : 'text-indigo-700'}`}>
                {isAiTyping ? <span className="animate-pulse">Thinking...</span> : aiInsight}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Popular Now</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workoutsList.slice(0, 2).map((w, i) => (
                    <div key={i} className={`relative group rounded-[32px] overflow-hidden aspect-video border ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                      <img src={w.image} className="w-full h-full object-cover opacity-60" alt={w.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                        <h4 className="text-xl font-black italic uppercase text-white">{w.name}</h4>
                        <button onClick={() => startWorkout(w)} className="w-fit p-3 bg-indigo-600 rounded-full hover:scale-110 transition-all shadow-xl"><Play className="w-4 h-4 fill-white" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h2 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Meals</h2>
                <div className="space-y-3">
                  {consumedMeals.length > 0 ? consumedMeals.slice(0, 3).map((m, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                      <img src={m.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      <div><p className={`text-xs font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.name}</p><p className="text-[10px] text-gray-500 font-bold">{m.calories} kcal</p></div>
                    </div>
                  )) : <p className="text-xs text-gray-500 font-bold italic">No meals added today.</p>}
                </div>
              </div>
            </div>
          </>
        );
      case 'workouts':
        return (
          <div className="space-y-8">
            <h2 className={`text-2xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select Your Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutsList.map((w, i) => (
                <div key={i} className={`rounded-[40px] border overflow-hidden group hover:border-indigo-500/50 transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
                  <div className="h-48 overflow-hidden relative"><img src={w.image} className="w-full h-full object-cover opacity-80" alt={w.name} /></div>
                  <div className="p-6">
                    <h4 className={`text-xl font-black italic uppercase mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{w.name}</h4>
                    <button onClick={() => startWorkout(w)} className={`w-full py-3 rounded-xl hover:bg-indigo-600 transition-all text-xs font-black uppercase border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}`}>Start Session</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'nutrition':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h2 className={`text-2xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Food Library</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mealsList.map((m, i) => (
                    <div key={i} className={`flex items-center gap-6 p-4 rounded-[32px] border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-100 hover:shadow-lg shadow-sm'}`}>
                      <img src={m.image} className="w-20 h-20 rounded-2xl object-cover" alt={m.name} />
                      <div className="flex-1">
                        <h4 className={`text-sm font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{m.name}</h4>
                        <p className="text-[10px] text-gray-500 font-bold">{m.cals} kcal</p>
                      </div>
                      <button onClick={() => addMeal(m)} className={`p-3 rounded-xl hover:bg-indigo-600 transition-all hover:text-white ${isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'}`}><Plus size={18}/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`p-8 rounded-[40px] border h-fit ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
                <h2 className={`text-xl font-black italic uppercase mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Daily Log</h2>
                <div className="space-y-4">
                   <div className="flex justify-between items-end mb-6"><div><p className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalCals}</p><p className="text-[10px] text-gray-500 font-bold uppercase">Total Calories</p></div><div className="text-right"><p className="text-xl font-black italic text-indigo-500">2,500</p><p className="text-[10px] text-gray-500 font-bold uppercase">Goal</p></div></div>
                   {consumedMeals.map((m, i) => (
                     <div key={i} className={`flex justify-between items-center py-3 border-b ${isDarkMode ? 'border-white/5 text-white' : 'border-gray-100 text-gray-900'}`}><span className="text-xs font-bold uppercase">{m.meal || m.name}</span><span className="text-xs font-black italic">+{m.calories || m.cals}</span></div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'community':
        return (
          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className={`p-6 rounded-[32px] border flex gap-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-white">{userProfile.name.substring(0,2).toUpperCase()}</div>
              <input type="text" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Share your progress..." className={`flex-1 bg-transparent border-none focus:ring-0 text-sm ${isDarkMode ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`} />
              <button onClick={handlePost} className="px-6 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50" disabled={!newPostContent.trim()}>Post</button>
            </div>
            {posts.map((p) => (
              <div key={p.id} className={`p-8 rounded-[40px] border space-y-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">{p.author.substring(0, 2).toUpperCase()}</div>
                   <div><h5 className={`text-sm font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.author}</h5><p className="text-[10px] text-gray-500 font-bold uppercase">{p.time}</p></div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{p.content}</p>
                <div className="aspect-video rounded-3xl bg-white/10 overflow-hidden shadow-inner"><img src={p.image} className="w-full h-full object-cover opacity-80" alt="" /></div>
                <div className="flex gap-6">
                  <button onClick={() => handleLike(p.id)} className={`flex items-center gap-2 text-xs font-bold transition-all ${p.liked ? 'text-rose-500' : 'text-gray-500 hover:text-indigo-600'}`}><Heart size={16} fill={p.liked ? 'currentColor' : 'none'}/> {p.likes}</button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto text-center py-10">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mx-auto mb-6 shadow-2xl"><div className={`w-full h-full rounded-[38px] flex items-center justify-center text-4xl font-black italic ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-white text-indigo-600'}`}>{userProfile.name.substring(0,2).toUpperCase()}</div></div>
            <h2 className={`text-3xl font-black italic uppercase mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name}</h2>
            <div className={`grid grid-cols-3 gap-6 max-w-lg mx-auto p-8 rounded-[40px] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
               <div><p className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>124</p><p className="text-[10px] text-gray-500 font-bold uppercase">Workouts</p></div>
               <div><p className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8.2k</p><p className="text-[10px] text-gray-500 font-bold uppercase">Followers</p></div>
               <div><p className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24h</p><p className="text-[10px] text-gray-500 font-bold uppercase">Activity</p></div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-8 relative">
            <AnimatePresence mode="wait">
              {settingsSubView === null ? (
                <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className={`text-2xl font-black italic uppercase mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'profile', label: 'Profile Information', icon: <User className="w-5 h-5 text-indigo-500" />, desc: 'Name, email, and fitness metrics' },
                      { id: 'notifications', label: 'Notifications', icon: <BellRing className="w-5 h-5 text-orange-500" />, desc: 'Manage your alerts and reminders' },
                      { id: 'security', label: 'Privacy & Security', icon: <Shield className="w-5 h-5 text-emerald-500" />, desc: 'Password and account security' },
                      { id: 'appearance', label: 'Appearance', icon: <Moon className="w-5 h-5 text-cyan-500" />, desc: 'Switch between dark and light mode' },
                    ].map((s, i) => (
                      <button key={i} onClick={() => setSettingsSubView(s.id)} className={`w-full p-6 rounded-[32px] border flex items-center gap-6 hover:bg-white/10 transition-all text-left group ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>{s.icon}</div>
                        <div className="flex-1"><p className={`text-sm font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{s.label}</p><p className="text-[10px] text-gray-500 font-bold">{s.desc}</p></div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                  <div className={`p-8 rounded-[40px] border mt-12 ${isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-100 shadow-sm'}`}>
                     <h4 className="text-xs font-black italic uppercase text-rose-500 mb-4">Danger Zone</h4>
                     <button onClick={() => addToast('Account deletion requested')} className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-rose-500/20 active:scale-95">Delete Account</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="sub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <button onClick={() => setSettingsSubView(null)} className={`flex items-center gap-2 mb-8 text-xs font-bold uppercase transition-all ${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><ChevronLeft size={16}/> Back</button>
                  
                  {settingsSubView === 'profile' && (
                    <div className="space-y-8">
                      <h3 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h3>
                      <div className="space-y-4">
                         <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-500 ml-4">Full Name</p><input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className={`w-full border rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`} /></div>
                         <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-500 ml-4">Email</p><input type="email" value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} className={`w-full border rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`} /></div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-500 ml-4">Weight (kg)</p><input type="text" value={userProfile.weight} onChange={(e) => setUserProfile({...userProfile, weight: e.target.value})} className={`w-full border rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`} /></div>
                           <div className="space-y-1"><p className="text-[10px] font-black uppercase text-gray-500 ml-4">Height (cm)</p><input type="text" value={userProfile.height} onChange={(e) => setUserProfile({...userProfile, height: e.target.value})} className={`w-full border rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`} /></div>
                         </div>
                         <button onClick={() => { addToast('Profile updated!'); setSettingsSubView(null); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"><Save size={16}/> Save Changes</button>
                      </div>
                    </div>
                  )}

                  {settingsSubView === 'notifications' && (
                    <div className="space-y-8">
                      <h3 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { id: 'workouts', label: 'Workout Reminders', desc: 'Get notified about your scheduled sessions' },
                          { id: 'meals', label: 'Meal Tracking', desc: 'Alerts for breakfast, lunch and dinner logs' },
                          { id: 'community', label: 'Community Social', desc: 'Likes, comments, and follower updates' },
                        ].map((n) => (
                          <div key={n.id} className={`p-6 rounded-[32px] border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div><p className={`text-sm font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{n.label}</p><p className="text-[10px] text-gray-500 font-bold">{n.desc}</p></div>
                            <button 
                              onClick={() => setNotificationSettings({...notificationSettings, [n.id]: !((notificationSettings as any)[n.id])})}
                              className={`w-12 h-6 rounded-full relative transition-all ${(notificationSettings as any)[n.id] ? 'bg-indigo-600' : 'bg-white/10'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${(notificationSettings as any)[n.id] ? 'right-1' : 'left-1'}`}></div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsSubView === 'security' && (
                    <div className="space-y-8">
                      <h3 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security Settings</h3>
                      <div className="space-y-4">
                        <div className={`p-6 rounded-[32px] border space-y-4 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                          <div className="flex items-center gap-4 text-emerald-500 mb-2"><Lock size={18}/> <p className="text-xs font-black uppercase">Change Password</p></div>
                          <input type="password" placeholder="Current Password" className={`w-full border rounded-2xl p-4 text-sm outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-100'}`} />
                          <input type="password" placeholder="New Password" className={`w-full border rounded-2xl p-4 text-sm outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-100'}`} />
                          <button onClick={() => addToast('Password changed successfully!')} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-900 text-white hover:bg-black'}`}>Update Password</button>
                        </div>
                        <div className={`p-6 rounded-[32px] border flex items-center justify-between text-left ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-sm'}`}>
                           <div><p className={`text-sm font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Auth</p><p className="text-[10px] text-gray-500 font-bold">{is2FAEnabled ? 'Enabled via SMS' : 'Disabled'}</p></div>
                           <button 
                             onClick={() => { setIs2FAEnabled(!is2FAEnabled); addToast(`2FA ${is2FAEnabled ? 'Disabled' : 'Enabled'}`); }}
                             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${is2FAEnabled ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
                           >
                             {is2FAEnabled ? 'Disable' : 'Enable'}
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {settingsSubView === 'appearance' && (
                    <div className="space-y-8">
                      <h3 className={`text-xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
                      <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => { setIsDarkMode(true); addToast('Dark mode activated'); }} className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center gap-4 ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500' : 'bg-white border-gray-100'}`}>
                            <Moon size={32} className={isDarkMode ? 'text-indigo-500' : 'text-gray-400'}/>
                            <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>Dark Mode</p>
                         </button>
                         <button onClick={() => { setIsDarkMode(false); addToast('Light mode activated'); }} className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center gap-4 ${!isDarkMode ? 'bg-indigo-600/10 border-indigo-500' : 'bg-white/5 border-white/10'}`}>
                            <Sun size={32} className={!isDarkMode ? 'text-indigo-600' : 'text-gray-500'}/>
                            <p className={`text-xs font-black uppercase tracking-widest ${!isDarkMode ? 'text-indigo-600' : 'text-gray-500'}`}>Light Mode</p>
                         </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isWorkingOut && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#0a0a0c] z-[9999] flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="w-full max-w-xl text-center space-y-12">
               <div className="space-y-2"><span className="text-xs font-black italic uppercase text-indigo-500 tracking-[0.5em]">Live Session</span><h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">{activeWorkout?.name}</h2></div>
               <div className="text-9xl font-black italic tracking-tighter tabular-nums text-white">{formatTime(workoutTime)}</div>
               <div className="grid grid-cols-2 gap-8 py-12 border-y border-white/5">
                 <div><p className="text-4xl font-black italic tracking-tighter text-white">425</p><p className="text-xs font-bold text-gray-500 uppercase">Est. Calories</p></div>
                 <div><p className="text-4xl font-black italic tracking-tighter text-white">148</p><p className="text-xs font-bold text-gray-500 uppercase">Avg Heart Rate</p></div>
               </div>
               <div className="flex justify-center gap-6">
                 <button onClick={() => setIsPaused(!isPaused)} className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95">{isPaused ? <Play className="w-8 h-8 fill-white" /> : <Pause className="w-8 h-8 fill-white" />}</button>
                 <button onClick={finishWorkout} className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-all shadow-2xl active:scale-95"><Square className="w-8 h-8 fill-white" /></button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`min-h-screen flex overflow-hidden font-['Rethink_Sans'] transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-[#f8f9fa] text-gray-900'}`}>
        <div className="fixed bottom-8 right-8 z-[10000] space-y-4 flex flex-col items-end">
          <AnimatePresence>
            {showAiChat && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={`w-80 h-96 rounded-3xl border shadow-2xl flex flex-col overflow-hidden mb-4 ${isDarkMode ? 'bg-[#121214] border-white/10' : 'bg-white border-gray-100'}`}
              >
                <div className="p-4 border-b border-white/5 bg-indigo-600 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BrainIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-black italic uppercase text-white">FitAI Coach</span>
                  </div>
                  <button onClick={() => setShowAiChat(false)}><X className="w-4 h-4 text-white" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {aiChatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : (isDarkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-700')}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && <div className="flex justify-start"><div className={`p-3 rounded-2xl text-xs font-medium bg-white/5 text-gray-500 animate-pulse`}>AI is typing...</div></div>}
                </div>
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/5">
                  <input 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask FitAI anything..." 
                    className={`w-full bg-transparent border-none focus:ring-0 text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowAiChat(!showAiChat)}
            className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-all group"
          >
            <BrainIcon className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" />
          </button>
          <AnimatePresence>{toasts.map(t => (<motion.div key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl shadow-2xl border border-white/10"><CheckCircle2 size={18}/><span className="text-xs font-black uppercase italic tracking-wider">{t.msg}</span></motion.div>))}</AnimatePresence>
        </div>

        <aside className={`w-64 border-r flex flex-col p-6 hidden md:flex transition-colors duration-500 ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-gray-200 bg-white shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={() => { setActiveView('dashboard'); setSettingsSubView(null); }}>
            <div className="p-2 rounded-xl bg-indigo-600"><Activity className="w-6 h-6 text-white" /></div>
            <span className={`text-2xl font-black tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FitAI</span>
          </div>
          <nav className="flex-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-5 h-5" /> },
              { id: 'workouts', label: 'Workouts', icon: <Dumbbell className="w-5 h-5" /> },
              { id: 'nutrition', label: 'Nutrition', icon: <Utensils className="w-5 h-5" /> },
              { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" /> },
            ].map((item) => (
              <button 
                key={item.id} onClick={() => { setActiveView(item.id); setSettingsSubView(null); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          <div className={`pt-6 border-t space-y-2 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <button onClick={() => { setActiveView('settings'); setSettingsSubView(null); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === 'settings' ? 'bg-indigo-600 text-white' : isDarkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Settings className="w-5 h-5" /> Settings
            </button>
            <button onClick={() => { localStorage.removeItem('user'); navigate('/auth'); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-all text-sm font-bold"><LogOut className="w-5 h-5" /> Logout</button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto relative">
          <header className="flex justify-between items-center mb-12">
            <div><h1 className={`text-3xl font-black tracking-tight mb-1 uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeView.toUpperCase()}</h1><p className="text-gray-500 text-sm font-medium italic">Welcome back, {userProfile.name}.</p></div>
            <div className="flex items-center gap-4 relative">
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className={`p-3 rounded-xl border relative transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500 shadow-sm'}`}><Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></span></button>
                <AnimatePresence>{showNotifications && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute top-12 right-0 w-80 p-4 border rounded-2xl shadow-2xl z-[100] backdrop-blur-xl ${isDarkMode ? 'bg-[#121214]/90 border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}><h5 className="text-xs font-black uppercase mb-4 tracking-widest italic border-b border-white/5 pb-2">Recent Notifications</h5><div className="space-y-3"><div className={`p-3 rounded-xl text-[10px] font-bold ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}><p className="text-indigo-400 mb-1">New Peak Performance!</p><p className="text-gray-400">You crushed your 5k personal record today.</p></div><div className={`p-3 rounded-xl text-[10px] font-bold ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}><p className="text-emerald-400 mb-1">Community Milestone</p><p className="text-gray-400">Your last post reached 100 likes.</p></div></div></motion.div>)}</AnimatePresence>
              </div>
              <div className="relative">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] hover:scale-105 transition-all active:scale-95 shadow-lg"><div className={`w-full h-full rounded-[10px] flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-white text-indigo-600'}`}>{userProfile.name.substring(0,2).toUpperCase()}</div></button>
                <AnimatePresence>{showProfileMenu && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`absolute top-12 right-0 w-48 p-2 border rounded-2xl shadow-2xl z-[100] backdrop-blur-xl ${isDarkMode ? 'bg-[#121214]/90 border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}><button onClick={() => { setActiveView('profile'); setShowProfileMenu(false); }} className={`w-full text-left p-3 text-[10px] font-black uppercase rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>Profile</button><button onClick={() => { setActiveView('dashboard'); setShowProfileMenu(false); }} className={`w-full text-left p-3 text-[10px] font-black uppercase rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>My Stats</button><button onClick={() => { localStorage.removeItem('user'); navigate('/auth'); }} className="w-full text-left p-3 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">Logout</button></motion.div>)}</AnimatePresence>
              </div>
            </div>
          </header>
          <AnimatePresence mode="wait"><motion.div key={activeView + isDarkMode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderContent()}
          </motion.div></AnimatePresence>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
