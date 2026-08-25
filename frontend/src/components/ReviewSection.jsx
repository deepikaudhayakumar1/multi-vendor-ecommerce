import React, {
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    Star,
    Camera,
    CheckCircle,
    Send
} from 'lucide-react';

import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

import './ReviewSection.css';

const ReviewSection = ({ productId }) => {

    const { user } = useContext(AuthContext);

    const [reviews, setReviews] = useState([]);

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [selectedRating, setSelectedRating] = useState(0);

    const [hoverRating, setHoverRating] = useState(0);

    const [title, setTitle] = useState('');

    const [reviewText, setReviewText] = useState('');

    const [images, setImages] = useState([]);

    const [imagePreviews, setImagePreviews] = useState([]);

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');

    const [ratingFilter, setRatingFilter] = useState(0);

    // =========================================================
    // LOAD REVIEWS
    // =========================================================

    const loadReviews = async () => {

        try {

            setLoading(true);

            const response =
                await API.get(
                    `/reviews/product/${productId}`
                );

            setReviews(response.data || []);

        } catch (err) {

            console.error(
                'Failed to load reviews:',
                err
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (productId) {
            loadReviews();
        }

    }, [productId]);

    // =========================================================
    // RATING SUMMARY
    // =========================================================

    const ratingSummary = useMemo(() => {

        const total = reviews.length;

        if (total === 0) {

            return {
                average: 0,
                counts: {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0
                }
            };
        }

        const counts = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        let totalRating = 0;

        reviews.forEach(review => {

            const rating =
                Number(review.rating);

            if (counts[rating] !== undefined) {
                counts[rating]++;
            }

            totalRating += rating;
        });

        return {
            average:
                totalRating / total,

            counts
        };

    }, [reviews]);

    // =========================================================
    // IMAGE SELECT
    // =========================================================

    const handleImageChange = (event) => {

        const selectedFiles =
            Array.from(event.target.files || []);

        if (selectedFiles.length > 5) {

            setError(
                'You can upload maximum 5 images'
            );

            return;
        }

        const validImages =
            selectedFiles.filter(file =>
                file.type.startsWith('image/')
            );

        if (
            validImages.length !==
            selectedFiles.length
        ) {

            setError(
                'Only image files are allowed'
            );

            return;
        }

        const largeImage =
            validImages.find(
                file => file.size > 5 * 1024 * 1024
            );

        if (largeImage) {

            setError(
                'Each image must be less than 5MB'
            );

            return;
        }

        setError('');

        setImages(validImages);

        const previews =
            validImages.map(file =>
                URL.createObjectURL(file)
            );

        setImagePreviews(previews);
    };

    // =========================================================
    // REMOVE IMAGE
    // =========================================================

    const removeImage = (index) => {

        const newImages =
            images.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            );

        const newPreviews =
            imagePreviews.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            );

        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    // =========================================================
    // SUBMIT REVIEW
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage('');
        setError('');

        if (!user) {

            setError(
                'Please login to write a review'
            );

            return;
        }

        if (selectedRating === 0) {

            setError(
                'Please select a rating'
            );

            return;
        }

        if (!reviewText.trim()) {

            setError(
                'Please write your review'
            );

            return;
        }

        try {

            setSubmitting(true);

            const formData =
                new FormData();

            formData.append(
                'rating',
                selectedRating
            );

            formData.append(
                'title',
                title
            );

            formData.append(
                'reviewText',
                reviewText
            );

            images.forEach(image => {

                formData.append(
                    'images',
                    image
                );

            });

            await API.post(
                `/reviews/product/${productId}`,
                formData
            );

            setMessage(
                'Review submitted successfully!'
            );

            setSelectedRating(0);
            setHoverRating(0);
            setTitle('');
            setReviewText('');
            setImages([]);
            setImagePreviews([]);

            await loadReviews();

        } catch (err) {

            console.error(
                'Review submission failed:',
                err
            );

            const backendMessage =
                err.response?.data;

            setError(
                typeof backendMessage === 'string'
                    ? backendMessage
                    : 'Unable to submit review'
            );

        } finally {

            setSubmitting(false);
        }
    };

    // =========================================================
    // FILTER REVIEWS
    // =========================================================

    const filteredReviews =
        ratingFilter === 0
            ? reviews
            : reviews.filter(
                review =>
                    Number(review.rating) ===
                    ratingFilter
            );

    // =========================================================
    // RENDER STARS
    // =========================================================

    const renderStars = (
        rating,
        interactive = false
    ) => {

        return (
            <div className="review-stars">

                {[1, 2, 3, 4, 5].map(star => (

                    <Star
                        key={star}
                        size={interactive ? 30 : 18}
                        fill={
                            star <= rating
                                ? 'currentColor'
                                : 'none'
                        }
                        className={
                            star <= rating
                                ? 'star-filled'
                                : 'star-empty'
                        }
                        onClick={
                            interactive
                                ? () =>
                                    setSelectedRating(
                                        star
                                    )
                                : undefined
                        }
                        onMouseEnter={
                            interactive
                                ? () =>
                                    setHoverRating(
                                        star
                                    )
                                : undefined
                        }
                        onMouseLeave={
                            interactive
                                ? () =>
                                    setHoverRating(0)
                                : undefined
                        }
                    />

                ))}

            </div>
        );
    };

    return (

        <section className="reviews-section">

            <div className="reviews-header">

                <div>

                    <h2>
                        Customer Reviews
                    </h2>

                    <p>
                        See what customers say about this product
                    </p>

                </div>

                <div className="review-total">

                    {reviews.length}

                    {' '}

                    {reviews.length === 1
                        ? 'Review'
                        : 'Reviews'}

                </div>

            </div>

            {/* =================================================
                RATING SUMMARY
            ================================================= */}

            <div className="rating-summary">

                <div className="rating-score">

                    <div className="average-rating">

                        {ratingSummary.average.toFixed(1)}

                    </div>

                    {renderStars(
                        Math.round(
                            ratingSummary.average
                        )
                    )}

                    <span>
                        Based on {reviews.length} reviews
                    </span>

                </div>

                <div className="rating-breakdown">

                    {[5, 4, 3, 2, 1].map(rating => {

                        const count =
                            ratingSummary.counts[rating];

                        const percentage =
                            reviews.length === 0
                                ? 0
                                : (
                                    count /
                                    reviews.length
                                ) * 100;

                        return (

                            <button
                                key={rating}
                                className="rating-row"
                                onClick={() =>
                                    setRatingFilter(
                                        ratingFilter === rating
                                            ? 0
                                            : rating
                                    )
                                }
                            >

                                <span>
                                    {rating} ★
                                </span>

                                <div className="rating-bar">

                                    <div
                                        className="rating-bar-fill"
                                        style={{
                                            width:
                                                `${percentage}%`
                                        }}
                                    />

                                </div>

                                <span>
                                    {count}
                                </span>

                            </button>

                        );

                    })}

                </div>

            </div>

            {/* =================================================
                WRITE REVIEW
            ================================================= */}

            {user?.role === 'CUSTOMER' && (

                <div className="write-review-card">

                    <h3>
                        Write a Review
                    </h3>

                    <p className="review-note">
                        Only customers who purchased and received this product
                        can submit a verified review.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <label>
                            Your Rating
                        </label>

                        <div className="interactive-rating">

                            {renderStars(
                                hoverRating ||
                                selectedRating,
                                true
                            )}

                            {selectedRating > 0 && (

                                <span>
                                    {selectedRating}/5
                                </span>

                            )}

                        </div>

                        <label>
                            Review Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={event =>
                                setTitle(
                                    event.target.value
                                )
                            }
                            placeholder="Summarize your experience"
                            maxLength={200}
                        />

                        <label>
                            Your Review
                        </label>

                        <textarea
                            value={reviewText}
                            onChange={event =>
                                setReviewText(
                                    event.target.value
                                )
                            }
                            placeholder="Tell other customers about your experience..."
                            rows={5}
                            maxLength={2000}
                        />

                        <label>
                            Add Product Photos
                        </label>

                        <div className="image-upload">

                            <label
                                htmlFor={`review-images-${productId}`}
                                className="image-upload-button"
                            >

                                <Camera size={20} />

                                Add Photos

                            </label>

                            <input
                                id={`review-images-${productId}`}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />

                            <span>
                                Up to 5 photos
                            </span>

                        </div>

                        {imagePreviews.length > 0 && (

                            <div className="image-preview-grid">

                                {imagePreviews.map(
                                    (preview, index) => (

                                        <div
                                            className="review-image-preview"
                                            key={preview}
                                        >

                                            <img
                                                src={preview}
                                                alt={`Review ${index + 1}`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                        {error && (

                            <div className="review-error">
                                {error}
                            </div>

                        )}

                        {message && (

                            <div className="review-success">
                                {message}
                            </div>

                        )}

                        <button
                            type="submit"
                            className="submit-review-button"
                            disabled={submitting}
                        >

                            <Send size={18} />

                            {submitting
                                ? 'Submitting...'
                                : 'Submit Review'}

                        </button>

                    </form>

                </div>

            )}

            {/* =================================================
                FILTER
            ================================================= */}

            {ratingFilter !== 0 && (

                <div className="active-filter">

                    Showing {ratingFilter}-star reviews

                    <button
                        onClick={() =>
                            setRatingFilter(0)
                        }
                    >
                        Clear filter
                    </button>

                </div>

            )}

            {/* =================================================
                REVIEWS LIST
            ================================================= */}

            <div className="reviews-list">

                {loading ? (

                    <div className="reviews-loading">
                        Loading reviews...
                    </div>

                ) : filteredReviews.length === 0 ? (

                    <div className="no-reviews">

                        <h3>
                            No reviews yet
                        </h3>

                        <p>
                            Be the first customer to review this product.
                        </p>

                    </div>

                ) : (

                    filteredReviews.map(review => (

                        <article
                            className="review-card"
                            key={review.id}
                        >

                            <div className="review-card-header">

                                <div className="reviewer-avatar">

                                    {(
                                        review.customerName ||
                                        'C'
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div className="reviewer-info">

                                    <div className="reviewer-name">

                                        {review.customerName ||
                                            'Verified Customer'}

                                        {review.verifiedPurchase && (

                                            <span className="verified-badge">

                                                <CheckCircle
                                                    size={15}
                                                />

                                                Verified Purchase

                                            </span>

                                        )}

                                    </div>

                                    <div className="review-meta">

                                        {renderStars(
                                            review.rating
                                        )}

                                        <span>
                                            {new Date(
                                                review.createdAt
                                            ).toLocaleDateString()}
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {review.title && (

                                <h3 className="review-title">
                                    {review.title}
                                </h3>

                            )}

                            <p className="review-text">
                                {review.reviewText}
                            </p>

                            {review.imageUrls &&
                                review.imageUrls.length > 0 && (

                                    <div className="customer-review-images">

                                        {review.imageUrls.map(
                                            (imageUrl, index) => (

                                                <img
                                                    key={imageUrl}
                                                    src={
                                                        `http://localhost:8080${imageUrl}`
                                                    }
                                                    alt={`Customer review ${index + 1}`}
                                                    onError={event => {
                                                        event.currentTarget.style.display =
                                                            'none';
                                                    }}
                                                />

                                            )
                                        )}

                                    </div>

                                )}

                            {review.vendorReply && (

                                <div className="vendor-reply">

                                    <strong>
                                        Seller Response
                                    </strong>

                                    <p>
                                        {review.vendorReply}
                                    </p>

                                </div>

                            )}

                        </article>

                    ))

                )}

            </div>

        </section>
    );
};

export default ReviewSection;