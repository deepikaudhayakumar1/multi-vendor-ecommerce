import React, {
  useContext,
  useEffect,
  useState
} from 'react';

import { Heart } from 'lucide-react';

import { AuthContext } from '../context/AuthContext';

import wishlistService from '../services/wishlistService';


const WishlistButton = ({ productId }) => {

  const { user } = useContext(AuthContext);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const [loading, setLoading] = useState(false);


  // =========================================================
  // CHECK WHETHER PRODUCT IS ALREADY IN WISHLIST
  // =========================================================

  useEffect(() => {

    const checkWishlist = async () => {

      if (!user?.id || !productId) {

        setIsWishlisted(false);

        return;

      }


      try {

        const result =
          await wishlistService.checkWishlist(
            user.id,
            productId
          );


        setIsWishlisted(
          result === true
        );


      } catch (error) {

        console.error(
          'Error checking wishlist:',
          error
        );

        setIsWishlisted(false);

      }

    };


    checkWishlist();

  }, [user?.id, productId]);


  // =========================================================
  // TOGGLE WISHLIST
  // =========================================================

  const handleWishlistClick = async (event) => {

    // Prevent product/card click
    event.preventDefault();
    event.stopPropagation();


    // User not logged in
    if (!user?.id) {

      alert(
        'Please login to add products to your wishlist.'
      );

      return;

    }


    if (!productId) {

      console.error(
        'Wishlist error: productId is missing'
      );

      return;

    }


    if (loading) {

      return;

    }


    try {

      setLoading(true);


      // =====================================================
      // REMOVE FROM WISHLIST
      // =====================================================

      if (isWishlisted) {

        await wishlistService.removeFromWishlist(
          user.id,
          productId
        );


        setIsWishlisted(false);


        console.log(
          'Removed from wishlist:',
          productId
        );

      }


      // =====================================================
      // ADD TO WISHLIST
      // =====================================================

      else {

        const response =
          await wishlistService.addToWishlist(
            user.id,
            productId
          );


        console.log(
          'Added to wishlist:',
          response
        );


        setIsWishlisted(true);

      }


    } catch (error) {

      console.error(
        'Wishlist operation failed:',
        error
      );


      // Show backend error if available
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        'Unable to update wishlist. Please try again.';


      alert(message);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // BUTTON
  // =========================================================

  return (

    <button
      type="button"
      onClick={handleWishlistClick}
      disabled={loading}
      aria-label={
        isWishlisted
          ? 'Remove from wishlist'
          : 'Add to wishlist'
      }
      title={
        isWishlisted
          ? 'Remove from Wishlist'
          : 'Add to Wishlist'
      }
      style={{
        width: '42px',
        height: '42px',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        border: 'none',
        borderRadius: '50%',

        background: 'rgba(0, 0, 0, 0.65)',

        color: isWishlisted
          ? '#e91e63'
          : '#ffffff',

        cursor: loading
          ? 'not-allowed'
          : 'pointer',

        opacity: loading
          ? 0.6
          : 1,

        transition:
          'all 0.2s ease',

        backdropFilter:
          'blur(4px)'
      }}
    >

      <Heart
        size={22}
        strokeWidth={2}
        fill={
          isWishlisted
            ? 'currentColor'
            : 'none'
        }
      />

    </button>

  );

};


export default WishlistButton;