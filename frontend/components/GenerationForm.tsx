'use client';

import { useState } from 'react';
import { Palette, Type, FileText, Video, Sparkles, Settings } from 'lucide-react';

interface GenerationFormProps {
  onSubmit: (data: {
    keyword: string;
    num_pages: number;
    duration_per_snapshot: number;
    use_varied_fonts: boolean;
  }) => void;
  loading: boolean;
}

export default function GenerationForm({ onSubmit, loading }: GenerationFormProps) {
  const [formData, setFormData] = useState({
    keyword: '',
    num_pages: 10,
    duration_per_snapshot: 0.2,
    use_varied_fonts: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'range' || name === 'num_pages' || name === 'duration_per_snapshot') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Keyword Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
              Content Topic
            </label>
            <p className="text-xs text-gray-500">What should we generate content about?</p>
          </div>
        </div>
        <input
          type="text"
          id="keyword"
          name="keyword"
          value={formData.keyword}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-blue-300 text-black" // ← ADD text-black HERE          
          placeholder="Keyword here"
          required
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Number of Pages */}
        <div className="space-y-4 bg-linear-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <label htmlFor="num_pages" className="block text-sm font-medium text-gray-700">
                Number of Pages
              </label>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-blue-600">{formData.num_pages}</span>
                <span className="text-sm text-gray-500">pages</span>
              </div>
            </div>
          </div>
          <input
            type="range"
            id="num_pages"
            name="num_pages"
            min="1"
            max="50"
            value={formData.num_pages}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span className="font-medium">Few</span>
            <span className="font-medium">Moderate</span>
            <span className="font-medium">Many</span>
          </div>
        </div>

        {/* Duration per Snapshot */}
        <div className="space-y-4 bg-linear-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-linear-to-r from-purple-100 to-purple-50 rounded-lg">
              <Video className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <label htmlFor="duration_per_snapshot" className="block text-sm font-medium text-gray-700">
                Screenshot Duration
              </label>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-purple-600">{formData.duration_per_snapshot}s</span>
                <span className="text-sm text-gray-500">per page</span>
              </div>
            </div>
          </div>
          <input
            type="range"
            id="duration_per_snapshot"
            name="duration_per_snapshot"
            min="0.1"
            max="2"
            step="0.01"
            value={formData.duration_per_snapshot}
            onChange={handleChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span className="font-medium">Fast</span>
            <span className="font-medium">Normal</span>
            <span className="font-medium">Slow</span>
          </div>
        </div>
      </div>

      {/* Font Toggle - Enhanced */}
      <div className="bg-linear-to-r from-gray-50 via-white to-gray-50 border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-linear-to-r from-blue-100 to-purple-100 rounded-lg">
              <Palette className="h-5 w-5 text-gradient-to-r from-blue-600 to-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Font Variety</h3>
              <p className="text-sm text-gray-600">
                {formData.use_varied_fonts 
                  ? '🎨 Each page gets unique fonts for visual diversity' 
                  : '🎯 All pages use Poppins font for consistency'}
              </p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              id="use_varied_fonts"
              name="use_varied_fonts"
              checked={formData.use_varied_fonts}
              onChange={handleChange}
              className="sr-only"
            />
            <label
              htmlFor="use_varied_fonts"
              className={`block h-8 w-14 rounded-full cursor-pointer transition-all duration-300 ease-in-out shadow-inner ${
                formData.use_varied_fonts 
                  ? 'bg-linear-to-r from-blue-500 to-purple-600' 
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                  formData.use_varied_fonts ? 'translate-x-6' : 'translate-x-0'
                }`}
              >
                {formData.use_varied_fonts ? (
                  <Type className="h-3 w-3 text-purple-600" />
                ) : (
                  <Settings className="h-3 w-3 text-gray-400" />
                )}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Generation Preview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/70 rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-blue-700 font-medium">Content</div>
            <div className="text-2xl font-bold text-blue-900">{formData.num_pages} pages</div>
            <div className="text-sm text-blue-600 truncate">"{formData.keyword}"</div>
          </div>
          <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
            <div className="text-sm text-purple-700 font-medium">Video</div>
            <div className="text-2xl font-bold text-purple-900">
              {(formData.num_pages * formData.duration_per_snapshot).toFixed(1)}s
            </div>
            <div className="text-sm text-purple-600">{formData.num_pages} screenshots</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="text-sm text-blue-800 flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            <span className="font-medium">Fonts:</span> 
            <span className="ml-2">
              {formData.use_varied_fonts ? '🎨 Varied (random per page)' : '🎯 Poppins (consistent)'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover:shadow-xl'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            <span className="animate-pulse">Generating Content...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Generate Pages & Create Video
          </div>
        )}
      </button>
    </form>
  );
}