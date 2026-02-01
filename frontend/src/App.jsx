import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import OfferBanner from './components/OfferBanner';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import StudentPortal from './pages/StudentPortal';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdateProfile from './pages/UpdateProfile';
import AssessmentPortal from './pages/AssessmentPortal';
import AssessmentTake from './pages/AssessmentTake';
import './App.css';

function App() {
    console.log("CSC App: Component is mounting...");
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <div className="App">
                            {/* Hidden debug marker */}
                            <div id="app-mount-check" style={{ display: 'none' }}>App Rendered Successfully</div>
                            <Navbar />
                            <OfferBanner />
                            <main className="main-content">
                                <PageTransition>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/courses" element={<Courses />} />
                                        <Route path="/courses/:id" element={<CourseDetail />} />
                                        <Route path="/about" element={<About />} />
                                        <Route path="/contact" element={<Contact />} />
                                        <Route path="/gallery" element={<Gallery />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/forgot-password" element={<ForgotPassword />} />
                                        {/* Dashboard (replaces student-portal) */}
                                        <Route
                                            path="/dashboard"
                                            element={
                                                <ProtectedRoute>
                                                    <Dashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        {/* Keep old route for backwards compatibility */}
                                        <Route
                                            path="/student-portal"
                                            element={
                                                <ProtectedRoute>
                                                    <Dashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin-dashboard"
                                            element={
                                                <ProtectedRoute>
                                                    <AdminDashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/update-profile"
                                            element={
                                                <ProtectedRoute>
                                                    <UpdateProfile />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/assessments"
                                            element={
                                                <ProtectedRoute>
                                                    <AssessmentPortal />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/assessments/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <AssessmentTake />
                                                </ProtectedRoute>
                                            }
                                        />
                                    </Routes>
                                </PageTransition>
                            </main>
                            <Footer />
                        </div>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
