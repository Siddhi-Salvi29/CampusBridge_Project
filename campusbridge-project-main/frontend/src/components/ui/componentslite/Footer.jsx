// import React from 'react'
// import { Link } from 'react-router-dom'
// import PrivacyPolicy from './PrivacyPolicy'

// const Footer = () => {
//   return (
//     <div className="bg-[#6A38C2] text-gray-300 py-10">
//   <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
    
//     {/* <!-- Brand --> */}
//     <div>
//       <h2 className="text-white text-xl font-bold">CampusBridge</h2>
//       <p className="mt-3 text-sm">Connecting Campus talent with Alumini Support</p>
//     </div>

//     {/* Quick Links  */}
//     <div>
//       <h3 className="text-white font-semibold mb-3">Quick Links</h3>
//       <u className="space-y-2 text-sm">
//         <li><a href="#" className="hover:text-white">Home</a></li>
//         <li><a href="#" className="hover:text-white">Post a Job</a></li>
//         <li><a href="#" className="hover:text-white">Browse</a></li>
//         <li><a href="#"className="hover:text-white">Internships</a></li>
//       </u>
//     </div>

//     {/* <!-- Categories --> */}
//     <div>
//       <h3 className="text-white font-semibold mb-3">Job Categories</h3>
//       <ul className="space-y-2 text-sm">
//         <li><a href="#" className="hover:text-white">Full Stack Developer</a></li>
//         <li><a href="#" className="hover:text-white"> DevOps ENgineer</a></li>
//         <li><a href="#" className="hover:text-white">Machine Learning</a></li>
//         <li><a href="#" class="hover:text-white">Product Manager</a></li>
//       </ul>
//     </div>

//     {/* <!-- Contact --> */}
//     <div>
//       <h3 class="text-white font-semibold mb-3">Get in Touch</h3>
//       <p class="text-sm">support@campusbridge.com</p>
//       <p class="text-sm">+1 (555) 123-4567</p>
 
//       <div class="flex space-x-4 mt-3">
//         <a href="#"><i class="fab fa-linkedin text-white"></i></a>
//         <a href="#"><i class="fab fa-twitter text-white"></i></a>
//         <a href="#"><i class="fab fa-facebook text-white"></i></a>
//       </div>
//     </div>

//   </div>

//   {/* <!-- Copyright --> */}
//   <div class="text-center text-sm mt-8 border-t border-gray-700 pt-4">
//     © 2025 JobConnect. All rights reserved.
//      <Link to={"/PrivacyPolicy"}>Privacy Policy</Link>

         
//       <p class="text-sm"> <a href="/">Terms & Conditions</a></p>

//   </div>


//     </div>
//   )
// }

// export default Footer



import React from 'react'
import { Link } from 'react-router-dom'
// Lucide Icons for Social Media
import { Linkedin, Twitter, Facebook } from 'lucide-react'; 

const Footer = () => {
  return (
    // Purple Background from your code: bg-[#6A38C2]
    <div className="bg-[#6A38C2] text-gray-300 py-10">
      <div className="container mx-auto max-w-6xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-white text-2xl font-bold tracking-wider">CAMPUS BRIDGE</h2>
          <p className="mt-4 text-sm max-w-[200px]">Connecting Campus talent with Alumni Support and Career Opportunities.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-3 border-b-2 border-white/50 pb-1 inline-block">Quick Links</h3>
          {/* Using <ul> and React Link */}
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/post-job" className="hover:text-white transition-colors">Post a Job</Link></li>
            <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
            <li><Link to="/internships" className="hover:text-white transition-colors">Internships</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-white font-semibold mb-3 border-b-2 border-white/50 pb-1 inline-block">Job Categories</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/jobs?category=fullstack" className="hover:text-white transition-colors">Full Stack Developer</Link></li>
            <li><Link to="/jobs?category=devops" className="hover:text-white transition-colors">DevOps Engineer</Link></li>
            <li><Link to="/jobs?category=ml" className="hover:text-white transition-colors">Machine Learning</Link></li>
            <li><Link to="/jobs?category=pm" className="hover:text-white transition-colors">Product Manager</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-white font-semibold mb-3 border-b-2 border-white/50 pb-1 inline-block">Get in Touch</h3>
          <p className="text-sm">support@campusbridge.com</p>
          <p className="text-sm">+1 (555) 123-4567</p>
    
          {/* Social Icons (Using Lucide Icons) */}
          <div className="flex space-x-4 mt-5">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-100 transition-colors">
              <Linkedin className="w-5 h-5"/>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-100 transition-colors">
              <Twitter className="w-5 h-5"/>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-100 transition-colors">
              <Facebook className="w-5 h-5"/>
            </a>
          </div>
        </div>

      </div>

      {/* Copyright & Legal */}
      <div className="text-center text-sm mt-10 border-t border-gray-700 pt-6">
        <p className="mb-2">© 2025 CampusBridge. All rights reserved.</p>
        <div className='flex justify-center space-x-4'>
            {/* PrivacyPolicy link corrected to use 'to' prop */}
            <Link to="/privacy-policy" className='hover:text-white transition-colors'>Privacy Policy</Link>
            <p>|</p>
            <Link to="/terms" className='hover:text-white transition-colors'>Terms & Conditions</Link>
        </div>
      </div>
    </div>
  )
}

export default Footer;
