import React, { useState, useEffect } from 'react';
import { Search, Users, SlidersHorizontal, X, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import UserCard from './UserCard.jsx';

const Network = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const [filters, setFilters] = useState({ skills: '', company: '', branch: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeRole !== 'all') params.set('role', activeRole);
      if (filters.skills) params.set('skills', filters.skills);
      if (filters.company) params.set('company', filters.company);
      if (filters.branch) params.set('branch', filters.branch);
      const res = await fetch(`http://localhost:5000/api/network/users?${params}`);
      const data = await res.json();
      if (data.success) setUsers(data.users.filter(u => String(u.id) !== String(user?.id)));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [search, activeRole, filters]);

  const hasFilters = Object.values(filters).some(Boolean);
  const clearFilters = () => setFilters({ skills: '', company: '', branch: '' });

  const suggested = users.filter(u => {
    const mySkills = (user?.skills || '').toLowerCase();
    const uSkills = (u.skills || '').toLowerCase();
    return mySkills && uSkills && mySkills.split(',').some(s => s.trim() && uSkills.includes(s.trim()));
  }).slice(0, 4);

  const students = users.filter(u => String(u.role || '').toLowerCase() === 'student');
  const alumni = users.filter(u => ['alumni','alumini'].includes(String(u.role || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Discover & Connect</h1>
        <p className="text-blue-100 text-base max-w-xl mx-auto">Find students and alumni from CampusBridge. Follow, connect, and grow your network.</p>

        {/* Search */}
        <div className="mt-6 flex items-center max-w-xl mx-auto bg-white rounded-full shadow-lg overflow-hidden">
          <div className="flex items-center flex-1 px-5 py-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full ml-3 text-gray-700 bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
            {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400" /></button>}
          </div>
        </div>

        {/* Role tabs */}
        <div className="flex justify-center gap-2 mt-5">
          {[['all','All People'],['student','Students'],['alumni','Alumni']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveRole(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${activeRole === key ? 'bg-white text-blue-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? 'Loading...' : <><span className="font-semibold text-gray-800">{users.length}</span> people found</>}
          </p>
          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${showFilters || hasFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters {hasFilters && '•'}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[['skills','Skills','e.g. React, Python'],['company','Company','e.g. TCS, Google'],['branch','Branch','e.g. Computer Science']].map(([key,label,ph]) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">{label}</label>
                  <input value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              ))}
            </div>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-xs text-red-500 hover:underline font-medium">✕ Clear all filters</button>}
          </div>
        )}

        {/* Suggested */}
        {suggested.length > 0 && !search && !hasFilters && activeRole === 'all' && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <h2 className="text-lg font-bold text-gray-800">Suggested for You</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Based on your skills</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggested.map(u => <UserCard key={u.id} user={u} currentUser={user} suggested />)}
            </div>
          </div>
        )}

        {/* Alumni section */}
        {(activeRole === 'all' || activeRole === 'alumni') && alumni.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👔</span>
              <h2 className="text-lg font-bold text-gray-800">Alumni</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{alumni.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {alumni.map(u => <UserCard key={u.id} user={u} currentUser={user} />)}
            </div>
          </div>
        )}

        {/* Students section */}
        {(activeRole === 'all' || activeRole === 'student') && students.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎓</span>
              <h2 className="text-lg font-bold text-gray-800">Students</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{students.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {students.map(u => <UserCard key={u.id} user={u} currentUser={user} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && users.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-20 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-gray-200 -mt-9" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
