import { useState, useEffect } from 'react';
import axios from 'axios';
import './OfferBanner.css';

const API_BASE_URL = 'http://localhost:8000/api'; // Adjust if needed

function OfferBanner() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/offers/current/`);
                setOffers(response.data);
            } catch (error) {
                console.error('Error fetching seasonal offers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    if (loading || offers.length === 0) {
        return null;
    }

    // Combine all active offer messages
    const combinedMessage = offers.map(offer => offer.message).join(' | ');

    return (
        <div className="offer-banner">
            <div className="marquee-container">
                <div className="marquee-text">
                    {combinedMessage} &nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp; {combinedMessage}
                </div>
            </div>
        </div>
    );
}

export default OfferBanner;
