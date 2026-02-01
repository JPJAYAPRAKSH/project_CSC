import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    getAssessmentById,
    startAssessment,
    submitAssessment,
    saveAssessmentProgress,
    executeCode
} from '../services/api';
import Editor from '@monaco-editor/react';
import './AssessmentTake.css';

const SUPPORTED_LANGUAGES = [
    { id: 'python', name: 'Python', defaultCode: 'def main():\n    # Write your code here\n    print("Hello World")\n\nif __name__ == "__main__":\n    main()' },
    { id: 'java', name: 'Java', defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello World");\n    }\n}' },
    { id: 'c', name: 'C', defaultCode: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    printf("Hello World\\n");\n    return 0;\n}' },
    { id: 'cpp', name: 'C++', defaultCode: '#include <iostream>\n\nint main() {\n    // Write your code here\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}' },
    { id: 'csharp', name: 'C#', defaultCode: 'using System;\n\nclass Program {\n    static void main() {\n        // Write your code here\n        Console.WriteLine("Hello World");\n    }\n}' }
];

function AssessmentTake() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [assessment, setAssessment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [codeSubmissions, setCodeSubmissions] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [result, setResult] = useState(null);

    // Auto-save and Execution state
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [execResult, setExecResult] = useState({}); // {questionId: {stdout, stderr, passed, results}}
    const [isExecuting, setIsExecuting] = useState(false);

    const autoSaveTimerRef = useRef(null);
    const hasUnsavedChanges = useRef(false);

    useEffect(() => {
        if (user && id) {
            initializeAssessment();
        }
    }, [user, id]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft <= 0 || result) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, result]);

    // Auto-save side effect
    useEffect(() => {
        if (submission && !result) {
            autoSaveTimerRef.current = setInterval(() => {
                if (hasUnsavedChanges.current) {
                    handleAutoSave();
                }
            }, 30000); // Auto-save every 30s
        }

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [submission, result, answers, codeSubmissions]);

    const initializeAssessment = async () => {
        try {
            const assessmentRes = await getAssessmentById(id);
            setAssessment(assessmentRes.data);
            setTimeLeft(assessmentRes.data.duration_minutes * 60);

            // Start or resume submission
            const submissionRes = await startAssessment({
                student_id: user.id,
                assessment_id: id
            });
            setSubmission(submissionRes.data);

            // Load existing answers if resuming
            if (submissionRes.data.answers) {
                setAnswers(submissionRes.data.answers);
            }
            if (submissionRes.data.code_submissions) {
                // Ensure each code submission has a language, default to python if missing
                const loadedCode = { ...submissionRes.data.code_submissions };
                Object.keys(loadedCode).forEach(qId => {
                    if (!loadedCode[qId].language) {
                        loadedCode[qId].language = 'python';
                    }
                });
                setCodeSubmissions(loadedCode);
            }

            // If already graded, show result
            if (submissionRes.data.status === 'graded') {
                setResult(submissionRes.data);
            }
        } catch (error) {
            console.error('Error initializing assessment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoSave = useCallback(async () => {
        if (isSaving || !submission || result) return;

        setIsSaving(true);
        try {
            const res = await saveAssessmentProgress(submission.id, {
                answers,
                code_submissions: codeSubmissions
            });
            setLastSaved(new Date(res.data.last_saved));
            hasUnsavedChanges.current = false;
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, submission, result, answers, codeSubmissions]);

    const handleRunCode = async (questionId) => {
        if (isExecuting) return;

        setIsExecuting(true);
        const codeData = codeSubmissions[questionId] || { code: '', language: 'python' };

        try {
            const res = await executeCode(submission.id, {
                question_id: questionId,
                code: codeData.code,
                language: codeData.language
            });

            setExecResult(prev => ({
                ...prev,
                [questionId]: res.data
            }));

            // Trigger an auto-save when running code
            handleAutoSave();
        } catch (error) {
            console.error('Code execution failed:', error);
            setExecResult(prev => ({
                ...prev,
                [questionId]: { stderr: 'Server Error: Failed to execute code.' }
            }));
        } finally {
            setIsExecuting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
        hasUnsavedChanges.current = true;
    };

    const handleCodeChange = (questionId, code, language = null) => {
        setCodeSubmissions(prev => {
            const current = prev[questionId] || { code: '', language: 'python', output: '' };
            return {
                ...prev,
                [questionId]: {
                    ...current,
                    code,
                    language: language || current.language
                }
            };
        });
        hasUnsavedChanges.current = true;
    };

    const handleLanguageChange = (questionId, language) => {
        setCodeSubmissions(prev => {
            const current = prev[questionId] || { code: '', language: 'python', output: '' };
            // If code is empty or matches previous language default, update to new language default
            const newLanguageConfig = SUPPORTED_LANGUAGES.find(l => l.id === language);
            const prevLanguageConfig = SUPPORTED_LANGUAGES.find(l => l.id === current.language);

            let newCode = current.code;
            if (!newCode || (prevLanguageConfig && newCode === prevLanguageConfig.defaultCode)) {
                newCode = newLanguageConfig ? newLanguageConfig.defaultCode : '';
            }

            return {
                ...prev,
                [questionId]: {
                    ...current,
                    language,
                    code: newCode
                }
            };
        });
        hasUnsavedChanges.current = true;
    };

    const handleAutoSubmit = useCallback(async () => {
        if (isSubmitting || result) return;
        await handleSubmit();
    }, [isSubmitting, result, answers, codeSubmissions]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setShowConfirm(false);

        try {
            const response = await submitAssessment(submission.id, {
                answers,
                code_submissions: codeSubmissions
            });
            setResult(response.data);
        } catch (error) {
            console.error('Error submitting assessment:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAnsweredCount = () => {
        return Object.keys(answers).length;
    };

    if (loading) {
        return (
            <div className="assessment-loading">
                <div className="spinner"></div>
                <p>Loading assessment...</p>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="assessment-error">
                <h2>Assessment not found</h2>
                <button onClick={() => navigate('/assessments')} className="btn btn-primary">
                    Back to Portal
                </button>
            </div>
        );
    }

    // Show result screen
    if (result) {
        const isPassed = result.percentage >= assessment.passing_marks;
        return (
            <div className="result-screen">
                <div className="result-card">
                    <div className={`result - icon ${isPassed ? 'pass' : 'fail'} `}>
                        {isPassed ? '🎉' : '📚'}
                    </div>
                    <h1>{isPassed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
                    <p className="result-message">
                        {isPassed
                            ? 'You have successfully passed the assessment!'
                            : `You need ${assessment.passing_marks}% to pass.Keep learning!`}
                    </p>
                    <div className="score-card">
                        <div className="score-item">
                            <span className="score-label">Score</span>
                            <span className="score-value">{result.score} / {assessment.total_marks}</span>
                        </div>
                        <div className="score-item">
                            <span className="score-label">Percentage</span>
                            <span className={`score - value ${isPassed ? 'pass' : 'fail'} `}>
                                {result.percentage?.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <div className="result-actions">
                        <button onClick={() => navigate('/assessments')} className="btn btn-primary">
                            Back to Portal
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const questions = assessment.questions || [];
    const currentQ = questions[currentQuestion];

    return (
        <div className="assessment-take">
            {/* Header with timer and saving status */}
            <header className="take-header">
                <div className="header-left">
                    <div className="title-row">
                        <h2>{assessment.title}</h2>
                        {isSaving ? (
                            <span className="save-status saving">Saving...</span>
                        ) : lastSaved ? (
                            <span className="save-status saved">Saved at {lastSaved.toLocaleTimeString()}</span>
                        ) : null}
                    </div>
                    <span className="course-badge">{assessment.course_name}</span>
                </div>
                <div className="header-right">
                    <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                    <button
                        className="btn btn-primary submit-btn"
                        onClick={() => setShowConfirm(true)}
                        disabled={isSubmitting}
                    >
                        Submit Test
                    </button>
                </div>
            </header>

            <div className="take-content">
                {/* Question Navigation Sidebar */}
                <aside className="question-nav">
                    <h3>Questions</h3>
                    <div className="question-grid">
                        {questions.map((q, index) => (
                            <button
                                key={q.id}
                                className={`q - btn ${currentQuestion === index ? 'current' : ''} ${answers[q.id] !== undefined ? 'answered' : ''} `}
                                onClick={() => setCurrentQuestion(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="nav-stats">
                        <p>Answered: {getAnsweredCount()} / {questions.length}</p>
                    </div>
                </aside>

                {/* Question Display */}
                <main className="question-area">
                    {currentQ ? (
                        <div className="question-card">
                            <div className="question-header">
                                <span className="q-number">Question {currentQuestion + 1}</span>
                                <span className="q-marks">{currentQ.marks} marks</span>
                            </div>
                            <div className="question-text">
                                {currentQ.question_text}
                            </div>

                            {/* MCQ Options */}
                            {(currentQ.question_type === 'mcq' || currentQ.question_type === 'true_false') && currentQ.options && (
                                <div className="options-list">
                                    {currentQ.options.map((option, idx) => (
                                        <label key={idx} className={`option ${answers[currentQ.id] === idx.toString() ? 'selected' : ''} `}>
                                            <input
                                                type="radio"
                                                name={`question - ${currentQ.id} `}
                                                value={idx}
                                                checked={answers[currentQ.id] === idx.toString()}
                                                onChange={() => handleAnswerChange(currentQ.id.toString(), idx.toString())}
                                            />
                                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                            <span className="option-text">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Coding Question */}
                            {currentQ.question_type === 'coding' && (
                                <div className="code-editor-section">
                                    <div className="editor-controls">
                                        <div className="controls-left">
                                            <div className="language-selector">
                                                <label htmlFor="lang-select">Language:</label>
                                                <select
                                                    id="lang-select"
                                                    value={codeSubmissions[currentQ.id]?.language || 'python'}
                                                    onChange={(e) => handleLanguageChange(currentQ.id.toString(), e.target.value)}
                                                >
                                                    {SUPPORTED_LANGUAGES.map(lang => (
                                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="controls-right">
                                            <button
                                                className="btn btn-run"
                                                onClick={() => handleRunCode(currentQ.id.toString())}
                                                disabled={isExecuting}
                                            >
                                                {isExecuting ? '⌛ Running...' : '▶ Run Code'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="editor-container">
                                        <Editor
                                            height="350px"
                                            language={codeSubmissions[currentQ.id]?.language || 'python'}
                                            value={codeSubmissions[currentQ.id]?.code || currentQ.code_template || (SUPPORTED_LANGUAGES.find(l => l.id === (codeSubmissions[currentQ.id]?.language || 'python'))?.defaultCode) || ''}
                                            theme="vs-dark"
                                            onChange={(value) => handleCodeChange(currentQ.id.toString(), value)}
                                            options={{
                                                fontSize: 14,
                                                minimap: { enabled: false },
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                padding: { top: 16 },
                                                suggestOnTriggerCharacters: true,
                                                quickSuggestions: true
                                            }}
                                        />
                                    </div>

                                    {/* Execution Results Console */}
                                    {execResult[currentQ.id] && (
                                        <div className="execution-console">
                                            <div className="console-header">
                                                <span>Execution Results</span>
                                                <button
                                                    className="console-close"
                                                    onClick={() => setExecResult(prev => {
                                                        const newState = { ...prev };
                                                        delete newState[currentQ.id];
                                                        return newState;
                                                    })}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="console-body">
                                                {execResult[currentQ.id].stderr ? (
                                                    <pre className="console-error">{execResult[currentQ.id].stderr}</pre>
                                                ) : (
                                                    <pre className="console-stdout">{execResult[currentQ.id].stdout}</pre>
                                                )}

                                                {execResult[currentQ.id].results && execResult[currentQ.id].results.length > 0 && (
                                                    <div className="test-cases-results">
                                                        <h4>Test Cases</h4>
                                                        <div className="test-case-grid">
                                                            {execResult[currentQ.id].results.map((res, idx) => (
                                                                <div key={idx} className={`test-case-item ${res.passed ? 'pass' : 'fail'}`}>
                                                                    <span className="case-status-icon">{res.passed ? '✓' : '✗'}</span>
                                                                    <span className="case-name">Test Case {res.test_case}</span>
                                                                    {res.input && <div className="case-detail">Input: <code>{res.input}</code></div>}
                                                                    <div className="case-detail">Expected: <code>{res.expected}</code></div>
                                                                    {!res.passed && <div className="case-detail">Actual: <code>{res.actual}</code></div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Short Answer */}
                            {currentQ.question_type === 'short_answer' && (
                                <textarea
                                    className="answer-textarea"
                                    placeholder="Type your answer here..."
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => handleAnswerChange(currentQ.id.toString(), e.target.value)}
                                    rows={5}
                                />
                            )}

                            {/* Navigation */}
                            <div className="question-nav-buttons">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                >
                                    ← Previous
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestion === questions.length - 1}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="no-questions">
                            <p>No questions available for this assessment.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="confirm-modal">
                        <h3>Submit Assessment?</h3>
                        <p>You have answered {getAnsweredCount()} of {questions.length} questions.</p>
                        <p>Are you sure you want to submit?</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssessmentTake;
