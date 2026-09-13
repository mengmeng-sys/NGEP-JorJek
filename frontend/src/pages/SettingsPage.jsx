import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GeneralTab } from '@/components/settings/GeneralTab';
import { MentoringDashboardTab } from '@/components/settings/MentoringDashboardTab';
import { MentoringPreferencesTab } from '@/components/settings/MentoringPreferencesTab';
import { PrivacyTab } from '@/components/settings/PrivacyTab';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const navigationItems = [
    {
      section: 'CONTENT',
      items: [
        {
          id: 'mentoring-dashboard',
          label: 'Mentoring Dashboard',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      section: 'SETTINGS',
      items: [
        {
          id: 'general',
          label: 'General',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          id: 'preferences',
          label: 'Mentoring Preferences',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          id: 'privacy',
          label: 'Privacy',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        {/* User Stats Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#111827] text-white text-xl font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
              YO
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Yola Osei</h1>
              <p className="text-sm text-gray-500 mt-0.5">yola.osei@cadt.edu.kh</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-gray-600">Available for Sessions</span>
              </div>
            </div>
          </div>

          <div className="flex items-center divide-x divide-gray-100 self-stretch md:self-auto justify-around md:justify-end gap-2 md:gap-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">142</span>
              <span className="text-xs text-gray-400 font-medium">Campus Karma</span>
            </div>
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">12</span>
              <span className="text-xs text-gray-400 font-medium">Posts Created</span>
            </div>
            <div className="px-6 text-center">
              <span className="text-2xl font-bold text-gray-900 block leading-tight">5</span>
              <span className="text-xs text-gray-400 font-medium">Sessions Done</span>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Tabs */}
          <div className="md:col-span-4 lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-6">
            {navigationItems.map((group) => (
              <div key={group.section}>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">{group.section}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#FFF4F0] text-[#FF4F00] border-l-4 border-[#FF4F00] rounded-l-none'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                        }`}
                      >
                        <span className={isActive ? 'text-[#FF4F00]' : 'text-gray-400'}>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="md:col-span-8 lg:col-span-9 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'mentoring-dashboard' && <MentoringDashboardTab />}
            {activeTab === 'preferences' && <MentoringPreferencesTab />}
            {activeTab === 'privacy' && <PrivacyTab />}
          </div>
        </div>
      </div>
    </div>
  );
}