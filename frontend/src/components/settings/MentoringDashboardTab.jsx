import React, { useState } from 'react';

export function MentoringDashboardTab() {
  const [createdCourses, setCreatedCourses] = useState([
    {
      id: 1,
      title: 'Intro to PostgreSQL Joins & Query Optimization',
      hours: 2,
      fee: 0,
      studentLimit: 10,
      enrolled: 4,
      tag: 'SQL',
    },
  ]);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [hasRequestedVerification, setHasRequestedVerification] = useState(false);

  const [courseTitle, setCourseTitle] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [courseFee, setCourseFee] = useState(0);
  const [studentLimit, setStudentLimit] = useState('');
  const [courseTag, setCourseTag] = useState('SQL');

  const requiredFreeCourses = 3;
  const currentCount = createdCourses.length;
  const isEligibleForMentor = currentCount >= requiredFreeCourses;

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!courseTitle.trim() || !studyHours || !studentLimit) return;

    const newCourse = {
      id: Date.now(),
      title: courseTitle.trim(),
      hours: Number(studyHours),
      fee: isEligibleForMentor ? Number(courseFee) : 0,
      studentLimit: Number(studentLimit),
      enrolled: 0,
      tag: courseTag,
    };

    setCreatedCourses([newCourse, ...createdCourses]);
    setCourseTitle('');
    setStudyHours('');
    setCourseFee(0);
    setStudentLimit('');
    setIsCourseModalOpen(false);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-gray-100 pb-4 sm:pb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
            Mentoring Dashboard
          </h2>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-snug">
            Manage incoming requests, created courses, and upcoming sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCourseModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Course</span>
        </button>
      </div>

      {/* Qualification Milestone Banner (No Track Bar) */}
      {!isEligibleForMentor ? (
        <div className="bg-[#FAFAFA] border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF4F00]" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  Mentor Qualification Requirement
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                Host <strong className="text-gray-800 font-semibold">{requiredFreeCourses} free community courses</strong> to qualify as an official platform mentor.
              </p>
            </div>
            <span className="self-start xs:self-center px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-xs font-black text-[#FF4F00] whitespace-nowrap">
              {currentCount} of {requiredFreeCourses} Completed
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                Milestone Reached
              </span>
              <h3 className="text-xs sm:text-sm font-bold">
                You are eligible to become an Official Mentor!
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 mt-1 leading-relaxed">
              You completed {requiredFreeCourses} free courses. Request verification to unlock paid sessions and official mentor badges.
            </p>
          </div>

          <button
            type="button"
            disabled={hasRequestedVerification}
            onClick={() => setHasRequestedVerification(true)}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 shadow-xs cursor-pointer active:scale-98 text-center ${
              hasRequestedVerification
                ? 'bg-white/20 text-white cursor-default'
                : 'bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {hasRequestedVerification ? '✓ Request Submitted' : 'Request to be a Mentor'}
          </button>
        </div>
      )}

      {/* Incoming Requests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider">
            Incoming Requests
          </h3>
          <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#FF4F00] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
            1
          </span>
        </div>

        <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-3">
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#8B5CF6] text-white font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
              KM
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-900 leading-tight">Kwame Mensah</span>
                <span className="bg-purple-50 text-[#8B5CF6] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-purple-100">
                  STUDENT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 mt-1 leading-snug">
                Requesting mentoring for:{' '}
                <strong className="text-gray-900 font-semibold">
                  CREATE VIEW statement for a multi-table dashboard
                </strong>
              </p>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3 text-xs italic text-gray-600">
            "I'm stuck on joining three tables, can we do a quick review?"
          </div>

          <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              className="w-full xs:w-auto flex-1 bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98 text-center"
            >
              Accept & Schedule
            </button>
            <button
              type="button"
              className="w-full xs:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer text-center"
            >
              Decline
            </button>
          </div>
        </div>
      </div>

      {/* Your Courses Grid */}
      <div>
        <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Your Courses ({createdCourses.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {createdCourses.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 bg-white shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                    #{course.tag}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      course.fee === 0
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {course.fee === 0 ? 'FREE' : `$${course.fee}`}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug mb-3">
                  {course.title}
                </h4>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.hours} hrs
                </span>
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {course.enrolled}/{course.studentLimit} Students
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div>
        <h3 className="text-[11px] sm:text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Upcoming Sessions
        </h3>
        <div className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                  Oct 12 • 2:00 PM - 3:00 PM
                </span>
                <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                  #SQL
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">1/3 Students Enrolled</p>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                meet.google.com/abc-defg-hij
              </p>
            </div>
          </div>

          <button
            type="button"
            className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98 text-center flex-shrink-0"
          >
            Join Meeting
          </button>
        </div>
      </div>

      {/* Responsive Modal */}
      {isCourseModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-950/60 backdrop-blur-xs"
          onClick={() => setIsCourseModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Create a New Course</h3>
                <p className="text-[11px] text-gray-400">Schedule a group study or workshop session</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Course Title
                </label>
                <input
                  required
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Deep Dive: Memory Allocation in C++"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00] shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={courseTag}
                    onChange={(e) => setCourseTag(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF4F00] shadow-2xs cursor-pointer"
                  >
                    <option value="SQL">SQL</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Figma">Figma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Hours of Study
                  </label>
                  <input
                    required
                    min="1"
                    max="40"
                    type="number"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    placeholder="e.g., 2"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00] shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Student Limit
                  </label>
                  <input
                    required
                    min="1"
                    max="100"
                    type="number"
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00] shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                    Course Fee ($)
                  </label>
                  <input
                    disabled={!isEligibleForMentor}
                    type="number"
                    value={isEligibleForMentor ? courseFee : 0}
                    onChange={(e) => setCourseFee(e.target.value)}
                    className={`w-full border border-gray-200 rounded-xl px-3.5 sm:px-4 py-2.5 text-xs outline-none shadow-2xs ${
                      !isEligibleForMentor
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#FAFAFA] text-gray-800 focus:bg-white focus:border-[#FF4F00]'
                    }`}
                  />
                  {!isEligibleForMentor && (
                    <span className="text-[10px] text-amber-600 font-medium mt-1 block">
                      Free course required during qualification.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}