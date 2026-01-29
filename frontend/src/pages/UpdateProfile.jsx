import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateStudentProfile } from '../services/api';
import './UpdateProfile.css';

function UpdateProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [photoPreview, setPhotoPreview] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        bio: '',
        instagram_url: '',
        linkedin_url: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || '',
                email: user.email || '',
                bio: user.bio || '',
                instagram_url: user.instagram_url || '',
                linkedin_url: user.linkedin_url || ''
            });
            if (user.photo) {
                setPhotoPreview(user.photo);
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
            alert('Name, Email, and Mobile Number are required.');
            return;
        }

        setSubmitting(true);
        const submitData = new FormData(e.target);

        try {
            await updateStudentProfile(user.id, Object.fromEntries(submitData));
            alert('Profile updated successfully!');
            // Refresh auth context by navigating
            navigate('/student-portal');
            window.location.reload();
        } catch (error) {
            console.error('Update failed:', error);
            alert(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div className="update-profile-page">
            <div className="update-header">
                <div className="container">
                    <h1>Update Your Profile</h1>
                    <p>Keep your information up-to-date for better communication</p>
                </div>
            </div>

            <div className="container">
                <div className="update-profile-card">
                    <div className="photo-section">
                        <div className="photo-preview">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" />
                            ) : (
                                <div className="photo-placeholder">
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <p className="photo-hint">Click below to upload a new photo</p>
                    </div>

                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="form-group">
                            <label>Passport Photo <span className="required">*</span></label>
                            <input
                                type="file"
                                name="photo"
                                accept="image/*"
                                className="file-input"
                                onChange={handlePhotoChange}
                            />
                            <small>Upload a clear passport-size photo (JPG, PNG)</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Mobile Number <span className="required">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address <span className="required">*</span></label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Bio / About Me</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Tell us a bit about yourself..."
                                rows="4"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Instagram URL (Optional)</label>
                            <input
                                type="url"
                                name="instagram_url"
                                value={formData.instagram_url}
                                onChange={handleInputChange}
                                placeholder="https://instagram.com/yourhandle"
                            />
                        </div>

                        <div className="form-group">
                            <label>LinkedIn URL (Optional)</label>
                            <input
                                type="url"
                                name="linkedin_url"
                                value={formData.linkedin_url}
                                onChange={handleInputChange}
                                placeholder="https://linkedin.com/in/yourhandle"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-outline" onClick={() => navigate('/student-portal')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfile;
