import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/me', {
        name: formData.name,
        phone: formData.phone
      });

      // Refresh user data
      const response = await axios.get('/api/auth/me');
      // Note: In a real app, you'd update the context, but for now we'll reload
      window.location.reload();
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        // Could redirect to login here
      } else {
        alert(error.response?.data?.error || 'Failed to update profile');
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="edit-btn"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="disabled-input"
                title="Email cannot be changed"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                disabled
                className="disabled-input"
                title="Department can only be changed by administrators"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="disabled-input"
              />
            </div>

            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user?.name}</span>
            </div>

            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>

            <div className="info-item">
              <label>Phone:</label>
              <span>{user?.phone || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Department:</label>
              <span>{user?.department || 'Not assigned'}</span>
            </div>

            <div className="info-item">
              <label>Role:</label>
              <span>{user?.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;