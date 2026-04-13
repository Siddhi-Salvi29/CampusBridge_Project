import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Briefcase, MapPin, Building2, Clock, Search,
  MessageCircle, Share2, Send, X, Linkedin, Twitter,
  Facebook, Link2, Check, Image, Trophy, Plus, Trash2
} from 'lucide-react';
import { getPersistentNotifications, getJobData, subscribeToNotifications } from './JobData.js';
import { useAuth } from '../../../context/AuthContext.jsx';

// ── localStorage helpers ────────────────────────────────────────────────────
const COMMENTS_KEY = 'postComments';
const USER_POSTS_KEY = 'userAchievementPosts';

const loadComments = () => { try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}'); } catch { return {}; } };
const saveComments = (d) => { try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(d)); } catch {} };
const loadUserPosts = () => { try { return JSON.parse(localStorage.getItem(USER_POSTS_KEY) || '[]'); } catch { return []; } };
const saveUserPosts = (d) => { try { localStorage.setItem(USER_POSTS_KEY, JSON.stringify(d)); } catch {} };

// ── Share Menu ──────────────────────────────────────────────────────────────
const ShareMenu = ({ shareText, shareUrl, onClose }) => {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const platforms = [
    { name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'bg-[#0077B5] hover:bg-[#006399]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { name: 'Twitter / X', icon: <Twitter className="w-4 h-4" />, color: 'bg-black hover:bg-gray-800', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'bg-[#1877F2] hover:bg-[#166FE5]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'WhatsApp', icon: <span className="text-sm">💬</span>, color: 'bg-[#25D366] hover:bg-[#20BD5C]', url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}` },
  ];

  const copyLink = () => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-10 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Share</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {platforms.map(p => (
          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-medium transition ${p.color}`}>
            {p.icon} {p.name}
          </a>
        ))}
      </div>
      <button onClick={copyLink} className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
        {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Link2 className="w-4 h-4" /> Copy Link</>}
      </button>
    </div>
  );
};

// ── Comment Section ─────────────────────────────────────────────────────────
const CommentSection = ({ postKey, user }) => {
  const [allComments, setAllComments] = useState(loadComments);
  const [text, setText] = useState('');
  const comments = allComments[postKey] || [];

  const addComment = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const c = { id: Date.now(), author: user?.fullname || 'Anonymous', role: user?.role || '', text: text.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    const updated = { ...allComments, [postKey]: [c, ...(allComments[postKey] || [])] };
    setAllComments(updated);
    saveComments(updated);
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {user ? (
        <form onSubmit={addComment} className="flex gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user.fullname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-gray-50" />
            <button type="submit" disabled={!text.trim()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : <p className="text-xs text-gray-400 mb-3">Log in to comment.</p>}
      {comments.length > 0 && (
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.author[0]?.toUpperCase()}</div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-800">{c.author}</span>
                  {c.role && <span className="text-xs text-gray-400 capitalize">{c.role}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{c.time}</span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Post Form ────────────────────────────────────────────────────────
const CreatePostForm = ({ user, onPost }) => {
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('authorName', user?.fullname || 'Anonymous');
      formData.append('authorRole', user?.role || '');
      formData.append('authorId', user?.id || '');
      if (image) formData.append('image', image);

      let savedPost;
      try {
        const res = await fetch('http://localhost:5000/api/posts', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.success) savedPost = data.post;
        else throw new Error(data.message);
      } catch {
        // Fallback: store locally with base64 image
        savedPost = {
          id: Date.now(),
          caption: caption.trim(),
          image: preview, // base64 blob URL (local only)
          authorName: user?.fullname || 'Anonymous',
          authorRole: user?.role || '',
          createdAt: new Date().toISOString(),
          local: true,
        };
      }

      const existing = loadUserPosts();
      const updated = [savedPost, ...existing];
      saveUserPosts(updated);
      onPost(updated);
      setCaption('');
      setImage(null);
      setPreview(null);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden">
      {!open ? (
        <button onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user.fullname?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-gray-400 text-sm flex-1 border border-gray-200 rounded-full px-4 py-2 bg-gray-50">
            Share an achievement or photo...
          </span>
          <Plus className="w-5 h-5 text-blue-500" />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.fullname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user.fullname}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
            <button type="button" onClick={() => { setOpen(false); setCaption(''); setImage(null); setPreview(null); }} className="ml-auto text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Share your achievement, milestone, or update..."
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none mb-3"
          />

          {preview && (
            <div className="relative mb-3">
              <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 cursor-pointer transition">
              <Image className="w-5 h-5" /> Add Photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setOpen(false); setCaption(''); setImage(null); setPreview(null); }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Cancel</button>
              <button type="submit" disabled={loading || (!caption.trim() && !image)}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 flex items-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

// ── User Achievement Post Card ──────────────────────────────────────────────
const UserPostCard = ({ post, user, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const allComments = loadComments();
  const commentCount = (allComments[`up_${post.id}`] || []).length;
  const shareUrl = window.location.href;
  const shareText = `${post.authorName} shared: ${post.caption}`;
  const isOwner = user && (String(user.id) === String(post.authorId) || user.role?.toLowerCase() === 'admin');

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await fetch(`http://localhost:5000/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: user?.id }),
      });
      onDelete(post.id);
    } catch {
      // fallback: remove locally
      onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.authorName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{post.authorName}</p>
          <p className="text-xs text-gray-400 capitalize">{post.authorRole} &middot; {new Date(post.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting}
              className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-40" title="Delete post">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {post.caption && <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{post.caption}</p>}

      {post.image && (
        <img src={post.image.startsWith('/uploads') ? `http://localhost:5000${post.image}` : post.image}
          alt="achievement" className="w-full max-h-80 object-cover rounded-lg border border-gray-100 mb-3" />
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 relative">
        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
          <MessageCircle className="w-4 h-4" />
          {commentCount > 0 ? `${commentCount} Comment${commentCount > 1 ? 's' : ''}` : 'Comment'}
        </button>
        <div className="relative ml-auto">
          <button onClick={() => setShowShare(v => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
            <Share2 className="w-4 h-4" /> Share
          </button>
          {showShare && <ShareMenu shareText={shareText} shareUrl={shareUrl} onClose={() => setShowShare(false)} />}
        </div>
      </div>
      {showComments && <CommentSection postKey={`up_${post.id}`} user={user} />}
    </div>
  );
};

// ── Job Post Card ───────────────────────────────────────────────────────────
const JobPostCard = ({ job, user, navigate }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const allComments = loadComments();
  const commentCount = (allComments[job.id] || []).length;
  const jobUrl = `${window.location.origin}${window.location.pathname}#/jobs/${job.id}`;
  const shareText = `🚀 ${job.title} at ${job.company} — ${job.location} | ${job.salary}\nPosted by ${job.alumni} on CampusBridge`;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base truncate">{job.title}</h3>
            <p className="text-sm text-gray-600 font-medium">{job.company}</p>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.experience}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">{job.salary}</span>
          <span className="text-xs text-gray-400">by {job.alumni}</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500 line-clamp-2 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>{job.description}</p>
      <div className="mt-3 flex gap-2 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{job.mode}</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{job.positions}</span>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 relative">
        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
          <MessageCircle className="w-4 h-4" />
          {commentCount > 0 ? `${commentCount} Comment${commentCount > 1 ? 's' : ''}` : 'Comment'}
        </button>
        <div className="relative ml-auto">
          <button onClick={() => setShowShare(v => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
            <Share2 className="w-4 h-4" /> Share
          </button>
          {showShare && <ShareMenu shareText={shareText} shareUrl={jobUrl} onClose={() => setShowShare(false)} />}
        </div>
      </div>
      {showComments && <CommentSection postKey={job.id} user={user} />}
    </div>
  );
};

// ── Main Posts Page ─────────────────────────────────────────────────────────
const Posts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [userPosts, setUserPosts] = useState(loadUserPosts);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'jobs' | 'achievements'

  useEffect(() => {
    const loadData = () => {
      setNotifications(getPersistentNotifications());
      setJobs([...getJobData()].reverse());
    };
    loadData();
    const unsub = subscribeToNotifications(() => { setNotifications(getPersistentNotifications()); setJobs([...getJobData()].reverse()); });
    const handleStorage = (e) => { if (e.key === 'studentNotifications' || e.key === 'alumniPostedJobs') loadData(); };
    window.addEventListener('storage', handleStorage);
    return () => { unsub(); window.removeEventListener('storage', handleStorage); };
  }, []);

  // Fetch user posts from backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then(r => r.json())
      .then(d => { if (d.success && d.posts.length > 0) setUserPosts(d.posts); })
      .catch(() => {}); // fallback to localStorage
  }, []);

  const filteredJobs = jobs.filter(job =>
    !search ||
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase()) ||
    job.alumni.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUserPosts = userPosts.filter(p =>
    !search || p.caption?.toLowerCase().includes(search.toLowerCase()) || p.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeletePost = (postId) => {
    const updated = userPosts.filter(p => String(p.id) !== String(postId));
    setUserPosts(updated);
    saveUserPosts(updated);
  };

  // Merge and sort all posts by date for 'all' tab
  const allItems = [
    ...filteredUserPosts.map(p => ({ ...p, _type: 'user' })),
    ...filteredJobs.map(j => ({ ...j, _type: 'job', createdAt: j.createdAt || new Date(0).toISOString() })),
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" /> Posts & Updates
        </h1>
        <p className="text-gray-500 mt-1">Job alerts, achievements, and updates from the CampusBridge community.</p>
      </div>

      {/* Create Post */}
      <CreatePostForm user={user} onPost={setUserPosts} />

      {/* Search */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm mb-5">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input type="text" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full outline-none text-sm text-gray-700 bg-transparent" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['all', 'All'], ['jobs', 'Job Alerts'], ['achievements', 'Achievements']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Alerts Banner */}
      {notifications.length > 0 && tab !== 'achievements' && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Recent Alerts ({notifications.length})
          </h2>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="flex items-start gap-3 text-sm">
                <span className="text-blue-500 mt-0.5">🔔</span>
                <div>
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-gray-500 text-xs">{n.message} &middot; {n.time || 'Recently'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-4">
        {tab === 'all' && allItems.map(item =>
          item._type === 'user'
            ? <UserPostCard key={`u_${item.id}`} post={item} user={user} />
            : <JobPostCard key={`j_${item.id}`} job={item} user={user} navigate={navigate} />
        )}
        {tab === 'jobs' && (filteredJobs.length === 0
          ? <div className="text-center py-20 text-gray-400"><Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No job posts found.</p></div>
          : filteredJobs.map(job => <JobPostCard key={job.id} job={job} user={user} navigate={navigate} />)
        )}
        {tab === 'achievements' && (filteredUserPosts.length === 0
          ? <div className="text-center py-20 text-gray-400"><Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No achievement posts yet. Be the first to share!</p></div>
          : filteredUserPosts.map(post => <UserPostCard key={post.id} post={post} user={user} />)
        )}
      </div>
    </div>
  );
};

export default Posts;
