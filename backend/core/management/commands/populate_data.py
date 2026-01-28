from django.core.management.base import BaseCommand
from core.models import InstituteProfile, CourseCategory, Course


class Command(BaseCommand):
    help = 'Populate database with CSC Computer Software College data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database...')
        
        # Create Institute Profile
        self.create_institute_profile()
        
        # Create Course Categories
        categories = self.create_categories()
        
        # Create Courses
        self.create_courses(categories)
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
    
    def create_institute_profile(self):
        """Create or update institute profile"""
        profile, created = InstituteProfile.objects.get_or_create(
            id=1,
            defaults={
                'name': 'CSC Computer Software College',
                'certification': 'An ISO 9001:2015 Certified Institution',
                'founding_year': 1986,
                'students_per_year': 100000,
                'total_alumni': 5000000,
                'total_centers': 360,
                'tagline': 'Quality Education, Affordable Cost',
                'about': '''CSC Computer Software College - Celebrating 38 years of excellence in computer education since 1986.
                
                Journey Milestones:
                • 1986: Journey Begins
                • 1992: 25 Centers
                • 2006: 200 Centers
                • 2020: 360 Centers
                
                Key Achievements:
                • Over 50 Lakh students trained
                • 1 Lakh students trained every year
                • 360+ Centers across India
                • 13 Centers in Sri Lanka
                • ISO 9001:2015 Certified Institution
                ''',
                'partners': [
                    'Tally India Pvt Ltd',
                    'IBT Institute (Bank/SSC)',
                    'Speak Easy (English Training)'
                ],
                'email': 'info@csccomputers.com',
                'phone': '+91-XXXXXXXXXX',
                'address': 'Main Branch Address Here'
            }
        )
        action = 'Created' if created else 'Updated'
        self.stdout.write(f'{action} Institute Profile')
    
    def create_categories(self):
        """Create course categories"""
        categories_data = [
            {'name': 'Diploma Courses', 'slug': 'diploma', 'duration_info': '6 Months', 'display_order': 1},
            {'name': 'Advanced Diploma', 'slug': 'advanced-diploma', 'duration_info': '4 Months', 'display_order': 2},
            {'name': 'Honours Diploma', 'slug': 'honours-diploma', 'duration_info': '1 Year', 'display_order': 3},
            {'name': 'Short-Term Courses', 'slug': 'short-term', 'duration_info': '2-3 Months', 'display_order': 4},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = CourseCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            action = 'Created' if created else 'Found'
            self.stdout.write(f'{action} category: {category.name}')
        
        return categories
    
    def create_courses(self, categories):
        """Create all courses"""
        
        # Diploma Courses (6 Months)
        diploma_courses = [
            {
                'name': 'Diploma in Computer Application - Tally',
                'code': 'DCA-TALLY',
                'category': categories['diploma'],
                'duration': '6 Months',
                'duration_months': 6,
                'fees': 23400.00,
                'objective': 'Thorough knowledge in Microsoft Office suite and TallyPrime',
                'target_audience': 'School Final / Diploma / B.Com / M.Com / MBA students',
                'description': 'Comprehensive course covering MS Office and TallyPrime with advanced accounting and taxation',
                'is_featured': True,
                'syllabus': {
                    'modules': [
                        {
                            'title': 'Computer Fundamentals',
                            'topics': ['OS/GUI', 'Wordpad', 'Notepad', 'Paintbrush', 'Explorer', 'Control Panel']
                        },
                        {
                            'title': 'MS Office',
                            'topics': [
                                'Word (Mail Merge, Macro)',
                                'Excel (Pivot table, Goal seek, Macros)',
                                'PowerPoint (OLE, Special Effects)'
                            ]
                        },
                        {
                            'title': 'Internet',
                            'topics': ['E-mail', 'Chatting', 'Downloading']
                        },
                        {
                            'title': 'TallyPrime',
                            'topics': [
                                'Principles of Accounting',
                                'Masters, Vouchers, Reports',
                                'Balance Sheet, P&L, Ratio Analysis, Cash Flow'
                            ]
                        },
                        {
                            'title': 'Advanced Accounting',
                            'topics': [
                                'Cost Centres',
                                'Bank Reconciliation',
                                'Job Costing',
                                'Interest Calculation'
                            ]
                        },
                        {
                            'title': 'Advanced Inventory',
                            'topics': [
                                'Order Processing',
                                'Reorder Levels',
                                'Batch wise Details',
                                'Bill of Materials',
                                'Price List'
                            ]
                        },
                        {
                            'title': 'Taxation & Payroll',
                            'topics': [
                                'GST (Computation & Forms)',
                                'TDS & TCS',
                                'Payroll (Pay slip, PF)'
                            ]
                        },
                        {
                            'title': 'Add-on Features',
                            'topics': ['WhatsApp Connect', 'Import from Excel', 'Dashboard', 'ChatGPT']
                        }
                    ]
                }
            },
            {
                'name': 'Diploma in Computer Application - Programming',
                'code': 'DCA-PROG',
                'category': categories['diploma'],
                'duration': '6 Months',
                'duration_months': 6,
                'fees': 23400.00,
                'objective': 'Create applications using object-oriented concepts and MS Office proficiency',
                'target_audience': 'School Final / Diploma / B.Sc. / M.Sc. / BCA / MCA / Engineering Students',
                'description': 'Programming-focused diploma covering C, C++, Python with MS Office',
                'is_featured': True,
                'syllabus': {
                    'modules': [
                        {
                            'title': 'Fundamentals & Office',
                            'topics': ['Windows', 'MS Word', 'Excel', 'PowerPoint', 'Internet']
                        },
                        {
                            'title': 'Elective-I ("C" Language)',
                            'topics': ['Data Types', 'Loops', 'Pointers', 'Linked Lists', 'Data Structures']
                        },
                        {
                            'title': 'OOPS Using C++',
                            'topics': ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Templates']
                        },
                        {
                            'title': 'Elective-II (Python)',
                            'topics': [
                                'Syntax', 'Strings', 'Lists', 'Tuples',
                                'Dictionaries', 'Functions', 'OOPS Concept'
                            ]
                        },
                        {
                            'title': 'Advanced Python',
                            'topics': ['MySQL Access', 'GUI (Tkinter)', 'Image Processing', 'Web Scraping']
                        }
                    ]
                }
            }
        ]
        
        # Advanced Diploma Courses (4 Months)
        advanced_courses = [
            {
                'name': 'Advanced Diploma in AI & Data Science',
                'code': 'ADAI',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 39600.00,
                'objective': 'Comprehensive understanding of AI and Data Science concepts, tools, and techniques',
                'target_audience': 'Students and professionals interested in AI/ML and Data Science',
                'description': 'Complete AI and Data Science program with Python, ML, and Deep Learning',
                'is_featured': True,
                'syllabus': {
                    'modules': [
                        {'title': 'Python', 'topics': ['Syntax', 'OOP', 'Exception handling']},
                        {'title': 'Data Management', 'topics': ['MySQL (Queries, Joins)', 'MongoDB (NoSQL, CRUD, Unstructured Data)']},
                        {'title': 'Data Wrangling', 'topics': ['NumPy (Arrays, Linear Algebra)', 'Pandas (DataFrames, Cleaning)']},
                        {'title': 'Data Visualization', 'topics': ['Matplotlib (Plots, Histograms, 3D plotting)']},
                        {'title': 'Machine Learning', 'topics': ['Scikit-Learn (Supervised/Unsupervised algorithms, Pipelines)']},
                        {'title': 'Deep Learning', 'topics': ['TensorFlow & Keras (Neural Networks, CNN, RNN, NLP)']},
                        {'title': 'Code Management', 'topics': ['GIT']}
                    ]
                }
            },
            {
                'name': 'Advanced Diploma in Data Analytics',
                'code': 'ADDA',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 37800.00,
                'objective': 'Analyze and visualize data for effective decision-making',
                'target_audience': 'Aspiring data analysts and business intelligence professionals',
                'description': 'Data analytics course with Excel, Power BI, Python, and databases',
                'is_featured': True,
                'syllabus': {
                    'modules': [
                        {'title': 'Excel', 'topics': ['Pivot tables', 'VLOOKUP', 'Macros', 'VBA', 'Automation Project']},
                        {'title': 'Data Management', 'topics': ['MySQL', 'MongoDB']},
                        {'title': 'Data Visualization', 'topics': ['Matplotlib', 'Power BI (Dashboards, Advanced Analytics)']},
                        {'title': 'Python', 'topics': ['Syntax', 'OOP', 'List comprehensions']},
                        {'title': 'Data Wrangling', 'topics': ['NumPy', 'Pandas']}
                    ]
                }
            },
            {
                'name': 'Diploma in PHP Full Stack Developer',
                'code': 'DPFD',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 29700.00,
                'objective': 'Develop efficient and user-friendly applications',
                'target_audience': 'Aspiring web developers',
                'description': 'Full stack web development with PHP, Laravel, React, and databases',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Front-End', 'topics': ['HTML5', 'CSS3', 'Bootstrap', 'Advanced JavaScript (DOM, Promises)', 'React JS (Hooks, API calls)']},
                        {'title': 'Database', 'topics': ['MySQL (Relational Model, Joins)', 'MongoDB']},
                        {'title': 'Scripting & Framework', 'topics': ['PHP (Syntax, Sessions)', 'Laravel (Routing, MVC, Eloquent ORM)']}
                    ]
                }
            },
            {
                'name': 'Advanced Diploma in MERN/MEAN Stack',
                'code': 'ADMS',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 29700.00,
                'objective': 'Master UI Layer (React/Angular), API Layer (Express/Node), and DB Layer',
                'target_audience': 'Web developers and full stack enthusiasts',
                'description': 'Modern JavaScript stack development with React/Angular, Node.js, and MongoDB',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Front-End', 'topics': ['HTML5', 'CSS3', 'Bootstrap', 'Advanced JavaScript']},
                        {'title': 'Electives', 'topics': ['React JS (Hooks, Components)', 'Angular JS (Directives, Routing)']},
                        {'title': 'Database', 'topics': ['MySQL', 'MongoDB']},
                        {'title': 'Web Framework', 'topics': ['Node JS', 'Express JS (RESTful API, Middleware)']}
                    ]
                }
            },
            {
                'name': 'Diploma in Full Stack Java Developer',
                'code': 'DFJD',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 32400.00,
                'objective': 'Master front-end and back-end Java technologies',
                'target_audience': 'Java developers and enterprise application developers',
                'description': 'Enterprise Java development with Spring Boot, React, and databases',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Front-End', 'topics': ['HTML5', 'CSS3', 'Bootstrap', 'Advanced JavaScript', 'React JS']},
                        {'title': 'Language', 'topics': ['Core JAVA (Polymorphism, Abstraction, Packages, File Streams)']},
                        {'title': 'Database', 'topics': ['MySQL', 'MongoDB']},
                        {'title': 'Web Framework', 'topics': ['Spring Boot (JPA, Hibernate, REST API)']}
                    ]
                }
            },
            {
                'name': 'Diploma in Full Stack Python Developer',
                'code': 'DFPD',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 29700.00,
                'objective': 'Full stack web development with Python and Django',
                'target_audience': 'Python developers and web application developers',
                'description': 'Python full stack development with Django, React, and databases',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Front-End', 'topics': ['HTML5', 'CSS3', 'Bootstrap', 'Advanced JavaScript', 'React JS']},
                        {'title': 'Database', 'topics': ['MySQL', 'MongoDB']},
                        {'title': 'Web Framework', 'topics': ['Django (MVT Pattern, Forms, ORM, REST API)']}
                    ]
                }
            },
            {
                'name': 'Diploma in .Net',
                'code': 'DOTNET',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 27000.00,
                'objective': 'Master Microsoft .NET framework and technologies',
                'target_audience': 'Windows application developers',
                'description': '.NET development with C#, VB.NET, ASP.NET, and ADO.NET',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Programming in C#', 'topics': ['OOPS', '.NET Framework', 'Collections']},
                        {'title': 'VB.NET', 'topics': ['Windows Forms', 'Crystal Reports', 'ADO.NET']},
                        {'title': 'ASP.NET', 'topics': ['Web Server Controls', 'Master Pages', 'AJAX']},
                        {'title': 'ADO.NET', 'topics': ['Data Centric Applications', 'XML']}
                    ]
                }
            },
            {
                'name': 'Master Diploma in System Administration',
                'code': 'MDSA',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 31400.00,
                'objective': 'Master Hardware & System Administration; certification prep for A+, N+',
                'target_audience': 'IT support professionals and system administrators',
                'description': 'Complete system administration with hardware, networking, and Windows Server',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Hardware (A+)', 'topics': ['Processors', 'Motherboards', 'BIOS', 'Troubleshooting', 'OS Installation']},
                        {'title': 'Networking (N+)', 'topics': ['Topology', 'OSI Model', 'TCP/IP', 'Remote Tools', 'DHCP']},
                        {'title': 'Windows Server', 'topics': ['Active Directory', 'IPV4', 'DNS', 'Group Policy', 'Hyper-V']}
                    ]
                }
            },
            {
                'name': 'Advanced Diploma in Python Programming',
                'code': 'ADPP',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 23400.00,
                'objective': 'Master Python programming from basics to advanced',
                'target_audience': 'Programming enthusiasts and Python developers',
                'description': 'Comprehensive Python programming with C, C++, and advanced Python topics',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'C Language', 'topics': ['Fundamentals', 'Data Structures']},
                        {'title': 'OOPS Using C++', 'topics': ['Classes', 'Inheritance', 'Polymorphism']},
                        {'title': 'Python', 'topics': ['Basic to Advanced', 'MySQL Access', 'GUI (Tkinter)', 'Image Processing']}
                    ]
                }
            },
            {
                'name': 'Advanced Diploma in Java Programming',
                'code': 'ADJP',
                'category': categories['advanced-diploma'],
                'duration': '4 Months',
                'duration_months': 4,
                'fees': 23400.00,
                'objective': 'Master Java programming and application development',
                'target_audience': 'Java programming enthusiasts',
                'description': 'Complete Java programming with C, C++, and advanced Java topics',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'C Language', 'topics': ['Fundamentals']},
                        {'title': 'OOPS Using C++', 'topics': ['Classes', 'Objects']},
                        {'title': 'Web Technologies', 'topics': ['HTML', 'CSS3']},
                        {'title': 'JAVA', 'topics': ['Core', 'Networking', 'Socket Programming', 'Swing']}
                    ]
                }
            }
        ]
        
        # Honours Diploma Courses (1 Year)
        honours_courses = [
            {
                'name': 'Honours Diploma in Full Stack Developer',
                'code': 'HDFD',
                'category': categories['honours-diploma'],
                'duration': '1 Year',
                'duration_months': 12,
                'fees': 59400.00,
                'objective': 'Comprehensive full stack development with multiple technologies',
                'target_audience': 'Serious full stack development aspirants',
                'description': 'Complete 1-year program covering programming, web development, databases, and frameworks',
                'is_featured': True,
                'syllabus': {
                    'modules': [
                        {'title': 'Programming', 'topics': ['C Language', 'OOPS Using C++', 'JAVA (Core, Multi-threading, JDBC)', 'PYTHON (Tkinter, OpenCV)']},
                        {'title': 'Front-End', 'topics': ['HTML5', 'CSS3', 'Bootstrap', 'Advanced JavaScript', 'React JS']},
                        {'title': 'Database', 'topics': ['MySQL', 'MongoDB']},
                        {'title': 'Web Framework (Electives)', 'topics': ['Django (Elective I)', 'Spring Boot (Elective II)']},
                        {'title': 'Project', 'topics': ['E-Commerce Website', 'Food Delivery App', 'etc.']}
                    ]
                }
            },
            {
                'name': 'Honours Diploma in Computer Application - Tally',
                'code': 'HDCA-TALLY',
                'category': categories['honours-diploma'],
                'duration': '1 Year',
                'duration_months': 12,
                'fees': 45000.00,
                'objective': 'Complete computer application skills with Tally, Excel, and Digital Marketing',
                'target_audience': 'Commerce and business students',
                'description': '1-year comprehensive program for office applications, accounting, and digital marketing',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'End-User Application', 'topics': ['Windows', 'MS Office (Word, Excel, PowerPoint)', 'Internet']},
                        {'title': 'Front-End & Database', 'topics': ['HTML5', 'CSS3', 'MySQL']},
                        {'title': 'Financial Accounting (TallyPrime)', 'topics': ['Masters', 'Vouchers', 'Reports', 'Advanced Inventory', 'GST', 'TDS & TCS', 'Payroll']},
                        {'title': 'Advanced Excel & VBA', 'topics': ['Formulas', 'Pivot Tables', 'VBA Programming', 'Macros']},
                        {'title': 'Digital Marketing', 'topics': ['SEO', 'Google Ads', 'Social Media Marketing']}
                    ]
                }
            },
            {
                'name': 'Honours Diploma in Computer Application - Programming',
                'code': 'HDCA-PROG',
                'category': categories['honours-diploma'],
                'duration': '1 Year',
                'duration_months': 12,
                'fees': 45000.00,
                'objective': 'Complete computer application with programming and digital marketing',
                'target_audience': 'Students interested in programming and web development',
                'description': '1-year program covering office applications, programming, and digital marketing',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'End-User Application', 'topics': ['Windows', 'MS Office', 'Internet']},
                        {'title': 'Front-End & Database', 'topics': ['HTML5', 'CSS3', 'MySQL']},
                        {'title': 'Programming Tools', 'topics': ['C Language', 'OOPS Using C++', 'Python (Advanced Python, GUI, Image Processing)']},
                        {'title': 'Digital Marketing', 'topics': ['SEO', 'Google Ads', 'Social Media']}
                    ]
                }
            }
        ]
        
        # Short-Term Courses
        short_term_courses = [
            {
                'name': 'Certified Computer Accountant',
                'code': 'CCA',
                'category': categories['short-term'],
                'duration': '3 Months',
                'duration_months': 3,
                'fees': 20700.00,
                'objective': 'Master TallyPrime for accounting and taxation',
                'target_audience': 'Accountants and finance professionals',
                'description': 'Focused TallyPrime course with GST, TDS, and Payroll',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'TallyPrime', 'topics': ['Complete Accounting', 'GST', 'TDS', 'Payroll', 'POS']}
                    ]
                }
            },
            {
                'name': 'Diploma in MS-Office',
                'code': 'DMO',
                'category': categories['short-term'],
                'duration': '2 Months',
                'duration_months': 2,
                'fees': 11700.00,
                'objective': 'Master Microsoft Office applications',
                'target_audience': 'Office workers and students',
                'description': 'Essential MS Office skills for productivity',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'MS Office', 'topics': ['Windows', 'MS-Office', 'Internet']}
                    ]
                }
            },
            {
                'name': 'Certificate Course in Advanced Excel',
                'code': 'CCAE',
                'category': categories['short-term'],
                'duration': '2 Months',
                'duration_months': 2,
                'fees': 18000.00,
                'objective': 'Master advanced Excel features and VBA',
                'target_audience': 'Data analysts and Excel power users',
                'description': 'Advanced Excel with formulas, macros, and VBA programming',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Advanced Excel', 'topics': ['Advanced features', 'VBA Programming']}
                    ]
                }
            },
            {
                'name': 'Advanced Diploma in Computer Hardware & Networking',
                'code': 'ADCHN',
                'category': categories['short-term'],
                'duration': '2 Months',
                'duration_months': 2,
                'fees': 24500.00,
                'objective': 'Deploy and manage Windows server',
                'target_audience': 'IT support and network professionals',
                'description': 'Hardware and networking fundamentals with Windows Server',
                'is_featured': False,
                'syllabus': {
                    'modules': [
                        {'title': 'Hardware & Networking', 'topics': ['Deploying and managing Windows server']}
                    ]
                }
            }
        ]
        
        # Combine all courses
        all_courses = diploma_courses + advanced_courses + honours_courses + short_term_courses
        
        # Create courses
        for course_data in all_courses:
            course, created = Course.objects.update_or_create(
                code=course_data['code'],
                defaults=course_data
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} course: {course.code} - {course.name}')
