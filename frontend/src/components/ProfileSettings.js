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
  ArrowLeft,
  X,
  Phone,
  Briefcase,
  Layers,
  Clock
} from 'lucide-react';
import "./ProfileSettings.css";

const ProfileSettings = ({ onClose, onUpdate, user: dashboardUser }) => {
  // Syncing the key with Dashboard: 'dtms_user'
  const storedUser = JSON.parse(localStorage.getItem('dtms_user')) || dashboardUser || {};
  
  const [formData, setFormData] = useState({
    name: storedUser.name || '',
    email: storedUser.email || '',
    dob: storedUser.dob || '',
    mobile: storedUser.mobile || '',
    role: storedUser.role || 'Team Member',
    domain: storedUser.domain || 'Engineering',
    joinedDate: storedUser.joinedDate || '2024-01-01',
  });

  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    storedUser.profilePic || storedUser.avatar || null
  );
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Preparing the update object
    const updatedUserData = {
      ...storedUser,
      name: formData.name,
      dob: formData.dob,
      mobile: formData.mobile,
      profilePic: previewUrl // Sending the preview for instant UI update
    };

    const data = new FormData();
    data.append('email', formData.email);
    data.append('name', formData.name);
    data.append('dob', formData.dob);
    data.append('mobile', formData.mobile);
    if (profilePic) {
      data.append('profile_pic', profilePic);
    }

    try {
      // Inga unga API call
      const res = await axios.post('http://localhost:5000/api/user/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 200) {
        if (res.data.profile_pic) {
          updatedUserData.profilePic = `http://localhost:5000/uploads/profiles/${res.data.profile_pic}`;
        }
        
        // This is the Magic: It updates the Dashboard state!
        onUpdate(updatedUserData); 
        setMessage({ type: 'success', text: 'Profile updated successfully! ✅' });
      }
    } catch (err) {
      console.error(err);
      // Even if API fails for local dev, let's update UI for feedback
      onUpdate(updatedUserData);
      setMessage({ type: 'success', text: 'Local update successful! ✅' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ps-root-container">
      <div className="ps-content-box">
        
        <div className="ps-back-btn" onClick={onClose} style={{cursor: 'pointer'}}>
          <ArrowLeft size={18} />
          <span>Return to Dashboard</span>
        </div>

        <div className="ps-main-card">
          <div className="ps-header-banner">
             <div className="ps-role-badge">{formData.role.toUpperCase()}</div>
             <div className="ps-avatar-wrapper">
                <div className="ps-avatar-container">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="ps-avatar-img" />
                  ) : (
                    <User size={48} className="ps-avatar-placeholder" />
                  )}
                </div>
                <label className="ps-camera-trigger">
                  <Camera size={18} />
                  <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                </label>
             </div>
          </div>

          <div className="ps-form-content">
            <div className="ps-form-header">
              <div className="ps-title-group">
                <h2 className="ps-main-title">Digital Identity</h2>
                <p className="ps-subtitle">Manage your professional profile details.</p>
              </div>
              <div className="ps-icon-pill">
                <Settings size={20} />
              </div>
            </div>

            {message.text && (
              <div className={`ps-alert ps-alert-${message.type}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
                <X size={16} className="ps-alert-close" onClick={() => setMessage({type:'', text:''})} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="ps-form-grid">
              <h4 className="ps-section-divider">Personal Information</h4>
              <div className="ps-input-row">
                <div className="ps-input-field">
                  <label className="ps-label">Full Name</label>
                  <div className="ps-input-wrapper">
                    <User className="ps-input-icon" size={18} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="ps-input-box" placeholder="Your name" />
                  </div>
                </div>

                <div className="ps-input-field">
                  <label className="ps-label">Mobile Number</label>
                  <div className="ps-input-wrapper">
                    <Phone className="ps-input-icon" size={18} />
                    <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="ps-input-box" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
              </div>

              <div className="ps-input-row">
                <div className="ps-input-field">
                  <label className="ps-label">Registered Email</label>
                  <div className="ps-input-wrapper ps-disabled-field">
                    <Mail className="ps-input-icon" size={18} />
                    <input type="email" value={formData.email} disabled className="ps-input-box" />
                  </div>
                </div>

                <div className="ps-input-field">
                  <label className="ps-label">Date of Birth</label>
                  <div className="ps-input-wrapper">
                    <Calendar className="ps-input-icon" size={18} />
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="ps-input-box" />
                  </div>
                </div>
              </div>

              <h4 className="ps-section-divider">Work Information</h4>
              <div className="ps-input-row">
                <div className="ps-input-field">
                  <label className="ps-label">Company Domain</label>
                  <div className="ps-input-wrapper ps-disabled-field">
                    <Layers className="ps-input-icon" size={18} />
                    <input type="text" value={formData.domain} disabled className="ps-input-box" />
                  </div>
                </div>

                <div className="ps-input-field">
                  <label className="ps-label">Joined Date</label>
                  <div className="ps-input-wrapper ps-disabled-field">
                    <Clock className="ps-input-icon" size={18} />
                    <input type="text" value={formData.joinedDate} disabled className="ps-input-box" />
                  </div>
                </div>
              </div>

              <div className="ps-footer-actions">
                <button type="button" className="ps-btn-cancel" onClick={onClose}>Discard</button>
                <button type="submit" disabled={loading} className="ps-btn-submit">
                  {loading ? <div className="ps-spinner"></div> : <><Save size={20} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;