import API from './api';

const paymentService = {

    // ============================================================
    // CREATE RAZORPAY ORDER
    // POST /api/payments/create-order
    // ============================================================
    createPaymentOrder: async (orderId) => {
        const response = await API.post(
            '/payments/create-order',
            {
                orderId: orderId
            }
        );

        return response.data;
    },

    // ============================================================
    // VERIFY RAZORPAY PAYMENT
    // POST /api/payments/verify
    // ============================================================
    verifyPayment: async ({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    }) => {

        const response = await API.post(
            '/payments/verify',
            {
                orderId: orderId,
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                razorpaySignature: razorpaySignature
            }
        );

        return response.data;
    },

    // ============================================================
    // GET PAYMENT BY ORDER
    // GET /api/payments/order/{orderId}
    // ============================================================
    getPaymentByOrderId: async (orderId) => {

        const response = await API.get(
            `/payments/order/${orderId}`
        );

        return response.data;
    }
};

export default paymentService;