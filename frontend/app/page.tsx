// app/frontend/app/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';

// Define types for the API response
interface GenerationResult {
  user_id: string;
  keyword: string;
  use_varied_fonts: boolean;
  generated_html: string[];
  generated_snapshots: string[];
  html_count: number;
  snapshot_count: number;
  pages_dir: string;
  snapshots_dir: string;
  images_dir: string;
  video_dir: string;
  video_path: string;
  video_url: string;
  timestamp: string;
  status: string;
}

export default function HomePage() {
  const [formData, setFormData] = useState({
    keyword: '',
    numPages: 25,
    duration: 0.15,
    useVariedFonts: true
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'generating_html' | 'taking_screenshots' | 'creating_video' | 'complete'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'range' ? parseFloat(value) : value
    });
  };

  // Simulate progress for loading bar
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(timer);
            return 100;
          }
          
          // Update stage based on progress
          if (oldProgress < 30) {
            setStage('generating_html');
          } else if (oldProgress < 70) {
            setStage('taking_screenshots');
          } else if (oldProgress < 95) {
            setStage('creating_video');
          } else {
            setStage('complete');
          }
          
          // Increment progress
          const increment = Math.random() * 3 + 1; // 1-4% increment
          return Math.min(oldProgress + increment, 100);
        });
      }, 300);

      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(0);
      setStage('idle');
    }
  }, [loading]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStage('generating_html');

    try {
      console.log('📤 Sending to backend:', formData);
      
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: formData.keyword,
          num_pages: parseInt(formData.numPages.toString()),
          duration_per_snapshot: parseFloat(formData.duration.toString()),
          use_varied_fonts: formData.useVariedFonts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error (${response.status}): ${errorText}`);
      }

      const data: GenerationResult = await response.json();
      console.log('✅ Backend response:', data);
      setResult(data);
      setProgress(100);
      setStage('complete');
      
    } catch (err) {
      console.error('❌ Error calling backend:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setProgress(0);
    } finally {
      setTimeout(() => setLoading(false), 500); // Small delay to show completion
    }
  };

  // Test backend connection
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      setConnectionStatus('connected');
      return data;
    } catch (err) {
      setConnectionStatus('disconnected');
      throw err;
    }
  };

  // Handle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auto-test connection on component load
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                AI Text Snapper
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Transform keywords into complete websites with screenshots and videos in seconds
            </p>
            
            {/* Connection Status Badge */}
            <div className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : connectionStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {connectionStatus === 'connected' ? 'Backend Connected' : 
                 connectionStatus === 'checking' ? 'Checking Connection...' : 
                 'Backend Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4 bg-linear-to-br from-gray-900 to-black rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linear-to-r from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                <div className="text-3xl">✨</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Generating Content</h3>
              <p className="text-gray-400">
                {stage === 'generating_html' && 'Creating HTML pages...'}
                {stage === 'taking_screenshots' && 'Taking screenshots...'}
                {stage === 'creating_video' && 'Compiling video...'}
                {stage === 'complete' && 'Finalizing...'}
              </p>
            </div>

            {/* Loading Bar */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress</span>
                <span className="font-bold text-white">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Stage Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className={`text-center p-3 rounded-xl transition-all ${stage === 'generating_html' ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/50'}`}>
                  <div className={`text-lg mb-1 ${stage === 'generating_html' ? 'text-blue-400' : 'text-gray-500'}`}>📄</div>
                  <div className={`text-xs font-medium ${stage === 'generating_html' ? 'text-blue-300' : 'text-gray-400'}`}>HTML Pages</div>
                </div>
                <div className={`text-center p-3 rounded-xl transition-all ${stage === 'taking_screenshots' ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-gray-800/50'}`}>
                  <div className={`text-lg mb-1 ${stage === 'taking_screenshots' ? 'text-purple-400' : 'text-gray-500'}`}>📸</div>
                  <div className={`text-xs font-medium ${stage === 'taking_screenshots' ? 'text-purple-300' : 'text-gray-400'}`}>Screenshots</div>
                </div>
                <div className={`text-center p-3 rounded-xl transition-all ${stage === 'creating_video' || stage === 'complete' ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-gray-800/50'}`}>
                  <div className={`text-lg mb-1 ${stage === 'creating_video' || stage === 'complete' ? 'text-pink-400' : 'text-gray-500'}`}>🎬</div>
                  <div className={`text-xs font-medium ${stage === 'creating_video' || stage === 'complete' ? 'text-pink-300' : 'text-gray-400'}`}>Video</div>
                </div>
              </div>

              {/* Loading Message */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 animate-pulse">
                  {stage === 'generating_html' && 'Generating beautiful HTML pages with AI...'}
                  {stage === 'taking_screenshots' && 'Capturing high-quality screenshots...'}
                  {stage === 'creating_video' && 'Compiling screenshots into video...'}
                  {stage === 'complete' && 'Almost done! Finalizing your video...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Form */}
          <div className="lg:sticky lg:top-8">
            <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Generate Content
                </h2>
                <button
                  type="button"
                  onClick={testConnection}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all bg-linear-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  🔄 Test Connection
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Keyword Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Main Keyword <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                      type="text"
                      name="keyword"
                      value={formData.keyword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your keyword..."
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    e.g., Artificial Intelligence, Web Development, Digital Marketing
                  </p>
                </div>

                {/* Sliders Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Pages Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Pages Count
                      </label>
                      <span className="text-lg font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formData.numPages}
                      </span>
                    </div>
                    <input
                      type="range"
                      name="numPages"
                      min="1"
                      max="50"
                      step="1"
                      value={formData.numPages}
                      onChange={handleChange}
                      className="w-full h-2 bg-linear-to-r from-blue-200 to-purple-200 dark:from-gray-700 dark:to-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-linear-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg"
                      disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </div>

                  {/* Duration Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Duration
                      </label>
                      <span className="text-lg font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formData.duration}s
                      </span>
                    </div>
                    <input
                      type="range"
                      name="duration"
                      min="0.1"
                      max="1.5"
                      step="0.01"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full h-2 bg-linear-to-r from-emerald-200 to-teal-200 dark:from-gray-700 dark:to-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-linear-to-r [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-teal-500 [&::-webkit-slider-thumb]:shadow-lg"
                      disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Fast</span>
                      <span>Slow</span>
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex items-center p-4 rounded-2xl bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-900/50">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="useVariedFonts"
                      name="useVariedFonts"
                      checked={formData.useVariedFonts}
                      onChange={handleChange}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-12 h-6 bg-gray-300 peer-checked:bg-linear-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 rounded-full transition-all duration-300 peer-disabled:opacity-50">
                      <div className="w-5 h-5 bg-white rounded-full transform translate-x-1 translate-y-0.5 peer-checked:translate-x-7 transition-all duration-300 shadow-md" />
                    </div>
                  </div>
                  <label htmlFor="useVariedFonts" className="ml-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Varied Fonts</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Use Poppins, Montserrat, Inter, and more
                    </p>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.keyword.trim() || connectionStatus !== 'connected'}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading || !formData.keyword.trim() || connectionStatus !== 'connected'
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-3xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">✨</span>
                      Generate AI Websites
                      <span className="ml-2">🚀</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Preview & Results */}
          <div className="space-y-8">
            {/* Sample Video Preview */}
            <div className="glass-panel p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sample Output
                </h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-linear-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400">
                  Preview
                </span>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-gray-900 to-black p-1">
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-auto rounded-xl"
                    controls
                    muted
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    poster="/api/placeholder/800/450"
                  >
                    <source src="/sample_video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={toggleVideo}
                        className="p-4 rounded-full bg-linear-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-sm text-white hover:scale-110 transition-transform duration-300 shadow-2xl"
                      >
                        <div className="w-12 h-12 flex items-center justify-center">
                          <div className="w-0 h-0 border-y-6 border-l-10 border-y-transparent border-l-white ml-1" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-linear-to-r from-red-500 to-pink-500 text-white">
                    SAMPLE
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-linear-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1920</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Width</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-linear-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1080</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-linear-to-b from-pink-50 to-white dark:from-gray-800 dark:to-gray-900 hover:shadow-lg transition-shadow duration-300">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">HD</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">1080p Video</div>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {error && (
              <div className="glass-panel p-6 rounded-3xl border-l-4 border-red-500 bg-linear-to-r from-red-50/50 to-red-50/20 dark:from-red-900/10 dark:to-red-900/5">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <span className="text-red-600 dark:text-red-400">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-red-800 dark:text-red-300">
                      Generation Failed
                    </h4>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
                    <button
                      onClick={testConnection}
                      className="mt-3 px-4 py-2 text-sm font-medium rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="glass-panel p-6 rounded-3xl border-l-4 border-green-500 bg-linear-to-r from-green-50/50 to-emerald-50/20 dark:from-green-900/10 dark:to-emerald-900/5 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-start">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400">✨</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                        Generation Complete!
                      </h4>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-linear-to-r from-green-500 to-emerald-500 text-white">
                        SUCCESS
                      </span>
                    </div>
                    
                    <div className="mt-6 space-y-6">
                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                          <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {result.html_count}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">HTML Pages</div>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                          <div className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {result.snapshot_count}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Screenshots</div>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                          <div className="text-2xl font-bold bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            1
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Video</div>
                        </div>
                        <div className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                          <div className="text-2xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {result.keyword.split(' ')[0]}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Keyword</div>
                        </div>
                      </div>

                      {/* Video Section */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Generated Video
                        </h5>
                        
                        {/* Video Preview Box */}
                        <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-gray-900 to-black p-1">
                          <div className="rounded-xl overflow-hidden">
                            <div className="aspect-video bg-linear-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
                              <div className="text-6xl mb-4">🎬</div>
                              <h3 className="text-2xl font-bold text-white mb-2">Video Ready!</h3>
                              <p className="text-gray-300 text-center">
                                Click below to download immediately
                              </p>
                            </div>
                          </div>
                          
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                              READY
                            </span>
                          </div>
                        </div>
                        
                        {/* BIG DOWNLOAD BUTTON - USING WORKING URL */}
                        <a
                          href={`http://localhost:8000/static/users/${result.user_id}/video/final_video.mp4`}
                          download="generated_video.mp4"
                          target ="_blank"
                          className="block w-full py-5 px-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:shadow-3xl text-center"
                        >
                          <div className="flex items-center justify-center">
                            <span className="mr-3 text-2xl">⬇️</span>
                            <span>DOWNLOAD VIDEO</span>
                            <span className="ml-3 text-2xl">🚀</span>
                          </div>
                        </a>
                        
                        {/* Secondary Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() => window.open(`http://localhost:8000/static/users/${result.user_id}/video/final_video.mp4`, '_blank')}
                            className="py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-linear-to-r from-blue-500 to-cyan-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                          >
                            <span className="mr-2">🔗</span>
                            Open in Browser
                          </button>
                          <button
                            onClick={() => {
                              const url = `http://localhost:8000/static/users/${result.user_id}/video/final_video.mp4`;
                              navigator.clipboard.writeText(url);
                              alert('✅ Video URL copied to clipboard!');
                            }}
                            className="py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-linear-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                          >
                            <span className="mr-2">📋</span>
                            Copy URL
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          Details
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">User ID:</span>
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {result.user_id.substring(0, 8)}...
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Fonts:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.use_varied_fonts ? 'Varied' : 'Default'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Generated:</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                    <span className="text-white">⚡</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Fast Processing</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate 25+ pages and videos in under 60 seconds with AI-powered automation.
                </p>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                    <span className="text-white">🎨</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Modern Design</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professional layouts with varied fonts, gradients, and responsive designs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200/50 dark:border-gray-800/50 mt-16 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI Website Generator • Built with FastAPI & Next.js • {new Date().getFullYear()}
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">
                Helping all content creator
              </code>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">
                Made with ambition and ☕ by Lukas Purba Wisesa
              </code>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">
                lukaspurbaw@gmail.com
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}