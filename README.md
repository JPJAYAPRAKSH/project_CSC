# Institute Management System

A comprehensive web application for institute management with student registration, performance tracking, daily code assessments, project submissions, and certificate management.

## 🚀 Technology Stack

### Backend
- **Django 5.1.5** - Python web framework
- **Django REST Framework 3.15.2** - RESTful API
- **Simple JWT 5.4.0** - JWT authentication
- **Django CORS Headers 4.6.0** - CORS support
- **Django Allauth 65.4.0** - Social authentication (Google, GitHub)

### Frontend
- **React 18.3+** - UI library
- **Vite 6.0+** - Build tool and dev server
- **React Router DOM 7.1+** - Client-side routing
- **Axios 1.7+** - HTTP client
- **Monaco Editor** - Code editor for assessments

## 📁 Project Structure

```
project_CSC/
├── backend/
│   ├── venv/                    # Python virtual environment
│   ├── institute_system/        # Django project
│   ├── core/                    # Main Django app
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/          # React components (to be created)
    │   ├── services/            # API services (to be created)
    │   ├── context/             # React context (to be created)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.14+ installed
- Node.js 24+ installed
- PowerShell execution policy configured (if on Windows)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies (already done):**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   **Note:** If you encounter PowerShell execution policy errors, run:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

## 🎯 Key Features

### Authentication
- ✅ Email/Password login
- ✅ Mobile number + OTP authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ JWT token-based API authentication

### Student Features
- 📊 Dashboard with course overview
- 👤 Profile management
- 💻 Online code editor for assessments (Monaco Editor)
- 📝 Daily assessment submissions
- 📁 Project file uploads
- 🎓 Certificate downloads

### Admin Features
- 📚 Course management (CRUD)
- 📋 Create code/theory assessments
- 👥 Student performance tracking
- ✅ Grade assignments
- 🔍 View code submissions with syntax highlighting
- 📜 Certificate management
- 🖼️ Gallery management

### Code Assessment System
- Multi-language support (Python, Java, C++, JavaScript, C)
- Real-time code execution in isolated Docker containers
- Test case validation
- Auto-save functionality
- Submission history

## 📝 Next Steps

1. **Configure Django Settings:**
   - Update `ALLOWED_HOSTS`
   - Configure database (currently SQLite)
   - Set up CORS origins
   - Configure JWT settings
   - Add social auth credentials

2. **Create Database Models:**
   - User (custom user model)
   - Student
   - Course
   - Enrollment
   - Assessment
   - CodeSubmission
   - Performance
   - Project
   - Certificate
   - GalleryImage

3. **Build API Endpoints:**
   - Authentication APIs
   - Student APIs
   - Course APIs
   - Assessment APIs
   - Code execution API
   - Admin APIs

4. **Develop React Components:**
   - Authentication components
   - Student dashboard
   - Code editor component
   - Admin panel
   - Public pages

## 🔧 Development

- **Backend API:** `http://localhost:8000/api/`
- **Frontend:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:8000/admin/`

The Vite dev server is configured to proxy `/api` requests to the Django backend.

## 📚 Documentation

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## 🤝 Contributing

This is an institute management system project. Follow the implementation plan for feature development.

## 📄 License

Private project for institute use.
