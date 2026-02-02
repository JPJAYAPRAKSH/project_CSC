import { useState, useEffect } from 'react';
import { getCourses, getBatches, createBatch, exportStudentsCSV, sendBulkMessage, api } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Recent Actions State
    const [recentActions, setRecentActions] = useState([]);

    // Messaging State
    const [showMessagingModal, setShowMessagingModal] = useState(false);
    const [messageData, setMessageData] = useState({
        type: 'email',
        subject: 'Important Update from CSC Institute',
        content: ''
    });
    const [whatsappRecipients, setWhatsappRecipients] = useState([]);
    const [sendingMessage, setSendingMessage] = useState(false);

    // New Batch State
    const [showNewBatchModal, setShowNewBatchModal] = useState(false);
    const [newBatch, setNewBatch] = useState({
        name: '',
        course: '',
        time_slot: '',
        start_date: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [selectedCourse, selectedBatch]);

    const fetchInitialData = async () => {
        try {
            const [coursesRes, batchesRes] = await Promise.all([
                getCourses(),
                getBatches()
            ]);
            setCourses(coursesRes.data.results || coursesRes.data || []);
            setBatches(batchesRes.data.results || batchesRes.data || []);
            // Fetch admin actions
            fetchAdminActions();
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminActions = async () => {
        try {
            const res = await api.get('/admin-actions/');
            setRecentActions(res.data || []);
        } catch (error) {
            console.error('Error fetching admin actions:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const params = {};
            if (selectedCourse !== 'all') params.course_id = selectedCourse;
            if (selectedBatch !== 'all') params.batch_id = selectedBatch;

            const res = await api.get('/students/', { params });
            setStudents(res.data.results || res.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleExportCSV = async () => {
        try {
            const params = {};
            if (selectedCourse !== 'all') params.course_id = selectedCourse;
            if (selectedBatch !== 'all') params.batch_id = selectedBatch;

            const response = await exportStudentsCSV(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `students_export_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            const res = await createBatch(newBatch);
            setBatches([...batches, res.data]);
            setShowNewBatchModal(false);
            setNewBatch({ name: '', course: '', time_slot: '', start_date: '' });
        } catch (error) {
            console.error('Failed to create batch:', error);
        }
    };

    const handleSelectStudent = (id) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setSendingMessage(true);
        try {
            const res = await sendBulkMessage({
                student_ids: selectedStudentIds,
                ...messageData
            });

            if (messageData.type === 'whatsapp') {
                setWhatsappRecipients(res.data.recipients);
            } else {
                alert(res.data.message);
                setShowMessagingModal(false);
                setSelectedStudentIds([]);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to send message');
        } finally {
            setSendingMessage(false);
        }
    };

    const closeMessagingModal = () => {
        setShowMessagingModal(false);
        setWhatsappRecipients([]);
        setMessageData({ type: 'email', subject: 'Important Update from CSC Institute', content: '' });
    };

    // Filter students by search query
    const filteredStudents = students.filter(s => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            s.full_name?.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query) ||
            s.phone?.includes(query)
        );
    });

    // Stats calculations
    const pendingApprovals = students.filter(s => !s.is_active).length;
    const activeStudents = students.filter(s => s.is_active).length;

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="admin-header">
                    <div className="container">
                        <div className="admin-header-text">
                            <h1>Loading Dashboard...</h1>
                            <p>Please wait while we fetch your data</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Header Section */}
            <div className="admin-header">
                <div className="container">
                    <div className="admin-header-content">
                        <div className="admin-header-text">
                            <h1>👋 Welcome, Admin!</h1>
                            <p>Manage students, batches, and communications from one place</p>
                        </div>
                        <div className="admin-header-actions">
                            <button className="btn-glass" onClick={() => setShowNewBatchModal(true)}>
                                ➕ New Batch
                            </button>
                            <button className="btn-glass" onClick={handleExportCSV}>
                                📥 Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">👥</div>
                        <div className="stat-details">
                            <span className="stat-value">{students.length}</span>
                            <span className="stat-label">Total Students</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon success">✅</div>
                        <div className="stat-details">
                            <span className="stat-value">{activeStudents}</span>
                            <span className="stat-label">Active Students</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning">⏳</div>
                        <div className="stat-details">
                            <span className="stat-value">{pendingApprovals}</span>
                            <span className="stat-label">Pending Approval</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon info">📚</div>
                        <div className="stat-details">
                            <span className="stat-value">{batches.length}</span>
                            <span className="stat-label">Active Batches</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="admin-content">
                    <div className="admin-grid">
                        {/* Recent Actions Card */}
                        <div className="admin-card recent-actions-card">
                            <div className="card-header">
                                <h2>📋 Recent Actions</h2>
                            </div>
                            <div className="card-body">
                                {recentActions.length > 0 ? (
                                    <div className="actions-list">
                                        {recentActions.map(action => (
                                            <div key={action.id} className="action-item">
                                                <div className="action-icon">
                                                    {action.action_type === 'Added' && '➕'}
                                                    {action.action_type === 'Changed' && '✏️'}
                                                    {action.action_type === 'Deleted' && '🗑️'}
                                                </div>
                                                <div className="action-details">
                                                    <span className="action-user">{action.user}</span>
                                                    <span className="action-desc">
                                                        {action.action_type} <strong>{action.object_type}</strong>: {action.object_repr}
                                                    </span>
                                                    <span className="action-time">
                                                        {new Date(action.action_time).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📭</div>
                                        <h3>No recent actions</h3>
                                        <p>Admin actions will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Students Card */}
                        <div className="admin-card">
                            <div className="card-header">
                                <h2>👥 Student Management</h2>
                                <div className="filters-bar">
                                    <div className="filter-group">
                                        <label>Search</label>
                                        <input
                                            type="text"
                                            placeholder="Name, email, or phone..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="filter-group">
                                        <label>Course</label>
                                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                                            <option value="all">All Courses</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="filter-group">
                                        <label>Batch</label>
                                        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                                            <option value="all">All Batches</option>
                                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="actions-group">
                                        <button
                                            className="btn btn-info"
                                            disabled={selectedStudentIds.length === 0}
                                            onClick={() => setShowMessagingModal(true)}
                                        >
                                            💬 Message ({selectedStudentIds.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body" style={{ padding: 0 }}>
                                {filteredStudents.length > 0 ? (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th className="checkbox-cell">
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                                    />
                                                </th>
                                                <th>Student</th>
                                                <th>Contact</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map(student => (
                                                <tr key={student.id}>
                                                    <td className="checkbox-cell">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedStudentIds.includes(student.id)}
                                                            onChange={() => handleSelectStudent(student.id)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div className="table-avatar">
                                                                {student.photo ? (
                                                                    <img src={student.photo} alt="" />
                                                                ) : (
                                                                    student.full_name?.[0] || '?'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600 }}>{student.full_name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontSize: '0.9rem' }}>{student.email}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.phone}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${student.is_active ? 'active' : 'pending'}`}>
                                                            {student.is_active ? '✓ Active' : '⏳ Pending'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button className="btn btn-sm btn-outline">View</button>
                                                            {!student.is_active && (
                                                                <button className="btn btn-sm btn-success">Approve</button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📭</div>
                                        <h3>No students found</h3>
                                        <p>Try adjusting your filters or search query</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Batches Card */}
                        <div className="admin-card">
                            <div className="card-header">
                                <h2>📅 Active Batches</h2>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowNewBatchModal(true)}>
                                    + Add Batch
                                </button>
                            </div>
                            <div className="card-body">
                                {batches.length > 0 ? (
                                    <div className="batch-grid">
                                        {batches.map(batch => (
                                            <div className="batch-card" key={batch.id}>
                                                <div className="batch-card-header">
                                                    <h3>{batch.name}</h3>
                                                    <span className="status-badge active">Active</span>
                                                </div>
                                                <div className="batch-card-meta">
                                                    <span>📚 {batch.course_code || 'Course'}</span>
                                                    <span>⏰ {batch.time_slot}</span>
                                                    <span>📆 Started: {batch.start_date}</span>
                                                    <span>👥 {batch.student_count || 0} Students</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📅</div>
                                        <h3>No batches yet</h3>
                                        <p>Create your first batch to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Batch Modal */}
            {showNewBatchModal && (
                <div className="modal-overlay" onClick={() => setShowNewBatchModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Batch</h2>
                            <button className="modal-close" onClick={() => setShowNewBatchModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreateBatch}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Batch Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Feb 2026 Morning Batch"
                                        value={newBatch.name}
                                        onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Select Course</label>
                                    <select
                                        value={newBatch.course}
                                        onChange={(e) => setNewBatch({ ...newBatch, course: e.target.value })}
                                        required
                                    >
                                        <option value="">Choose a course...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Time Slot</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9:00 AM - 11:00 AM"
                                        value={newBatch.time_slot}
                                        onChange={(e) => setNewBatch({ ...newBatch, time_slot: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={newBatch.start_date}
                                        onChange={(e) => setNewBatch({ ...newBatch, start_date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={() => setShowNewBatchModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Messaging Modal */}
            {showMessagingModal && (
                <div className="modal-overlay" onClick={closeMessagingModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Send Bulk Message</h2>
                            <button className="modal-close" onClick={closeMessagingModal}>×</button>
                        </div>

                        {!whatsappRecipients.length ? (
                            <form onSubmit={handleSendMessage}>
                                <div className="modal-body">
                                    <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                                        Sending message to <strong>{selectedStudentIds.length}</strong> selected students
                                    </p>

                                    <div className="form-group">
                                        <label>Message Type</label>
                                        <select
                                            value={messageData.type}
                                            onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                                        >
                                            <option value="email">📧 Email</option>
                                            <option value="whatsapp">💬 WhatsApp</option>
                                        </select>
                                    </div>

                                    {messageData.type === 'email' && (
                                        <div className="form-group">
                                            <label>Subject</label>
                                            <input
                                                type="text"
                                                value={messageData.subject}
                                                onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Message Content</label>
                                        <textarea
                                            value={messageData.content}
                                            onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                                            placeholder="Type your message here..."
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline" onClick={closeMessagingModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={sendingMessage}>
                                        {sendingMessage ? 'Sending...' : (messageData.type === 'email' ? '📧 Send Emails' : '💬 Generate Links')}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="modal-body">
                                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>
                                        WhatsApp links generated! Click each to open the chat:
                                    </p>
                                    <div className="whatsapp-list">
                                        {whatsappRecipients.map(r => (
                                            <div key={r.phone} className="whatsapp-item">
                                                <div className="recipient-info">
                                                    <span className="recipient-name">{r.name}</span>
                                                    <span className="recipient-phone">{r.phone}</span>
                                                </div>
                                                <a
                                                    href={`https://wa.me/${r.phone}?text=${encodeURIComponent(messageData.content)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-whatsapp"
                                                >
                                                    Open Chat
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-primary" onClick={closeMessagingModal}>
                                        Done
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
