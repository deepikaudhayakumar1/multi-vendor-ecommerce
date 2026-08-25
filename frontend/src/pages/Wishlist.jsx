import React, {
    useContext,
    useEffect,
    useState
} from 'react';

import {
    Heart,
    Trash2,
    ShoppingCart
} from 'lucide-react';

import { AuthContext } from '../context/AuthContext';

import wishlistService
    from '../services/wishlistService';

import './Wishlist.css';

const Wishlist = () => {

    const { user } = useContext(AuthContext);

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // IMAGE URL
    // =========================================================

    const getImageUrl = (imageUrl) => {

        if (!imageUrl) {
            return 'https://picsum.photos/400/300';
        }

        if (
            imageUrl.startsWith('http://') ||
            imageUrl.startsWith('https://')
        ) {
            return imageUrl;
        }

        return `http://localhost:8080${imageUrl}`;
    };

    // =========================================================
    // LOAD WISHLIST
    // =========================================================

    useEffect(() => {

        const loadWishlist = async () => {

            if (!user?.id) {
                setWishlist([]);
                setLoading(false);
                return;
            }

            try {

                setLoading(true);

                const data =
                    await wishlistService.getWishlist(
                        user.id
                    );

                console.log(
                    'Wishlist API response:',
                    data
                );

                setWishlist(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    'Error loading wishlist:',
                    error
                );

                setWishlist([]);

            } finally {

                setLoading(false);
            }
        };

        loadWishlist();

    }, [user?.id]);

    // =========================================================
    // REMOVE ITEM
    // =========================================================

    const removeItem = async (productId) => {

        if (!user?.id || !productId) {
            return;
        }

        try {

            await wishlistService.removeFromWishlist(
                user.id,
                productId
            );

            // New DTO uses productId directly
            setWishlist((previous) =>
                previous.filter(
                    (item) =>
                        item.productId !== productId
                )
            );

        } catch (error) {

            console.error(
                'Error removing wishlist item:',
                error
            );

            alert(
                'Unable to remove item from wishlist.'
            );
        }
    };

    // =========================================================
    // NOT LOGGED IN
    // =========================================================

    if (!user) {

        return (
            <div className="wishlist-page">

                <div className="wishlist-empty">

                    <Heart size={64} />

                    <h2>
                        Please login to view your wishlist
                    </h2>

                    <p>
                        Save products you love and
                        access them anytime.
                    </p>

                </div>

            </div>
        );
    }

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="wishlist-page">

                <div className="wishlist-loading">
                    Loading your wishlist...
                </div>

            </div>
        );
    }

    // =========================================================
    // PAGE
    // =========================================================

    return (
        <div className="wishlist-page">

            <div className="wishlist-header">

                <div>

                    <h1>

                        <Heart
                            size={30}
                            fill="currentColor"
                        />

                        My Wishlist

                    </h1>

                    <p>
                        {wishlist.length}{' '}
                        {wishlist.length === 1
                            ? 'item'
                            : 'items'}
                    </p>

                </div>

            </div>

            {/* EMPTY WISHLIST */}

            {wishlist.length === 0 ? (

                <div className="wishlist-empty">

                    <Heart size={70} />

                    <h2>
                        Your wishlist is empty
                    </h2>

                    <p>
                        Tap the heart on products
                        you want to save.
                    </p>

                </div>

            ) : (

                /* PRODUCT GRID */

                <div className="wishlist-grid">

                    {wishlist.map((item) => (

                        <div
                            className="wishlist-card"
                            key={item.id}
                        >

                            {/* PRODUCT IMAGE */}

                            <div className="wishlist-image">

                                <img
                                    src={getImageUrl(
                                        item.imageUrl
                                    )}
                                    alt={item.name}
                                    onError={(e) => {

                                        e.currentTarget.src =
                                            'https://picsum.photos/400/300';

                                    }}
                                />

                                {/* HEART */}

                                <div className="wishlist-heart">

                                    <Heart
                                        size={22}
                                        fill="currentColor"
                                    />

                                </div>

                            </div>

                            {/* PRODUCT DETAILS */}

                            <div className="wishlist-details">

                                <h3>
                                    {item.name}
                                </h3>

                                {item.description && (

                                    <p>
                                        {item.description}
                                    </p>

                                )}

                                {/* PRICE */}

                                <div className="wishlist-price">

                                    ₹
                                    {Number(
                                        item.basePrice || 0
                                    ).toLocaleString('en-IN')}

                                    {item.mrp && (

                                        <span>

                                            ₹
                                            {Number(
                                                item.mrp
                                            ).toLocaleString(
                                                'en-IN'
                                            )}

                                        </span>

                                    )}

                                </div>

                                {/* ACTIONS */}

                                <div className="wishlist-actions">

                                    <button
                                        type="button"
                                        className="wishlist-cart-button"
                                    >

                                        <ShoppingCart
                                            size={17}
                                        />

                                        Add to Cart

                                    </button>

                                    <button
                                        type="button"
                                        className="wishlist-remove-button"
                                        onClick={() =>
                                            removeItem(
                                                item.productId
                                            )
                                        }
                                        title="Remove from wishlist"
                                    >

                                        <Trash2
                                            size={17}
                                        />

                                        Remove

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
};

export default Wishlist;