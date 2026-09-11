import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TECH_CATEGORIES = [
  { id: 'cpp', name: 'C++ & Low-Level Systems', tag: '#C++', icon: '⚡' },
  { id: 'sql', name: 'Databases & PostgreSQL', tag: '#SQL', icon: '🗄️' },
  { id: 'java', name: 'Java & Object-Oriented', tag: '#Java', icon: '☕' },
  { id: 'ml', name: 'Machine Learning & AI', tag: '#Machine Learning', icon: '🤖' },
  { id: 'figma', name: 'UI/UX & Product Design', tag: '#Figma', icon: '🎨' },
  { id: 'web', name: 'Full-Stack React & Node', tag: '#WebDev', icon: '🌐' },
  { id: 'arch', name: 'Computer Architecture', tag: '#Architecture', icon: '📟' },
  { id: 'cloud', name: 'Cloud & DevOps / Supabase', tag: '#Cloud', icon: '☁️' },
  { id: 'mobile', name: 'Mobile (Flutter / Android)', tag: '#Mobile', icon: '📱' },
];

export default function TechInterestsPage() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState(['cpp', 'sql']);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleFinishOnboarding = () => {
    // Save selections and navigate to main feed
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase text-[#FF4F00] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
            Step 2 of 2
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-3">Select Your Technical Interests</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Choose subjects you want to follow. We will customize your campus questions feed and mentor recommendations based on these tags.
          </p>
        </div>

        {/* Interests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
          {TECH_CATEGORIES.map((cat) => {
            const isSelected = selectedInterests.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleInterest(cat.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'border-[#FF4F00] bg-orange-50/40 text-gray-900 shadow-xs'
                    : 'border-gray-200 bg-[#FAFAFA] hover:bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg p-1.5 rounded-lg bg-white border border-gray-150 shadow-2xs">
                    {cat.icon}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">{cat.name}</h3>
                    <span className="text-[10px] text-[#FF4F00] font-semibold">{cat.tag}</span>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-[#FF4F00] text-white' : 'border border-gray-300'
                }`}>
                  {isSelected ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={handleFinishOnboarding}
            className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Done & Enter JorJek ({selectedInterests.length} Selected)
          </button>
        </div>

      </div>
    </div>
  );
}