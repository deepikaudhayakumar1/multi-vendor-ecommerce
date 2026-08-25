import API from "./api";

const reviewService = {

    // ============================================================
    // GET PRODUCT REVIEWS
    // ============================================================
    getProductReviews: async (productId) => {
        try {
            const response = await API.get(
                `/reviews/product/${productId}`
            );

            return response.data;

        } catch (error) {
            console.error(
                "Error fetching product reviews:",
                error.response?.data || error.message
            );

            throw error;
        }
    },

    // ============================================================
    // CREATE REVIEW
    // ============================================================
    createReview: async (
        productId,
        rating,
        title,
        reviewText,
        images
    ) => {

        const formData = new FormData();

        formData.append("rating", String(rating));

        if (title && title.trim() !== "") {
            formData.append("title", title.trim());
        }

        formData.append(
            "reviewText",
            reviewText.trim()
        );

        if (images && images.length > 0) {

            images.forEach((image) => {

                if (image instanceof File) {
                    formData.append("images", image);
                }

            });
        }

        try {

            console.log(
                "Creating review:",
                productId,
                rating,
                reviewText
            );

            const response = await API.post(
                `/reviews/product/${productId}`,
                formData
            );

            return response.data;

        } catch (error) {

            console.error(
                "Review creation failed:",
                error.response?.status,
                error.response?.data || error.message
            );

            throw error;
        }
    }
};

export default reviewService;