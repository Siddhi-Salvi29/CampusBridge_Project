// import React from 'react'

// const PrivacyPolicy = () => {
//   return (
//     <div class="bg-gray-100 text-gray-800">

//   {/* <!-- Header --> */}
//   <header class="bg-gray-900 text-white p-6">
//     <div class="container mx-auto">
//       <h1 class="text-2xl font-bold">Campus Bridge</h1>
//     </div>
//   </header>

//   {/* <!-- Privacy Policy --> */}
//   <main class="container mx-auto px-6 py-10 bg-white shadow-md rounded-lg mt-6">
//     <h2 class="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h2>
//     <p class="mb-4 text-sm text-gray-500">Effective Date: January 1, 2025</p>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">1. Information We Collect</h3>
//       <p>We may collect personal details such as your name, email, phone number, resume, job history, and browsing data.</p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">2. How We Use Your Information</h3>
//       <ul class="list-disc list-inside space-y-1">
//         <li>To provide job search and recruitment services</li>
//         <li>To communicate with employers and job seekers</li>
//         <li>To personalize job recommendations</li>
//         <li>To comply with legal obligations</li>
//       </ul>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">3. Sharing of Information</h3>
//       <p>We may share your information with employers, service providers, or as required by law. We do not sell your data to third parties.</p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">4. Cookies & Tracking</h3>
//       <p>We use cookies to improve functionality, analyze traffic, and personalize your experience. You may disable cookies in your browser settings.</p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">5. Data Retention & Security</h3>
//       <p>Your data is retained while your account is active. We implement security measures but cannot guarantee absolute protection.</p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">6. Your Rights</h3>
//       <p>You may request access, update, or deletion of your personal data by contacting us at 
//         <a href="mailto:support@jobconnect.com" class="text-blue-600 underline">support@campusbridge.com</a>.
//       </p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">7. Changes to This Policy</h3>
//       <p>We may update this Privacy Policy occasionally. Updates will be posted on this page.</p>
//     </section>

//     <section class="mb-6">
//       <h3 class="text-xl font-semibold mb-2">8. Contact Us</h3>
//       <p>If you have questions, reach us at:</p>
//       <p>Email: <a href="mailto:support@jobconnect.com" class="text-blue-600 underline">support@campusbridge.com</a></p>
//       <p>Phone: +1 (555) 123-4567</p>
//       <p>Address: 123 Business St, New York, NY, USA</p>
//     </section>
//   </main>
// {/* 
//   <!-- Footer --> */}
//   <footer class="bg-gray-900 text-gray-400 text-center py-6 mt-10">
//     <p>© 2025 JobConnect. All rights reserved.</p>
//   </footer>
 
//     </div>
//   )
// }

// export default PrivacyPolicy



import React from 'react'

const PrivacyPolicy = () => {
  return (
    // Main wrapper with white background
    <div className="bg-white min-h-screen text-gray-800">

      {/* Header - Using Primary Purple Color */}
      <header className="bg-[#6A38C2] text-white p-6 shadow-md">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold">Campus Bridge</h1>
        </div>
      </header>

      {/* Privacy Policy Content */}
      <main className="container mx-auto max-w-7xl px-6 py-10 bg-white mt-6">
        <h2 className="text-4xl font-extrabold mb-8 text-gray-900">Privacy Policy</h2>
        <p className="mb-6 text-sm text-gray-500">Effective Date: January 1, 2025</p>

        {/* 1. Information We Collect */}
        <section className="mb-8 p-4 border-l-4 border-[#6A38C2] bg-gray-50 rounded-r-lg">
          <h3 className="text-xl font-bold mb-2 text-[#6A38C2]">1. Information We Collect</h3>
          <p className='text-gray-700'>We may collect personal details such as your name, email, phone number, resume, job history, and browsing data.</p>
        </section>

        {/* 2. How We Use Your Information */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">2. How We Use Your Information</h3>
          <ul className="list-disc list-inside space-y-2 ml-4 text-gray-700">
            <li>To provide job search and recruitment services</li>
            <li>To communicate with employers and job seekers</li>
            <li>To personalize job recommendations</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        {/* 3. Sharing of Information */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Sharing of Information</h3>
          <p className='text-gray-700'>We may share your information with employers, service providers, or as required by law. We do not sell your data to third parties.</p>
        </section>

        {/* 4. Cookies & Tracking */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">4. Cookies & Tracking</h3>
          <p className='text-gray-700'>We use cookies to improve functionality, analyze traffic, and personalize your experience. You may disable cookies in your browser settings.</p>
        </section>

        {/* 5. Data Retention & Security */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">5. Data Retention & Security</h3>
          <p className='text-gray-700'>Your data is retained while your account is active. We implement security measures but cannot guarantee absolute protection.</p>
        </section>

        {/* 6. Your Rights */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">6. Your Rights</h3>
          <p className='text-gray-700'>You may request access, update, or deletion of your personal data by contacting us at 
            <a href="mailto:support@campusbridge.com" className="text-[#6A38C2] hover:text-[#5C2DA9] underline ml-1">support@campusbridge.com</a>.
          </p>
        </section>

        {/* 7. Changes to This Policy */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">7. Changes to This Policy</h3>
          <p className='text-gray-700'>We may update this Privacy Policy occasionally. Updates will be posted on this page.</p>
        </section>

        {/* 8. Contact Us */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">8. Contact Us</h3>
          <p className='text-gray-700'>If you have questions, reach us at:</p>
          <p className='text-gray-700'>Email: <a href="mailto:support@campusbridge.com" className="text-[#6A38C2] hover:text-[#5C2DA9] underline">support@campusbridge.com</a></p>
          <p className='text-gray-700'>Phone: +1 (555) 123-4567</p>
          <p className='text-gray-700'>Address: 123 Business St, New York, NY, USA</p>
        </section>
      </main>
      
      {/* Footer - Using Primary Purple Color */}
      <footer className="bg-[#6A38C2] text-gray-200 text-center py-6 mt-10 shadow-inner">
        <p>© 2025 Campus Bridge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default PrivacyPolicy;
