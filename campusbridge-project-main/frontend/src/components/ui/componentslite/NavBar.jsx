import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Avatar, AvatarImage } from "../avatar";
import { LogOut, LayoutDashboard, Menu, X } from "lucide-react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user?.role) return "/profile";
    const role = user.role.toLowerCase();
    if (role === 'admin') return "/admin/dashboard";
    if (role === 'student') return "/student/dashboard";
    if (role === 'alumni' || role === 'alumini') return "/alumni/dashboard";
    return "/profile";
  };

  const handleLogout = () => { logout(); setMobileMenuOpen(false); };
  const handleDashboard = () => { navigate(getDashboardPath()); setIsOpen(false); setMobileMenuOpen(false); };

  const navLinks = [
    { label: "Home", path: "/home" },
    { label: "Posts", path: "/posts" },
    { label: "Jobs", path: "/jobs" },
    { label: "Network", path: "/network" },
    { label: "Internships", path: "/internships" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white border-b shadow-md">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-4 sm:px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-all hover:opacity-90 flex-shrink-0">
          <img src="/bridge-logo.jpg" alt="Campus Bridge Logo" className="w-10 h-9 sm:w-14 sm:h-12 rounded-md" />
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
            <span className="text-[#2563EB]">CAMPUS</span>
            <span className="text-[#FA4F09] ml-0.5">BRIDGE</span>
          </h1>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden lg:flex font-medium items-center gap-6 text-gray-700">
          {navLinks.map(({ label, path }) => (
            <Link key={label} to={path}
              className="relative transition-all duration-200 hover:text-[#2563EB] group text-sm">
              {label}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-[#2563EB] transition-all group-hover:w-full rounded-full" />
            </Link>
          ))}
        </ul>

        {/* Desktop auth */}
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login">
                <Button className="bg-[#2563EB] text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#FA4F09] text-white py-2 px-4 rounded-lg font-semibold shadow hover:bg-[#E24407] transition text-sm">Register</Button>
              </Link>
            </>
          ) : (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer w-10 h-10 ring-2 ring-gray-900 hover:ring-[#FA4F09]/60 transition-all duration-300">
                  <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-1 shadow-2xl border-none rounded-lg bg-gray-900 text-white"
                style={{ boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
                <div className="flex items-center gap-3 p-5 border-b border-gray-700 mb-2">
                  <Avatar className="w-10 h-10 ring-1 ring-gray-600">
                    <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-white">{user.fullname}</h3>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col p-3 space-y-2">
                  <Button onClick={handleDashboard}
                    className="flex items-center justify-center gap-2 w-full px-3 py-3 bg-[#2563EB] text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                  <Button onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-3 py-3 bg-[#FA4F09] text-white rounded-lg font-semibold hover:bg-[#E24407] transition text-sm">
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <Avatar className="cursor-pointer w-8 h-8 ring-2 ring-gray-300">
              <AvatarImage src={user.profile_photo || "/default-avatar.png"} alt={user.fullname} />
            </Avatar>
          )}
          <button onClick={() => setMobileMenuOpen(v => !v)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-4 space-y-1">
          {navLinks.map(({ label, path }) => (
            <Link key={label} to={path} onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-medium text-sm transition">
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-semibold text-sm">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#FA4F09] text-white py-2.5 rounded-lg font-semibold text-sm">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user.profile_photo || "/default-avatar.png"} />
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{user.fullname}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <Button onClick={handleDashboard}
                  className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white py-2.5 rounded-lg font-semibold text-sm">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Button>
                <Button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-[#FA4F09] text-white py-2.5 rounded-lg font-semibold text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
