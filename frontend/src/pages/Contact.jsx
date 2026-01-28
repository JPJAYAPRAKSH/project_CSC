import { useState } from 'react';
import { sendContactMessage } from '../services/api';
import '../pages/About.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await sendContactMessage(formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="contact-page">
            <div className="page-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>Get in touch with us for any queries or enrollment information</p>
                </div>
            </div>

            <div className="container section">
                <div className="contact-grid">
                    <div className="contact-form-section">
                        <h2>Send us a Message</h2>
                        {submitted && (
                            <div className="success-message">
                                Thank you! Your message has been sent successfully.
                            </div>
                        )}
                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Message *</label>
                                <textarea
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Send Message</button>
                        </form>
                    </div>

                    <div className="contact-info-section">
                        <h2>Contact Information</h2>
                        <div className="info-item">
                            <h4>📧 Email</h4>
                            <p>info@csccomputers.com</p>
                        </div>
                        <div className="info-item">
                            <h4>📞 Phone</h4>
                            <p>+91-XXXXXXXXXX</p>
                        </div>
                        <div className="info-item">
                            <h4>🏢 Centers</h4>
                            <p>360+ Centers Nationwide</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
