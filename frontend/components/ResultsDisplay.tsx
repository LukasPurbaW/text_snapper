'use client';

import { useState } from 'react';
import { GenerationResult } from '../types';

interface ResultsDisplayProps {
  result: GenerationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'files' | 'video'>('summary');

  const formatPath = (path: string) => {
    return path.replace(/\\/g, '/').split('/').pop() || path;
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Generation Complete!</h2>
            <p className="opacity-90">Your dummy pages and video have been created successfully.</p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Summary
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'files'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Generated Files
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`px-6 py-4 font-medium text-sm transition-colors ${
              activeTab === 'video'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Video
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{result.html_count}</div>
                <div className="text-sm text-gray-600">HTML Pages</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.snapshot_count}</div>
                <div className="text-sm text-gray-600">Screenshots</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.use_varied_fonts ? 'Varied' : 'Poppins'}
                </div>
                <div className="text-sm text-gray-600">Font Style</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{result.keyword}</div>
                <div className="text-sm text-gray-600">Keyword</div>
              </div>
            </div>

            {/* User ID */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-medium text-blue-800 mb-2">User Session ID</h3>
              <div className="flex items-center justify-between">
                <code className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded">
                  {result.user_id}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(result.user_id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Directories */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Generated Directories</h3>
              <div className="space-y-2">
                {[
                  { label: 'HTML Pages', path: result.pages_dir },
                  { label: 'Screenshots', path: result.snapshots_dir },
                  { label: 'Images', path: result.images_dir },
                  { label: 'Video', path: result.video_dir },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-700">{item.label}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{item.path}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 mb-3">Generated Files</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {result.generated_html?.map((file: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-700">Page {index + 1}</div>
                      <div className="text-sm text-gray-500">{formatPath(file)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`file://${file}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="font-medium text-purple-800 mb-4">Video Preview</h3>
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">Video generated at: {result.video_dir}/final_video.mp4</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => downloadFile(`${result.video_dir}/final_video.mp4`, 'final_video.mp4')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Video
                </button>
                <button
                  onClick={() => window.open(`file://${result.video_dir}/final_video.mp4`, '_blank')}
                  className="flex-1 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 py-3 rounded-lg font-medium transition-colors"
                >
                  Open in Player
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-2">Video Details</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Format: MP4 (H.264)</li>
                  <li>• Resolution: Based on screenshot dimensions</li>
                  <li>• FPS: 30 frames per second</li>
                  <li>• Audio: Camera shutter sound effects</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-700 mb-2">Generation Pipeline</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>1. HTML pages generated with {result.keyword} content</li>
                  <li>2. {result.snapshot_count} screenshots captured</li>
                  <li>3. Video compiled with transition effects</li>
                  <li>4. Audio effects added to each transition</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}