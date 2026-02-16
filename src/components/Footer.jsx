import { useState, useEffect } from 'react';
import './Footer.css';

const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} E-Shop. All rights reserved.</p>
                </div>
            </footer>
            {showBackToTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </>
    );
};

export default Footer;
