import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCourses, getCategories } from '../services/api';
import CourseCard from '../components/CourseCard';
import './Courses.css';

function Courses() {
    console.log("Courses: Component rendering start");
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

    useEffect(() => {
        console.log("Courses: Component mounted, fetching data...");
        fetchCategories();
    }, []);

    useEffect(() => {
        console.log("Courses: Category changed, fetching courses...", selectedCategory);
        fetchCourses();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            console.log("Courses: Fetching categories...");
            const response = await getCategories();
            console.log("Courses: Categories response received", response.data);
            const data = response.data?.results || response.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Courses: Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        try {
            console.log("Courses: Fetching courses with category:", selectedCategory);
            const params = {};
            if (selectedCategory && selectedCategory !== 'all') {
                params.category__slug = selectedCategory;
            }
            const response = await getCourses(params);
            console.log("Courses: Courses response received", response.data);
            const data = response.data?.results || response.data || [];
            setCourses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Courses: Error fetching courses:', error);
            setCourses([]);
        } finally {
            console.log("Courses: Fetching finished, setting loading to false");
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        console.log("Courses: Changing category to:", category);
        setSelectedCategory(category);
        if (category === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category });
        }
    };

    const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
        if (!course) return false;
        const name = course.name || '';
        const code = course.code || '';
        const objective = course.objective || '';

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            objective.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    console.log("Courses: Render stats", {
        loading,
        totalCourses: courses.length,
        filteredCount: filteredCourses.length,
        categoryCount: categories.length
    });

    return (
        <div className="courses-page">
            <div className="courses-header">
                <div className="container">
                    <h1>Our Courses</h1>
                    <p>Choose from our wide range of professional courses</p>
                </div>
            </div>

            <div className="container section">
                {/* Search Bar */}
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search courses by name, code, or keyword..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Category Filters */}
                <div className="category-filters">
                    <button
                        className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => handleCategoryChange('all')}
                    >
                        All Courses
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.slug}
                            className={`filter-btn ${selectedCategory === category.slug ? 'active' : ''}`}
                            onClick={() => handleCategoryChange(category.slug)}
                        >
                            {category.name}
                            <span className="course-count">{category.course_count}</span>
                        </button>
                    ))}
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="courses-count">
                            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                        </div>
                        <div className="grid grid-3">
                            {filteredCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                        {filteredCourses.length === 0 && (
                            <div className="no-courses">
                                <p>No courses found matching your criteria.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Courses;
