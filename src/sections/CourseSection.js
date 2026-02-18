import React, { memo } from 'react';
import { Target, Search, X, CheckCircle, MapPin, Settings, Clock } from 'lucide-react';

const courses = {
  f9: [1,2,3,4,5,6,7,8,9],
  b9: [10,11,12,13,14,15,16,17,18],
  f18: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
  b18: [10,11,12,13,14,15,16,17,18,1,2,3,4,5,6,7,8,9]
};

const CourseSection = memo(({
  setupMode, setSetupMode,
  searchQuery, setSearchQuery,
  selectedCourse, setSelectedCourse,
  courseApplied, setCourseApplied,
  courseType, setCourseType,
  holes, setHoles,
  pars, setPar, setPars,
  recentCourses, setRecentCourses,
  filteredCourses,
  selectAndApplyCourse,
  confirmCourse,
  calculateTotalPar,
  getParColorClass,
  getVerticalArrangedHoles,
  setCurrentSection,
  t
}) => {
  return (
    <div className="space-y-4 py-3">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    {t('courseTitle')}
                  </h2>
                </div>
                
                <div className="flex rounded-lg border-2 border-green-600 overflow-hidden">
                  <button
                    onClick={() => setSetupMode('auto')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'auto'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    {t('autoMode')}
                  </button>
                  <button
                    onClick={() => setSetupMode('manual')}
                    className={`flex-1 px-4 py-2.5 font-semibold text-sm transition flex items-center justify-center gap-2 ${
                      setupMode === 'manual'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {t('manualMode')}
                  </button>
                </div>
              </div>

              {setupMode === 'auto' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      {t('selectCourse')}
                    </h3>
                    
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {searchQuery.trim() && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredCourses.length > 0 ? (
                          filteredCourses.map((course, index) => {
                            const coursePar = course.pars.reduce((sum, par) => sum + par, 0);
                            
                            return (
                              <div
                                key={`${course.shortName}-${index}`}
                                className="border border-gray-200 bg-white hover:border-green-400 hover:shadow-lg rounded-xl p-4 cursor-pointer transition-all"
                                onClick={() => selectAndApplyCourse(course)}
                              >
                                <div className="flex gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                                    <span className="text-xl font-bold">{coursePar}</span>
                                    <span className="text-xs uppercase tracking-wide opacity-90">Par</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                      {course.fullName}
                                    </h4>
                                    <div className="border-t border-gray-100 pt-2 mt-2">
                                      {course.location && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                          <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                                          <span>{course.location[0]}, {course.location[1]}</span>
                                        </div>
                                      )}
                                      <p className="text-xs text-gray-400 mt-1">{course.shortName}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">{t('noCourses')}</p>
                            <p className="text-xs mt-1">{t('trySearch')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedCourse && courseApplied && (
                    <>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="mb-3">
                          <div className="flex items-start gap-2 mb-1">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {selectedCourse.fullName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {selectedCourse.shortName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              PAR {calculateTotalPar()}
                            </span>
                          </div>
                        </div>
                        
<div className="bg-white rounded-lg p-4 shadow-sm mb-4">
  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
    <Target className="w-4 h-4" />
    {t('gameType')}
  </h3>
  <div className="grid grid-cols-2 gap-3">
    {Object.keys(courses).map(type => (
      <button
        key={type}
        onClick={() => {
          setCourseType(type);
          const newHoles = courses[type];
          setHoles(newHoles);
          const newPars = {};
          newHoles.forEach((hole, index) => {
            newPars[hole] = selectedCourse.pars[hole - 1] || 4;
          });
          setPars(newPars);
        }}
        className={`p-2 rounded-lg border transition transform hover:scale-105 ${
          courseType === type
            ? 'bg-green-600 text-white border-green-600 shadow-md'
            : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-green-300 hover:shadow-sm'
        }`}
      >
        <h4 className="font-semibold text-xs">{t(type)}</h4>
        <p className="text-xs opacity-80" style={{ fontSize: '10px' }}>
          {t(`${type}Desc`)}
        </p>
      </button>
    ))}
  </div>
</div>
                        
                        <div className={`grid gap-2 ${(courseType === 'f9' || courseType === 'b9') ? 'grid-cols-1 max-w-[200px] mx-auto' : 'grid-cols-2'}`}>
                          <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                            <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                              {t('front9')}
                            </div>
                            <div className="p-1.5 space-y-1">
                              {holes.slice(0, 9).map((hole, idx) => (
                                <div key={hole}>
                                  <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                    {t('holeLabel').replace('{n}', hole)}
                                  </div>
                                  <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                    pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                    pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                    'bg-gray-300 text-black'
                                  }`}>
                                    Par {pars[hole]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {holes.length > 9 && (
                            <div className="border-2 border-green-600 rounded-lg overflow-hidden">
                              <div className="bg-green-600 text-white text-xs font-bold py-1.5 text-center">
                                {t('back9')}
                              </div>
                              <div className="p-1.5 space-y-1">
                                {holes.slice(9, 18).map((hole, idx) => (
                                  <div key={hole}>
                                    <div className="text-xs text-gray-600 mb-0.5 font-medium text-center">
                                      {t('holeLabel').replace('{n}', hole)}
                                    </div>
                                    <div className={`rounded font-bold text-sm py-1.5 shadow-sm text-center ${
                                      pars[hole] === 3 ? 'bg-yellow-300 text-black' :
                                      pars[hole] === 5 ? 'bg-orange-300 text-black' :
                                      'bg-gray-300 text-black'
                                    }`}>
                                      Par {pars[hole]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {setupMode === 'manual' && (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('setPar')}</h3>
                    
                    {(courseType === 'f18' || courseType === 'b18') ? (
                      <div className="grid grid-cols-2 gap-3">
                        {getVerticalArrangedHoles().map((pair, index) => (
                          <React.Fragment key={index}>
                            {pair[0] && (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {t('holeLabelShort').replace('{n}', pair[0])}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[0], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[0]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {pair[1] ? (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-700 min-w-[40px]">
                                  {t('holeLabelShort').replace('{n}', pair[1])}
                                </span>
                                <div className="flex gap-1">
                                  {[3, 4, 5].map(par => (
                                    <button
                                      key={par}
                                      onClick={() => setPar(pair[1], par)}
                                      className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                                        pars[pair[1]] === par
                                          ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                          : 'bg-gray-100 text-gray-500 border border-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {par}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {holes.map(hole => (
                          <div key={hole} className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-900">
                              {t('hole')} {hole}
                            </span>
                            <div className="flex gap-1">
                              {[3, 4, 5].map(par => (
                                <button
                                  key={par}
                                  onClick={() => setPar(hole, par)}
                                  className={`w-8 h-8 rounded font-bold text-sm transition-all ${
                                    pars[hole] === par
                                      ? getParColorClass(par) + ' shadow-md ring-2 ring-green-600'
                                      : 'bg-gray-100 text-gray-500 border border-gray-400'
                                  }`}
                                >
                                  {par}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t text-center">
                      <span className="text-sm text-gray-600">{t('par')}: </span>
                      <span className="text-lg font-bold text-green-600">{calculateTotalPar()}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
      setSearchQuery('');
      setSelectedCourse(null);
      setCourseApplied(false);
      setCurrentSection('home');
    }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300"
                >
                  {t('back')}
                </button>
                <button
                  onClick={confirmCourse}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                >
                  {t('confirmCourse')}
                </button>
              </div>

              {/* ★ 最近使用球场 — 仅在 Auto Search 模式 + 未选球场时显示 */}
              {setupMode === 'auto' && !searchQuery.trim() && !selectedCourse && recentCourses.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      {t('recentCourses')}
                    </h3>
                    <button
                      onClick={() => {
                        localStorage.removeItem('handincap_recent_courses');
                        setRecentCourses([]);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      {t('clearRecent')}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentCourses.slice(0, 3).map((course, index) => {
                      const coursePar = course.pars ? course.pars.reduce((sum, par) => sum + par, 0) : '?';
                      return (
                        <div
                          key={`recent-${course.shortName}-${index}`}
                          className="border border-gray-200 bg-white hover:border-green-400 hover:shadow-lg rounded-xl p-3 cursor-pointer transition-all active:scale-[0.98]"
                          onClick={() => selectAndApplyCourse(course)}
                        >
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
                              <span className="text-base font-bold">{coursePar}</span>
                              <span style={{ fontSize: 8 }} className="uppercase tracking-wide opacity-90">Par</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs text-gray-900 mb-0.5 leading-snug">
                                {course.fullName}
                              </h4>
                              {course.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                  <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span>{course.location[0]}, {course.location[1]}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
  );
});

export default CourseSection;
