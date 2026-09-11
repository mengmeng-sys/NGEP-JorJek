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
  const progressPercent = Math.min((currentCount / requiredFreeCourses) * 100, 100);

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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mentoring Dashboard</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage incoming requests, created courses, and upcoming sessions.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCourseModalOpen(true)}
          className="flex items-center gap-2 bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Course</span>
        </button>
      </div>

      {!isEligibleForMentor ? (
        <div className="bg-[#FAFAFA] border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-gray-900">Mentor Qualification Track</span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Host <strong>{requiredFreeCourses} free community courses</strong> to qualify as an official platform mentor.
              </p>
            </div>
            <span className="text-xs font-extrabold text-[#FF4F00]">
              {currentCount}/{requiredFreeCourses} Completed
            </span>
          </div>

          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mt-3">
            <div className="bg-[#FF4F00] h-full transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2">
            <span>Course 1 (Free)</span>
            <span>Course 2 (Free)</span>
            <span>Course 3 (Free) — Unlock Mentor Status</span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">Milestone Reached</span>
              <h3 className="text-sm font-bold">You are eligible to become an Official Mentor!</h3>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              You completed {requiredFreeCourses} free courses. Request verification to unlock paid sessions and official mentor badges.
            </p>
          </div>

          <button
            type="button"
            disabled={hasRequestedVerification}
            onClick={() => setHasRequestedVerification(true)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 shadow-sm ${
              hasRequestedVerification ? 'bg-white/20 text-white cursor-default' : 'bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {hasRequestedVerification ? '✓ Request Submitted' : 'Request to be a Mentor'}
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Incoming Requests</h3>
          <span className="w-5 h-5 bg-[#FF4F00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">1</span>
        </div>

        <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">KM</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">Kwame Mensah</span>
                <span className="bg-purple-50 text-[#8B5CF6] text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">STUDENT</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Requesting mentoring for: <strong className="text-gray-900 font-semibold">CREATE VIEW statement for a multi-table dashboard</strong>
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-xs italic text-gray-600 ml-13 mb-4">
            "I'm stuck on joining three tables, can we do a quick review?"
          </div>
          <div className="flex items-center gap-3 justify-start ml-13">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors">Decline</button>
            <button className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">Accept & Schedule</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Your Courses ({createdCourses.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {createdCourses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-2 py-0.5 rounded-md">#{course.tag}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${course.fee === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-800'}`}>
                    {course.fee === 0 ? 'FREE' : `$${course.fee}`}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 leading-snug mb-3">{course.title}</h4>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span>⏱ {course.hours} hrs</span>
                <span>👥 {course.enrolled}/{course.studentLimit} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Upcoming Sessions</h3>
        <div className="border border-gray-200 rounded-2xl p-5 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#FF4F00] flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">Oct 12 • 2:00 PM - 3:00 PM</span>
                <span className="text-[10px] font-bold text-[#FF4F00] bg-orange-50 px-1.5 py-0.5 rounded">#SQL</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">1/3 Students Enrolled</p>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5 flex items-center gap-1">meet.google.com/abc-defg-hij</p>
            </div>
          </div>
          <button className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm self-end sm:self-center">
            Join Meeting
          </button>
        </div>
      </div>

      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Create a New Course</h3>
                <p className="text-[11px] text-gray-400">Schedule a group study or workshop session</p>
              </div>
              <button type="button" onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Course Title</label>
                <input
                  required
                  type="text"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g., Deep Dive: Memory Allocation in C++"
                  className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Category Tag</label>
                  <select
                    value={courseTag}
                    onChange={(e) => setCourseTag(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-[#FF4F00]"
                  >
                    <option value="SQL">SQL</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Figma">Figma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Hours of Study</label>
                  <input
                    required
                    min="1"
                    max="40"
                    type="number"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    placeholder="e.g., 2"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Student Limit</label>
                  <input
                    required
                    min="1"
                    max="100"
                    type="number"
                    value={studentLimit}
                    onChange={(e) => setStudentLimit(e.target.value)}
                    placeholder="e.g., 10"
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#FF4F00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Course Fee ($)</label>
                  <input
                    disabled={!isEligibleForMentor}
                    type="number"
                    value={isEligibleForMentor ? courseFee : 0}
                    onChange={(e) => setCourseFee(e.target.value)}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none ${
                      !isEligibleForMentor ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#FAFAFA] text-gray-800 focus:bg-white focus:border-[#FF4F00]'
                    }`}
                  />
                  {!isEligibleForMentor && (
                    <span className="text-[10px] text-amber-600 font-medium mt-1 block">Free course required during qualification track.</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsCourseModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800">
                  Cancel
                </button>
                <button type="submit" className="bg-[#FF4F00] hover:bg-[#E64700] text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-sm">
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