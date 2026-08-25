import API from './api';

const wishlistService = {

    getWishlist: async (userId) => {
        const response = await API.get(
            `/wishlist/${userId}`
        );

        return response.data;
    },

    addToWishlist: async (userId, productId) => {
        const response = await API.post(
            `/wishlist/${userId}/${productId}`
        );

        return response.data;
    },

    removeFromWishlist: async (userId, productId) => {
        await API.delete(
            `/wishlist/${userId}/${productId}`
        );
    },

    checkWishlist: async (userId, productId) => {
        const response = await API.get(
            `/wishlist/${userId}/check/${productId}`
        );

        return response.data;
    }
};

export default wishlistService;