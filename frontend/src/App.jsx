import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
    console.log("CSC App: Component is mounting...");
    return (
        <ErrorBoundary>
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
                                    <Route
                                        path="/student-portal"
                                        element={
                                            <ProtectedRoute>
                                                <StudentPortal />
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
        </ErrorBoundary>
    );
}

export default App;
