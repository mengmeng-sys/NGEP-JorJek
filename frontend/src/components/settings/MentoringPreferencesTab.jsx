import React, { useState } from 'react';

export function MentoringPreferencesTab() {
  const [mentoringStatus, setMentoringStatus] = useState('Available for Sessions');
  const [maxSessions, setMaxSessions] = useState(3);
  const [expertiseTags, setExpertiseTags] = useState(['#SQL', '#C++', '#Figma', '#Data Structures']);

  return (
    <div>
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900">Mentoring Preferences</h2>
        <p className="text-xs text-gray-500 mt-0.5">Control your availability, specialties, and session limits.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">Current Mentoring Status</h3>
          <p className="text-xs text-gray-400 mb-3">This controls whether other users can send you session requests.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
            {[
              { label: 'Available for Sessions', desc: 'Open to all requests', dot: 'bg-emerald-500', activeRing: 'border-emerald-500 bg-emerald-50/40 text-emerald-950' },
              { label: 'Busy / Paused', desc: 'Temporarily unavailable', dot: 'bg-amber-500', activeRing: 'border-amber-500 bg-amber-50/40 text-amber-950' },
              { label: 'Not Accepting', desc: 'Closed for requests', dot: 'bg-rose-500', activeRing: 'border-rose-500 bg-rose-50/40 text-rose-950' },
            ].map((status) => {
              const isSelected = mentoringStatus.startsWith(status.label.split(' ')[0]);
              return (
                <button
                  key={status.label}
                  type="button"
                  onClick={() => setMentoringStatus(status.label)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isSelected ? `${status.activeRing} shadow-sm ring-1 ring-offset-0` : 'border-gray-200 bg-[#FAFAFA] hover:bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${status.dot} flex-shrink-0`} />
                    <span className="text-xs font-bold">{status.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium pl-4">{status.desc}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-gray-700">Status set to: <strong>{mentoringStatus}</strong></span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">Max Sessions per Week</h3>
          <p className="text-xs text-gray-400 mb-3">Limit how many active sessions you can have at a time.</p>
          
          <div className="flex items-center gap-2.5">
            {[1, 2, 3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxSessions(num)}
                className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                  maxSessions === num ? 'bg-[#FF4F00] text-white shadow-sm' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {num}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2 font-medium">sessions / week</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-900 mb-1">Areas of Expertise</h3>
          <p className="text-xs text-gray-400 mb-3">Tags that will appear on your mentor profile.</p>

          <div className="flex items-center flex-wrap gap-2.5">
            {expertiseTags.map((tag) => (
              <span key={tag} className="bg-white border border-[#FF4F00] text-[#FF4F00] font-bold text-xs px-3.5 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
            <button className="border border-dashed border-gray-300 hover:border-gray-400 text-gray-500 font-semibold text-xs px-3.5 py-1.5 rounded-full transition-colors">
              + Add tag
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button className="bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}