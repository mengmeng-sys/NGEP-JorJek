import React, { useState } from 'react';

const DAYS_OF_WEEK = [
  { key: 'mon', short: 'Mon', full: 'Monday' },
  { key: 'tue', short: 'Tue', full: 'Tuesday' },
  { key: 'wed', short: 'Wed', full: 'Wednesday' },
  { key: 'thu', short: 'Thu', full: 'Thursday' },
  { key: 'fri', short: 'Fri', full: 'Friday' },
  { key: 'sat', short: 'Sat', full: 'Saturday' },
  { key: 'sun', short: 'Sun', full: 'Sunday' },
];

export function MentoringPreferencesTab() {
  const [mentoringStatus, setMentoringStatus] = useState('Available for Sessions');
  const [maxSessions, setMaxSessions] = useState(3);
  const [expertiseTags, setExpertiseTags] = useState(['#SQL', '#C++', '#Figma', '#Data Structures']);
  const [availableDays, setAvailableDays] = useState(['mon', 'wed', 'fri']);

  // Inline Tag Input State
  const [tagInput, setTagInput] = useState('');

  const toggleDay = (dayKey) => {
    if (availableDays.includes(dayKey)) {
      setAvailableDays(availableDays.filter((d) => d !== dayKey));
    } else {
      setAvailableDays([...availableDays, dayKey]);
    }
  };

  const getStatusDotColor = () => {
    if (mentoringStatus.startsWith('Available')) return 'bg-emerald-500';
    if (mentoringStatus.startsWith('Busy')) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Tag Handlers
  const handleAddTag = (rawVal) => {
    const cleaned = rawVal.trim().replace(/^#+/, '');
    if (!cleaned) return;
    const formatted = `#${cleaned}`;
    if (!expertiseTags.includes(formatted)) {
      setExpertiseTags([...expertiseTags, formatted]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && expertiseTags.length > 0) {
      // Remove last tag on backspace if input is empty
      setExpertiseTags(expertiseTags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setExpertiseTags(expertiseTags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="w-full">
      {/* Tab Header */}
      <div className="border-b border-gray-100 pb-4 sm:pb-5 mb-5 sm:mb-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          Mentoring Preferences
        </h2>
        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
          Control your availability, active weekly schedule, specialties, and session limits.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-7">
        
        {/* 1. Mentoring Status Options */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
            Current Mentoring Status
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-3 leading-relaxed">
            Controls whether students and peers can send you direct session bookings.
          </p>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
            {[
              { label: 'Available for Sessions', desc: 'Open to all requests', dot: 'bg-emerald-500', activeRing: 'border-emerald-500 bg-emerald-50/50 text-emerald-950' },
              { label: 'Busy / Paused', desc: 'Temporarily unavailable', dot: 'bg-amber-500', activeRing: 'border-amber-500 bg-amber-50/50 text-amber-950' },
              { label: 'Not Accepting', desc: 'Closed for requests', dot: 'bg-rose-500', activeRing: 'border-rose-500 bg-rose-50/50 text-rose-950' },
            ].map((status) => {
              const isSelected = mentoringStatus === status.label;
              return (
                <button
                  key={status.label}
                  type="button"
                  onClick={() => setMentoringStatus(status.label)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer select-none active:scale-98 ${
                    isSelected
                      ? `${status.activeRing} shadow-2xs ring-1 ring-offset-0`
                      : 'border-gray-200 bg-[#FAFAFA] hover:bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${status.dot} flex-shrink-0`} />
                    <span className="text-xs font-bold leading-snug">{status.label}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium pl-4">
                    {status.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-2.5 sm:p-3 flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${getStatusDotColor()}`} />
            <span className="text-[11px] sm:text-xs font-semibold text-gray-700">
              Active status: <strong className="text-gray-900">{mentoringStatus}</strong>
            </span>
          </div>
        </div>

        {/* 2. Seven Days of the Week Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Free Days for Mentoring
            </h3>
            <span className="text-[11px] font-bold text-[#FF4F00]">
              {availableDays.length} of 7 days selected
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-3 leading-relaxed">
            Select the recurring days of the week when you can take student bookings.
          </p>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = availableDays.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 select-none ${
                    isSelected
                      ? 'bg-[#FFF4F0] border-[#FF4F00] text-[#FF4F00] font-black shadow-2xs'
                      : 'bg-[#FAFAFA] border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300 font-bold'
                  }`}
                  title={day.full}
                >
                  <span className="text-[11px] sm:text-xs leading-none">{day.short}</span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 transition-colors ${
                      isSelected ? 'bg-[#FF4F00]' : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={() => setAvailableDays(['mon', 'tue', 'wed', 'thu', 'fri'])}
              className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              Weekdays only
            </button>
            <button
              type="button"
              onClick={() => setAvailableDays(['sat', 'sun'])}
              className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
            >
              Weekends only
            </button>
            <button
              type="button"
              onClick={() => setAvailableDays([])}
              className="text-[10px] font-semibold text-gray-400 hover:text-gray-700 px-2 py-1 transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* 3. Max Sessions per Week */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
            Max Sessions per Week
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-3">
            Caps how many active study sessions students can book with you each week.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxSessions(num)}
                className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs ${
                  maxSessions === num
                    ? 'bg-[#FF4F00] text-white shadow-xs'
                    : 'border border-gray-200 bg-[#FAFAFA] text-gray-700 hover:bg-white'
                }`}
              >
                {num}
              </button>
            ))}
            <span className="text-[11px] sm:text-xs text-gray-400 ml-1 font-medium">
              sessions / week
            </span>
          </div>
        </div>

        {/* 4. Areas of Expertise (Direct Inline Input Chip Box) */}
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
            Areas of Expertise
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mb-3">
            Type a topic and press <kbd className="font-sans font-semibold bg-gray-100 px-1 py-0.5 rounded text-gray-600">Enter</kbd> or comma to add.
          </p>

          {/* Integrated Tag Container */}
          <div className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center gap-2 focus-within:bg-white focus-within:border-[#FF4F00] focus-within:ring-1 focus-within:ring-[#FF4F00] transition-all shadow-2xs">
            {expertiseTags.map((tag) => (
              <span
                key={tag}
                className="bg-orange-50 border border-orange-200 text-[#FF4F00] font-bold text-[11px] sm:text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs select-none"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-orange-400 hover:text-orange-700 font-bold cursor-pointer text-xs leading-none"
                  title="Remove tag"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* Inline Text Input */}
            <div className="flex-1 min-w-[130px] flex items-center">
              <span className="text-gray-400 text-xs font-bold mr-0.5 select-none">#</span>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                }}
                placeholder={expertiseTags.length === 0 ? "e.g. Python, SQL..." : "Add more..."}
                className="w-full bg-transparent border-0 outline-none text-xs text-gray-800 placeholder-gray-400 font-medium py-1"
              />
            </div>
          </div>
        </div>

        {/* Save Footer Action */}
        <div className="pt-3 sm:pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            className="w-full sm:w-auto bg-[#FF4F00] hover:bg-[#E64700] text-white font-bold text-xs px-6 py-3 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-center"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}