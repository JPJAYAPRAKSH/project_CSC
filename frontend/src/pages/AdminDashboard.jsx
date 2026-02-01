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
    const [stats, setStats] = useState({ total_students: 0, total_batches: 0 });

    // Messaging State
    const [showMessagingModal, setShowMessagingModal] = useState(false);
    const [messageData, setMessageData] = useState({
        type: 'email',
        subject: 'Important Update from CSC Institute',
        content: ''
    });
    const [whatsappRecipients, setWhatsappRecipients] = useState([]);

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
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const params = {};
            if (selectedCourse !== 'all') params.course_id = selectedCourse;
            if (selectedBatch !== 'all') params.batch_id = selectedBatch;

            // We'll use the core students endpoint with filtering
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
            setSelectedStudentIds(students.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        try {
            const res = await sendBulkMessage({
                student_ids: selectedStudentIds,
                ...messageData
            });

            if (messageData.type === 'whatsapp') {
                setWhatsappRecipients(res.data.recipients);
                // Don't close modal yet so they can click the links
            } else {
                alert(res.data.message);
                setShowMessagingModal(false);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to send message');
        }
    };

    if (loading) return <div className="loading">Loading Dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <h1>Administrator Dashboard</h1>
                    <p>Manage students, batches, and export data</p>
                </div>
            </div>

            <div className="container dashboard-grid">
                {/* Stats Bar */}
                <div className="stats-bar card">
                    <div className="stat-item">
                        <span className="label">Active Batches</span>
                        <span className="value">{batches.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="label">Total Students</span>
                        <span className="value">{students.length}</span>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="actions-bar card">
                    <div className="filter-group">
                        <label>Filter by Course</label>
                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                            <option value="all">All Courses</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Filter by Batch</label>
                        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                            <option value="all">All Batches</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="button-group">
                        <button className="btn btn-primary" onClick={() => setShowNewBatchModal(true)}>
                            + New Batch
                        </button>
                        <button
                            className="btn btn-info"
                            disabled={selectedStudentIds.length === 0}
                            onClick={() => setShowMessagingModal(true)}
                        >
                            💬 Send Message ({selectedStudentIds.length})
                        </button>
                        <button className="btn btn-secondary" onClick={handleExportCSV}>
                            📥 Export Spreadsheet
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="data-table card">
                    <h2>Student Records (Course-wise)</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={students.length > 0 && selectedStudentIds.length === students.length}
                                    />
                                </th>
                                <th>Photo</th>
                                <th>Name</th>
                                <th>Email/Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleSelectStudent(student.id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="table-avatar">
                                            {student.photo ? <img src={student.photo} alt="" /> : student.full_name[0]}
                                        </div>
                                    </td>
                                    <td>{student.full_name}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>{student.email}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{student.phone}</div>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Batches Table */}
                <div className="data-table card">
                    <h2>Current Batches</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Batch Name</th>
                                <th>Course</th>
                                <th>Time Slot</th>
                                <th>Start Date</th>
                                <th>Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batches.map(batch => (
                                <tr key={batch.id}>
                                    <td>{batch.name}</td>
                                    <td>{batch.course_code}</td>
                                    <td>{batch.time_slot}</td>
                                    <td>{batch.start_date}</td>
                                    <td>{batch.student_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for New Batch */}
            {showNewBatchModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <h2>Create New Batch</h2>
                        <form onSubmit={handleCreateBatch}>
                            <div className="form-group">
                                <label>Batch Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Feb 2026 Morning"
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
                                    <option value="">Choose Course</option>
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
                            <div className="modal-buttons">
                                <button type="button" className="btn btn-outline" onClick={() => setShowNewBatchModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Batch</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Messaging */}
            {showMessagingModal && (
                <div className="modal-overlay">
                    <div className="modal card" style={{ maxWidth: '600px' }}>
                        <h2>Send Bulk Message</h2>
                        <p>Communicating with {selectedStudentIds.length} selected students</p>

                        {!whatsappRecipients.length ? (
                            <form onSubmit={handleSendMessage}>
                                <div className="form-group">
                                    <label>Message Type</label>
                                    <select
                                        value={messageData.type}
                                        onChange={(e) => setMessageData({ ...messageData, type: e.target.value })}
                                    >
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
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
                                        rows="5"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                        value={messageData.content}
                                        onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                                        placeholder="Type your message here..."
                                        required
                                    ></textarea>
                                </div>

                                <div className="modal-buttons">
                                    <button type="button" className="btn btn-outline" onClick={() => setShowMessagingModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">
                                        {messageData.type === 'email' ? '🚀 Send Emails' : '🔗 Generate WhatsApp Links'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="whatsapp-links">
                                <p>WhatsApp links generated. Click each to open in a new tab:</p>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    {whatsappRecipients.map(r => (
                                        <div key={r.phone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span>{r.name} ({r.phone})</span>
                                            <a
                                                href={`https://wa.me/${r.phone}?text=${encodeURIComponent(messageData.content)}`}
                                                target="_blank"
                                                className="btn btn-sm btn-info"
                                            >
                                                Open Chat
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <div className="modal-buttons">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setShowMessagingModal(false);
                                            setWhatsappRecipients([]);
                                        }}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
