import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Briefcase, GraduationCap } from 'lucide-react';

const UserCard = ({ user, currentUser, suggested }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const skills = user.skills
    ? (typeof user.skills === 'string' ? user.skills.split(',').map(s => s.trim()).filter(Boolean) : user.skills)
    : [];
  const role = user.role?.toLowerCase();
  const isStudent = role === 'student';
  const initials = (user.fullname || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const photoSrc = user.profile_photo
    ? (user.profile_photo.startsWith('http') ? user.profile_photo : `http://localhost:5000${user.profile_photo}`)
    : null;

  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;
    fetch(`http://localhost:5000/api/network/follow/check?followerId=${currentUser.id}&followingId=${user.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setIsFollowing(d.isFollowing); })
      .catch(() => {});
  }, [currentUser?.id, user?.id]);

  const toggleFollow = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/network/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id, followingId: user.id }),
      });
      setIsFollowing(v => !v);
    } catch {}
    setLoading(false);
  };

  return (
    <div
      onClick={() => { if (user?.id) navigate(`/network/profile/${user.id}`); }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      <div className="px-5 pt-5 pb-5">
        {/* Avatar + role badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-16 h-16 rounded-full ring-2 ring-gray-100 shadow overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
            {photoSrc
              ? <img src={photoSrc} alt={user.fullname} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
              : <span className="text-xl font-bold text-gray-500">{initials}</span>
            }
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isStudent ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
              {isStudent ? '🎓 Student' : '👔 Alumni'}
            </span>
            {suggested && <span className="text-xs bg-yellow-50 text-yellow-600 font-semibold px-2 py-0.5 rounded-full">✨ Suggested</span>}
          </div>
        </div>

        {/* Name + info */}
        <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-blue-600 transition-colors">{user.fullname}</h3>

        {user.designation
          ? <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1"><Briefcase className="w-3 h-3" />{user.designation}{user.company ? ` @ ${user.company}` : ''}</p>
          : user.branch
            ? <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1"><GraduationCap className="w-3 h-3" />{user.branch}{user.year ? ` · ${user.year}` : ''}</p>
            : null
        }

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {skills.slice(0, 3).map((s, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
            ))}
            {skills.length > 3 && <span className="text-xs text-gray-400 self-center">+{skills.length - 3}</span>}
          </div>
        )}

        {/* Follow button */}
        {currentUser && String(currentUser.id) !== String(user.id) && (          <button
            onClick={toggleFollow}
            disabled={loading}
            className={`mt-4 w-full py-2 rounded-xl text-sm font-semibold transition-all ${
              isFollowing
                ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
            } disabled:opacity-50`}
          >
            {isFollowing
              ? <span className="flex items-center justify-center gap-1.5"><UserCheck className="w-4 h-4" />Following</span>
              : <span className="flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4" />Follow</span>
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
