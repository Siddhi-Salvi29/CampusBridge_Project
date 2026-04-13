import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserCheck, Mail, Linkedin, Github, MapPin, Briefcase, GraduationCap, Code2, FolderGit2, Star, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';

const TAB_LIST = ['About', 'Skills', 'Experience', 'Projects', 'Achievements'];

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('About');
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:5000/api/network/users/${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProfile(d.user);
          setFollowers(d.user.followers || 0);
          setFollowing(d.user.following || 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!currentUser?.id || !userId) return;
    fetch(`http://localhost:5000/api/network/follow/check?followerId=${currentUser.id}&followingId=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setIsFollowing(d.isFollowing); })
      .catch(() => {});
  }, [currentUser?.id, userId]);

  const toggleFollow = async () => {
    if (!currentUser?.id) return;
    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      await fetch('http://localhost:5000/api/network/follow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: userId }),
      });
      setIsFollowing(v => !v);
      setFollowers(f => isFollowing ? f - 1 : f + 1);
    } catch {}
    setFollowLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-500">User not found.</p>
      <button onClick={() => navigate('/network')} className="mt-4 text-blue-600 hover:underline">Back to Network</button>
    </div>
  );

  const skills = profile.skills ? (typeof profile.skills === 'string' ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : profile.skills) : [];
  const role = profile.role?.toLowerCase();
  const isOwnProfile = String(currentUser?.id) === String(userId);
  const photoSrc = profile.profile_photo ? (profile.profile_photo.startsWith('http') ? profile.profile_photo : `http://localhost:5000${profile.profile_photo}`) : '/default-avatar.png';

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <button onClick={() => navigate('/network')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 text-sm transition">
        <ArrowLeft className="w-4 h-4" /> Back to Network
      </button>

      {/* Banner + Photo */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-5">
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-12 mb-4">
            <img src={photoSrc} alt={profile.fullname}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
              onError={e => { e.target.src = '/default-avatar.png'; }} />
            {!isOwnProfile && currentUser && (
              <button onClick={toggleFollow} disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-60`}>
                {isFollowing ? <><UserCheck className="w-4 h-4" />Following</> : <><UserPlus className="w-4 h-4" />Follow</>}
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{profile.fullname}</h1>
          <p className="text-sm text-blue-600 font-medium capitalize mt-0.5">{role}</p>
          {profile.designation && <p className="text-sm text-gray-600 mt-1">{profile.designation}{profile.company ? ` @ ${profile.company}` : ''}</p>}
          {profile.experience && <p className="text-xs text-gray-400 mt-0.5">{profile.experience} experience</p>}
          {profile.branch && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{profile.branch}{profile.degree ? ` · ${profile.degree}` : ''}</p>}

          {/* Follow stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{followers}</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{following}</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>

          {/* Social links */}
          <div className="flex gap-3 mt-4">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition">
              <Mail className="w-4 h-4" />{profile.email}
            </a>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Linkedin className="w-4 h-4" /></a>}
            {profile.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900"><Github className="w-4 h-4" /></a>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-5 overflow-x-auto">
        {TAB_LIST.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'About' && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">About</h2>
            {profile.bio ? <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p> : <p className="text-gray-400 italic text-sm">No bio added.</p>}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              {profile.degree && <div><p className="text-xs text-gray-400">Degree</p><p className="text-sm font-medium text-gray-800">{profile.degree}</p></div>}
              {profile.branch && <div><p className="text-xs text-gray-400">Branch</p><p className="text-sm font-medium text-gray-800">{profile.branch}</p></div>}
              {profile.year && <div><p className="text-xs text-gray-400">Year</p><p className="text-sm font-medium text-gray-800">{profile.year}</p></div>}
              {profile.cgpa && <div><p className="text-xs text-gray-400">CGPA</p><p className="text-sm font-medium text-gray-800">{profile.cgpa}</p></div>}
              {profile.company && <div><p className="text-xs text-gray-400">Company</p><p className="text-sm font-medium text-gray-800">{profile.company}</p></div>}
              {profile.experience && <div><p className="text-xs text-gray-400">Experience</p><p className="text-sm font-medium text-gray-800">{profile.experience}</p></div>}
            </div>
          </div>
        )}

        {activeTab === 'Skills' && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Code2 className="w-5 h-5 text-purple-600" />Skills</h2>
            {skills.length > 0
              ? <div className="flex flex-wrap gap-2">{skills.map((s, i) => <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{s}</span>)}</div>
              : <p className="text-gray-400 italic text-sm">No skills listed.</p>}
          </div>
        )}

        {activeTab === 'Experience' && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-orange-500" />Experience</h2>
            {(profile.internships || []).length > 0 ? (
              <div className="space-y-4">
                {(profile.internships || []).map((p, i) => (
                  <div key={i} className="border-l-4 border-orange-300 pl-4">
                    <p className="font-semibold text-gray-800">{p.role} <span className="text-orange-600">@ {p.company}</span></p>
                    {p.duration && <p className="text-xs text-gray-500">{p.duration}</p>}
                    {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic text-sm">No experience listed.</p>}
          </div>
        )}

        {activeTab === 'Projects' && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><FolderGit2 className="w-5 h-5 text-green-600" />Projects</h2>
            {(profile.projects || []).length > 0 ? (
              <div className="space-y-4">
                {(profile.projects || []).map((p, i) => (
                  <div key={i} className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    {p.tech && <p className="text-xs text-green-600 mt-1">Tech: {p.tech}</p>}
                    {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block">{p.link}</a>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic text-sm">No projects listed.</p>}
          </div>
        )}

        {activeTab === 'Achievements' && (
          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" />Achievements</h2>
            {(profile.achievements || []).length > 0 ? (
              <div className="space-y-3">
                {(profile.achievements || []).map((a, i) => (
                  <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">🏆 {a.title}</p>
                    {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-400 italic text-sm">No achievements listed.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
