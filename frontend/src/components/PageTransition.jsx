import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PageTransition({ children }) {
    const location = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    return <div className="page-transition">{children}</div>;
}

export default PageTransition;
