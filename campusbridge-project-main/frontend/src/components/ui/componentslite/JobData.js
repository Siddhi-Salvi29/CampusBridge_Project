// frontend/src/components/ui/componentslite/JobData.js (Updated)

const STORAGE_KEY = 'alumniPostedJobs';
const NOTIFICATION_KEY = 'studentNotifications';
// 💡 NEW CONSTANT for tracking student applications
const APPLICATIONS_KEY = 'studentJobApplications'; 

const initialJobData = [
    { id: "1", alumni: "Rohit Patil", company: "Tata Consultancy Services", location: "Pune", industry: "IT", experience: "0-3 years", title: "Full Stack Developer", description: "Looking for skilled React and Node.js developers to join our dynamic team.", positions: "5 Positions", salary: "6 LPA", mode: "Hybrid", type: "Full-Time" },
    { id: "2", alumni: "Sneha Kulkarni", company: "Infosys Ltd", location: "Bangalore", industry: "IT", experience: "3-5 years", title: "UI/UX Designer", description: "Creative designer needed to improve web and mobile interfaces for client projects.", positions: "3 Positions", salary: "8 LPA", mode: "On-Site", type: "Full-Time" },
    { id: "3", alumni: "Amit Deshmukh", company: "Amazon", location: "Hyderabad", industry: "IT", experience: "5-7 years", title: "Backend Developer", description: "We are hiring experienced backend developers proficient in Node.js and AWS.", positions: "4 Positions", salary: "25 LPA", mode: "Remote", type: "Full-Time" },
    { id: "4", alumni: "Priya Joshi", company: "Accenture", location: "Mumbai", industry: "Finance", experience: "0-3 years", title: "Data Analyst", description: "Analyze business data and prepare actionable insights using Power BI and Python.", positions: "2 Positions", salary: "10 LPA", mode: "Hybrid", type: "Full-Time" },
    { id: "5", alumni: "Karan Shinde", company: "Tech Mahindra", location: "Nagpur", industry: "IT", experience: "3-5 years", title: "Software Tester", description: "We are seeking QA engineers with automation testing experience using Selenium.", positions: "6 Positions", salary: "5 LPA", mode: "On-Site", type: "Full-Time" },
    { id: "6", alumni: "Neha More", company: "Cognizant", location: "Pune", industry: "IT", experience: "5-7 years", title: "Cloud Engineer", description: "Work with AWS and Azure cloud environments, managing infrastructure and deployment.", positions: "3 Positions", salary: "12 LPA", mode: "Remote", type: "Full-Time" },
    { id: "7", alumni: "Riya Sharma", company: "Google", location: "Bangalore", industry: "IT", experience: "7+ years", title: "Cloud Solutions Engineer", description: "Design, implement and manage scalable cloud infrastructure using GCP and AWS.", positions: "2 Positions", salary: "30 LPA", mode: "Remote", type: "Full-Time" },
    { id: "8", alumni: "Vikram Joshi", company: "Microsoft", location: "Hyderabad", industry: "IT", experience: "5-7 years", title: "Data Scientist", description: "Analyze large datasets using Python, SQL, and Machine Learning models.", positions: "3 Positions", salary: "28 LPA", mode: "Hybrid", type: "Full-Time" },
    { id: "9", alumni: "Anjali Patil", company: "Flipkart", location: "Bangalore", industry: "IT", experience: "0-3 years", title: "Frontend Developer", description: "Develop responsive and high-performing web applications using React.js.", positions: "4 Positions", salary: "12 LPA", mode: "On-Site", type: "Full-Time" },
    { id: "10", alumni: "Sanjay Kulkarni", company: "Adobe", location: "Bangalore", industry: "IT", experience: "3-5 years", title: "Frontend Developer", description: "Build modern and responsive web applications using React and TypeScript.", positions: "3 Positions", salary: "15 LPA", mode: "Hybrid", type: "Full-Time" },
    { id: "11", alumni: "Meera Patil", company: "IBM", location: "Pune", industry: "IT", experience: "7+ years", title: "DevOps Engineer", description: "Implement CI/CD pipelines and manage cloud infrastructure using Docker & Kubernetes.", positions: "2 Positions", salary: "20 LPA", mode: "Remote", type: "Full-Time" },
    { id: "12", alumni: "Rohini Joshi", company: "Paytm", location: "Mumbai", industry: "Finance", experience: "3-5 years", title: "Mobile App Developer", description: "Develop and maintain Android/iOS applications with Flutter or React Native.", positions: "4 Positions", salary: "12 LPA", mode: "On-Site", type: "Full-Time" },
    { id: "13", alumni: "Vivek Deshmukh", company: "Oracle", location: "Bangalore", industry: "IT", experience: "5-7 years", title: "Database Administrator", description: "Manage, optimize and secure large-scale databases on Oracle and MySQL.", positions: "2 Positions", salary: "18 LPA", mode: "Hybrid", type: "Full-Time" },
    { id: "14", alumni: "Ananya Sharma", company: "Uber", location: "Gurgaon", industry: "IT", experience: "7+ years", title: "Product Manager", description: "Lead product development and strategy for mobile and web platforms.", positions: "1 Position", salary: "35 LPA", mode: "On-Site", type: "Full-Time" },
    { id: "15", alumni: "Kunal Rathi", company: "Swiggy", location: "Bangalore", industry: "IT", experience: "3-5 years", title: "Backend Developer", description: "Develop and maintain APIs, microservices, and server-side applications in Node.js.", positions: "5 Positions", salary: "14 LPA", mode: "Hybrid", type: "Full-Time" },
].map(job => ({ ...job, id: String(job.id) })); // IDs are now strings

// ... (loadJobs, saveJobs, currentJobData, if (currentJobData.length === 0) block - As Is) ...
const loadJobs = () => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error("Error loading state from localStorage", e);
    }
    return initialJobData;
};

const saveJobs = (jobs) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    } catch (e) {
        console.error("Error saving state to localStorage", e);
    }
};

let currentJobData = loadJobs();

if (currentJobData.length === 0) {
    currentJobData = initialJobData;
    saveJobs(currentJobData);
}
// ====================================================================
// 🎯 Job Application Tracking Functions (NEW)
// ====================================================================

/**
 * लोकल स्टोरेजमधून ॲप्लाय केलेल्या जॉब्सची IDs (string array) परत करते.
 * @returns {string[]} Applied job IDs.
 */
export const getAppliedJobs = () => {
    try {
        const storedData = localStorage.getItem(APPLICATIONS_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Error loading applied jobs from localStorage", e);
        return [];
    }
};

/**
 * जॉबसाठी ॲप्लिकेशन लोकल स्टोरेजमध्ये सेव्ह करते.
 * @param {string | number} jobId - ॲप्लाय केलेला जॉब ID.
 * @returns {boolean} - ॲप्लिकेशन सेव्ह झाल्यास true, आधीच सेव्ह असल्यास false.
 */
export const saveApplication = (jobId) => {
    const appliedJobsList = getAppliedJobs();
    const jobIdStr = String(jobId);

    if (!appliedJobsList.includes(jobIdStr)) {
        appliedJobsList.push(jobIdStr);
        try {
            localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(appliedJobsList));
            // 💡 Dashboard update साठी storage event dispatch करा
            window.dispatchEvent(new Event('storage')); 
            return true; 
        } catch (e) {
            console.error("Error saving application to localStorage", e);
            return false;
        }
    }
    return false; 
};

// ====================================================================
// इतर एक्सपोर्ट्स (As Is)
// ====================================================================

let jobSubscribers = [];
let notificationSubscribers = [];

export const getJobData = () => currentJobData;

export const getJobById = (id) => {
    return currentJobData.find(job => String(job.id) === String(id));
};

export const subscribeToJobUpdates = (callback) => {
    jobSubscribers.push(callback);
    return () => {
        jobSubscribers = jobSubscribers.filter(sub => sub !== callback);
    };
};

export const subscribeToNotifications = (callback) => {
    notificationSubscribers.push(callback);
    return () => {
        notificationSubscribers = notificationSubscribers.filter(sub => sub !== callback);
    };
};

export const getPersistentNotifications = () => {
    try {
        const storedData = localStorage.getItem(NOTIFICATION_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (e) {
        console.error("Error loading notifications from localStorage", e);
    }
    return [];
};

const notifyJobSubscribers = () => {
    jobSubscribers.forEach(callback => callback(currentJobData));
};

const notifyStudentsOfNewJob = (jobTitle, company, alumniName) => {
    const notificationMessage = {
        id: Date.now(),
        type: 'new-job',
        title: "🔥 New Job Posted!",
        message: `${alumniName} from ${company} has posted a new job: ${jobTitle}.`,
        time: new Date().toLocaleTimeString('en-IN'),
    };
    
    notificationSubscribers.forEach(callback => callback(notificationMessage));
    const storedNotifs = getPersistentNotifications();
    const updatedNotifs = [notificationMessage, ...storedNotifs];
    
    try {
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(updatedNotifs));
    } catch (e) {
        console.error("Error saving notifications to localStorage", e);
    }
    window.dispatchEvent(new Event('storage'));
};

export const addJobToData = (newJob) => {
    newJob.id = String(newJob.id); 
    
    currentJobData = [newJob, ...currentJobData];
    saveJobs(currentJobData); 
    
    notifyJobSubscribers(); 
    notifyStudentsOfNewJob(newJob.title, newJob.company, newJob.alumni); 
};