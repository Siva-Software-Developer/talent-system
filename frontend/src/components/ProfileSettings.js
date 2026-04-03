import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Mail, 
  Calendar, 
  Camera, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Settings,
  ArrowLeft
} from 'lucide-react';

const ProfileSettings = () => {
  // Get user from localStorage
  const storedUser = JSON.parse(localStorage.getItem('user')) || {};
  
  const [formData, setFormData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    dob: storedUser.dob || '',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    storedUser.profile_pic 
      ? `http://localhost:5000/uploads/profiles/${storedUser.profile_pic}` 
      : null
  );
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Change (Image Preview)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('email', formData.email);
    data.append('name', formData.name);
    data.append('dob', formData.dob);
    if (profilePic) {
      data.append('profile_pic', profilePic);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/user/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        setMessage({ type: 'success', text: 'Profile updated successfully, Machi! ✅' });
        
        // Update localStorage
        const updatedUser = { 
            ...storedUser, 
            name: formData.name, 
            dob: formData.dob,
            profile_pic: res.data.profile_pic || storedUser.profile_pic
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Try again machi! ❌' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-wrapper min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Breadcrumb / Back Button */}
        <div className="flex items-center gap-2 text-gray-500 mb-6 cursor-pointer hover:text-blue-600 transition-colors w-fit">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </div>

        <div className="profile-card bg-white rounded-3xl shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
             <div className="absolute -bottom-12 left-8">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white bg-gray-100 shadow-lg flex items-center justify-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-gray-300" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl text-blue-600 cursor-pointer hover:bg-blue-50 transition-all shadow-md border border-gray-100">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
             </div>
          </div>

          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                <p className="text-gray-500 text-sm">Update your personal information and photo</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Settings className="text-gray-400" size={20} />
              </div>
            </div>

            {/* Alert Messages */}
            {message.text && (
              <div className={`mb-8 p-4 rounded-2xl flex items-center animate-in fade-in slide-in-from-top-4 duration-300 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {message.type === 'success' ? <CheckCircle className="mr-3" size={20} /> : <AlertCircle className="mr-3" size={20} />}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all text-gray-900 outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Email Field (Disabled) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="block w-full pl-11 pr-4 py-3 border border-gray-100 bg-gray-100/50 rounded-2xl text-gray-400 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                {/* DOB Field */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Date of Birth</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all text-gray-900 outline-none color-scheme-light"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 text-white bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-bold"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2" size={20} /> Update Changes
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  className="px-8 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-400 text-xs mt-8">
          Personal information is stored securely. For security questions, contact support.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;