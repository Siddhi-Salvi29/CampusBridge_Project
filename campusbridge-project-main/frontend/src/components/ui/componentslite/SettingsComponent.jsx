import React, { useState } from 'react';
import { Settings, UserPlus, Database, Trash2, CheckCircle, XCircle } from 'lucide-react';

const SettingsComponent = () => {
    // 💡 State for General Settings (Settings data will ideally come from a Backend API)
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
    const [defaultStatus, setDefaultStatus] = useState('Active');
    const [isJobApprovalRequired, setIsJobApprovalRequired] = useState(true);

    const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'

    // Save Settings Handler
    const handleSaveSettings = () => {
        setSaveStatus('loading');
        // 💡 Actual API call to save settings (e.g., PUT /api/admin/settings)
        console.log("Saving settings:", { isRegistrationOpen, defaultStatus, isJobApprovalRequired });
        
        // Simulating API delay
        setTimeout(() => {
            setSaveStatus('success'); // Change to 'error' if API fails
            setTimeout(() => setSaveStatus(null), 3000); // Clear message after 3 seconds
        }, 1500);
    };

    // System Action Handler
    const handleSystemAction = (action) => {
        if (action === 'backup') {
            if (window.confirm("Are you sure you want to trigger a database backup?")) {
                console.log("Triggering Database Backup...");
                // 💡 API Call to start backup (e.g., POST /api/admin/backup)
                alert("Database backup process started! Check server logs.");
            }
        } else if (action === 'clearCache') {
            if (window.confirm("Are you sure you want to clear system cache? This cannot be undone.")) {
                console.log("Clearing System Cache...");
                // 💡 API Call to clear cache (e.g., POST /api/admin/cache-clear)
                alert("System cache cleared successfully!");
            }
        }
    };

    // Reusable Toggle Switch Component
    const ToggleSwitch = ({ label, enabled, setEnabled }) => (
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <label className="text-gray-700 font-medium text-sm">{label}</label>
            <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#6A38C2]' : 'bg-gray-200'}`}
                aria-checked={enabled}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-7 h-7 text-[#6A38C2]" />
                System Settings
            </h1>

            {/* --- Section 1: General Application Control --- */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    General Access Control
                </h2>
                
                <ToggleSwitch 
                    label="Enable New User Registration (Student/Alumni)" 
                    enabled={isRegistrationOpen} 
                    setEnabled={setIsRegistrationOpen} 
                />

                <ToggleSwitch 
                    label="Require Admin Approval for New Job Postings" 
                    enabled={isJobApprovalRequired} 
                    setEnabled={setIsJobApprovalRequired} 
                />
                
                {/* Dropdown for Default Status */}
                <div className="flex justify-between items-center py-3">
                    <label className="text-gray-700 font-medium text-sm">Default New User Status</label>
                    <select
                        value={defaultStatus}
                        onChange={(e) => setDefaultStatus(e.target.value)}
                        className="py-1 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:ring-[#6A38C2] focus:border-[#6A38C2]"
                    >
                        <option value="Active">Active (Instant Access)</option>
                        <option value="Pending">Pending (Requires Manual Approval)</option>
                    </select>
                </div>

                {/* Save Button & Status */}
                <div className="mt-6 flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
                    {saveStatus === 'success' && (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Settings Saved!
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-red-600 text-sm flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Save Failed.
                        </span>
                    )}
                    {saveStatus !== 'loading' ? (
                        <button 
                            onClick={handleSaveSettings}
                            className="py-2 px-5 bg-[#6A38C2] text-white rounded-lg font-medium hover:bg-[#5A28A2] transition shadow-md"
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button 
                            disabled 
                            className="py-2 px-5 bg-gray-400 text-white rounded-lg font-medium"
                        >
                            Saving...
                        </button>
                    )}
                </div>
            </div>

            {/* --- Section 2: System Maintenance & Actions --- */}
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                    System Maintenance
                </h2>
                <div className="space-y-4">
                    
                    {/* Database Backup */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-blue-500" />
                            <p className="text-sm text-gray-700">Database Backup (Full Snapshot)</p>
                        </div>
                        <button 
                            onClick={() => handleSystemAction('backup')}
                            className="py-1.5 px-4 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            Trigger Backup
                        </button>
                    </div>

                    {/* Clear Cache */}
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <p className="text-sm text-gray-700">Clear System Cache / Temp Files</p>
                        </div>
                        <button 
                            onClick={() => handleSystemAction('clearCache')}
                            className="py-1.5 px-4 text-sm border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition"
                        >
                            Clear Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsComponent;