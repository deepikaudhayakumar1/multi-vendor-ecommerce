import React, {
    useState,
    useEffect,
    useContext
} from 'react';

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

import API from '../services/api';

import {
    Trash2,
    ShoppingBag,
    CreditCard,
    CheckCircle,
    Loader2
} from 'lucide-react';


const Cart = () => {

    const { user } = useContext(AuthContext);

    const navigate = useNavigate();


    // ============================================================
    // STATE
    // ============================================================

    const [cartItems, setCartItems] = useState([]);

    const [deliveryAddress, setDeliveryAddress] =
        useState(
            '123 MG Road, Cyber City, Bangalore, Karnataka - 560001'
        );

    // IMPORTANT:
    // Razorpay is now the payment gateway
    const [paymentMethod, setPaymentMethod] =
        useState('RAZORPAY');

    const [coupon, setCoupon] =
        useState('');

    const [discount, setDiscount] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    const [paymentLoading, setPaymentLoading] =
        useState(false);

    const [orderCreated, setOrderCreated] =
        useState(null);

    const [errorMessage, setErrorMessage] =
        useState('');


    // ============================================================
    // LOAD RAZORPAY SCRIPT
    // ============================================================

    const loadRazorpayScript = () => {

        return new Promise((resolve) => {

            // Already loaded
            if (
                document.getElementById(
                    'razorpay-checkout-script'
                )
            ) {
                resolve(true);
                return;
            }


            const script =
                document.createElement('script');

            script.id =
                'razorpay-checkout-script';

            script.src =
                'https://checkout.razorpay.com/v1/checkout.js';

            script.onload = () => {
                resolve(true);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };


    // ============================================================
    // LOAD CART
    // ============================================================

    useEffect(() => {

        try {

            const items =
                JSON.parse(
                    localStorage.getItem('cart') || '[]'
                );

            setCartItems(
                Array.isArray(items)
                    ? items
                    : []
            );

        } catch (error) {

            console.error(
                'Error loading cart:',
                error
            );

            setCartItems([]);
        }

    }, []);


    // ============================================================
    // UPDATE QUANTITY
    // ============================================================

    const updateQuantity = (
        productId,
        newQty
    ) => {

        if (newQty <= 0) {

            removeItem(productId);

            return;
        }


        const updated =
            cartItems.map(
                (item) =>
                    item.productId === productId
                        ? {
                            ...item,
                            quantity: newQty
                        }
                        : item
            );


        setCartItems(updated);

        localStorage.setItem(
            'cart',
            JSON.stringify(updated)
        );
    };


    // ============================================================
    // REMOVE ITEM
    // ============================================================

    const removeItem = (productId) => {

        const updated =
            cartItems.filter(
                (item) =>
                    item.productId !== productId
            );


        setCartItems(updated);

        localStorage.setItem(
            'cart',
            JSON.stringify(updated)
        );
    };


    // ============================================================
    // SUBTOTAL
    // ============================================================

    const calculateSubtotal = () => {

        return cartItems.reduce(
            (total, item) => {

                const price =
                    Number(item.unitPrice || 0);

                const quantity =
                    Number(item.quantity || 0);

                return total +
                    price * quantity;

            },
            0
        );
    };


    // ============================================================
    // COUPON
    // ============================================================

    const applyCoupon = () => {

        if (
            coupon.trim().toUpperCase() ===
            'FESTIVE10'
        ) {

            const subtotal =
                calculateSubtotal();

            setDiscount(
                subtotal * 0.10
            );

            setErrorMessage('');

        } else {

            setDiscount(0);

            setErrorMessage(
                'Invalid promo coupon code. Try FESTIVE10'
            );
        }
    };


    // ============================================================
    // CREATE ORDER
    // ============================================================

    const createEcommerceOrder = async () => {

        const orderPayload = {

            customerId: user.id,

            deliveryAddress:
                deliveryAddress,

            paymentMethod:
                'RAZORPAY',

            items:
                cartItems.map(
                    (item) => ({
                        productId:
                            item.productId,

                        quantity:
                            Number(item.quantity)
                    })
                )
        };


        console.log(
            'ORDER PAYLOAD:',
            orderPayload
        );


        const response =
            await API.post(
                '/orders',
                orderPayload
            );


        console.log(
            'ECOMMERCE ORDER RESPONSE:',
            response.data
        );


        return response.data;
    };


    // ============================================================
    // CREATE RAZORPAY ORDER
    // ============================================================

    const createRazorpayOrder =
        async (orderId) => {

            console.log(
                'Creating Razorpay order for ecommerce order:',
                orderId
            );


            const response =
                await API.post(
                    '/payments/create-order',
                    {
                        orderId: orderId
                    }
                );


            console.log(
                'RAZORPAY ORDER RESPONSE:',
                response.data
            );


            return response.data;
        };


    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    const verifyPayment =
        async (
            ecommerceOrderId,
            razorpayResponse
        ) => {

            console.log(
                'Verifying Razorpay payment...'
            );


            const verificationPayload = {

                orderId:
                    ecommerceOrderId,

                razorpayOrderId:
                    razorpayResponse.razorpay_order_id,

                razorpayPaymentId:
                    razorpayResponse.razorpay_payment_id,

                razorpaySignature:
                    razorpayResponse.razorpay_signature
            };


            console.log(
                'PAYMENT VERIFICATION PAYLOAD:',
                verificationPayload
            );


            const response =
                await API.post(
                    '/payments/verify',
                    verificationPayload
                );


            console.log(
                'PAYMENT VERIFICATION RESPONSE:',
                response.data
            );


            return response.data;
        };


    // ============================================================
    // OPEN RAZORPAY CHECKOUT
    // ============================================================

    const openRazorpayCheckout =
        async (
            ecommerceOrder,
            razorpayOrder
        ) => {

            const scriptLoaded =
                await loadRazorpayScript();


            if (!scriptLoaded) {

                throw new Error(
                    'Razorpay Checkout could not be loaded. Please check your internet connection.'
                );
            }


            if (
                !window.Razorpay
            ) {

                throw new Error(
                    'Razorpay Checkout is not available.'
                );
            }


            console.log(
                'Opening Razorpay Checkout...'
            );


            const options = {

                key:
                    razorpayOrder.keyId ||
                    razorpayOrder.razorpayKeyId,

                amount:
                    Math.round(
                        Number(
                            razorpayOrder.amount
                        ) * 100
                    ),

                currency:
                    razorpayOrder.currency ||
                    'INR',

                name:
                    'Multi-Vendor E-Commerce',

                description:
                    `Payment for Order #${ecommerceOrder.id}`,

                order_id:
                    razorpayOrder.razorpayOrderId,


                handler:
                    async function (
                        response
                    ) {

                        console.log(
                            'RAZORPAY SUCCESS RESPONSE:',
                            response
                        );


                        try {

                            setPaymentLoading(
                                true
                            );


                            const verificationResponse =
                                await verifyPayment(
                                    ecommerceOrder.id,
                                    response
                                );


                            console.log(
                                'FINAL PAYMENT RESPONSE:',
                                verificationResponse
                            );


                            // Payment successful
                            setOrderCreated({

                                ...ecommerceOrder,

                                paymentStatus:
                                    'PAID',

                                paymentMethod:
                                    'RAZORPAY'
                            });


                            // Remove cart only AFTER
                            // successful payment verification
                            localStorage.removeItem(
                                'cart'
                            );

                            setCartItems([]);


                        } catch (error) {

                            console.error(
                                'PAYMENT VERIFICATION ERROR:',
                                error
                            );


                            const message =
                                error.response
                                    ?.data
                                    ?.message ||
                                error.message ||
                                'Payment verification failed';


                            setErrorMessage(
                                message
                            );

                            alert(
                                'Payment verification failed: ' +
                                message
                            );

                        } finally {

                            setPaymentLoading(
                                false
                            );
                        }
                    },


                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                'Razorpay checkout closed by customer'
                            );

                            setPaymentLoading(
                                false
                            );

                            setLoading(
                                false
                            );
                        }
                },


                prefill: {

                    name:
                        user?.name ||
                        user?.username ||
                        '',

                    email:
                        user?.email ||
                        '',

                    contact:
                        user?.phone ||
                        ''
                },


                notes: {

                    ecommerce_order_id:
                        String(
                            ecommerceOrder.id
                        )
                },


                theme: {

                    color:
                        '#6c5ce7'
                }
            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                'payment.failed',
                function (
                    response
                ) {

                    console.error(
                        'RAZORPAY PAYMENT FAILED:',
                        response
                    );


                    const reason =
                        response.error
                            ?.description ||
                        'Payment failed';


                    setErrorMessage(
                        reason
                    );


                    alert(
                        'Razorpay payment failed: ' +
                        reason
                    );


                    setPaymentLoading(
                        false
                    );

                    setLoading(
                        false
                    );
                }
            );


            razorpay.open();
        };


    // ============================================================
    // MAIN CHECKOUT
    // ============================================================

    const handleCheckout =
        async () => {

            setErrorMessage('');


            // ----------------------------------------------------
            // LOGIN CHECK
            // ----------------------------------------------------

            if (!user) {

                navigate('/login');

                return;
            }


            // ----------------------------------------------------
            // CART CHECK
            // ----------------------------------------------------

            if (
                cartItems.length === 0
            ) {

                alert(
                    'Your cart is empty.'
                );

                return;
            }


            // ----------------------------------------------------
            // ADDRESS CHECK
            // ----------------------------------------------------

            if (
                !deliveryAddress ||
                !deliveryAddress.trim()
            ) {

                alert(
                    'Please select a delivery address.'
                );

                return;
            }


            try {

                setLoading(true);


                console.log(
                    '=============================='
                );

                console.log(
                    'STARTING RAZORPAY CHECKOUT'
                );

                console.log(
                    '=============================='
                );


                // =================================================
                // STEP 1
                // CREATE OUR ECOMMERCE ORDER
                // =================================================

                const ecommerceOrder =
                    await createEcommerceOrder();


                console.log(
                    'STEP 1 COMPLETE - Ecommerce order created:',
                    ecommerceOrder
                );


                // =================================================
                // STEP 2
                // CREATE RAZORPAY ORDER
                // =================================================

                const razorpayOrder =
                    await createRazorpayOrder(
                        ecommerceOrder.id
                    );


                console.log(
                    'STEP 2 COMPLETE - Razorpay order created:',
                    razorpayOrder
                );


                // =================================================
                // STEP 3
                // OPEN RAZORPAY
                // =================================================

                setPaymentLoading(
                    true
                );


                await openRazorpayCheckout(
                    ecommerceOrder,
                    razorpayOrder
                );


            } catch (error) {

                console.error(
                    'CHECKOUT ERROR:',
                    error
                );


                console.error(
                    'STATUS:',
                    error.response?.status
                );


                console.error(
                    'DATA:',
                    error.response?.data
                );


                const backendMessage =
                    error.response
                        ?.data
                        ?.message;


                const backendError =
                    error.response
                        ?.data
                        ?.error;


                const message =
                    backendMessage ||
                    backendError ||
                    error.message ||
                    'Checkout failed';


                setErrorMessage(
                    message
                );


                alert(
                    'Checkout failed:\n\n' +
                    message
                );


            } finally {

                setLoading(false);
            }
        };


    // ============================================================
    // SUCCESS PAGE
    // ============================================================

    if (orderCreated) {

        return (

            <div
                className="glass-card"
                style={{
                    maxWidth: '650px',
                    margin: '3rem auto',
                    textAlign: 'center',
                    padding: '3rem'
                }}
            >

                <CheckCircle
                    size={64}
                    color="var(--success)"
                    style={{
                        marginBottom: '1rem'
                    }}
                />


                <h2
                    style={{
                        fontSize: '1.8rem',
                        marginBottom: '0.5rem'
                    }}
                >
                    Payment Successful!
                </h2>


                <p
                    style={{
                        color:
                            'var(--text-secondary)',
                        marginBottom: '1.5rem'
                    }}
                >

                    Order ID:

                    <strong
                        style={{
                            color:
                                'var(--accent-light)',
                            marginLeft: '5px'
                        }}
                    >
                        #{orderCreated.id}
                    </strong>

                </p>


                <div
                    style={{
                        background:
                            'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius:
                            'var(--radius-md)',
                        textAlign: 'left',
                        marginBottom: '2rem'
                    }}
                >

                    <p>
                        <strong>
                            Total Amount:
                        </strong>

                        {' '}₹
                        {Number(
                            orderCreated.totalAmount ||
                            0
                        ).toFixed(2)}
                    </p>


                    <p>
                        <strong>
                            Payment Status:
                        </strong>

                        {' '}

                        <span
                            className="badge badge-success"
                        >
                            PAID
                        </span>
                    </p>


                    <p>
                        <strong>
                            Payment Method:
                        </strong>

                        {' '}RAZORPAY
                    </p>


                    <p>
                        <strong>
                            Estimated Delivery:
                        </strong>

                        {' '}
                        Within 3 Business Days
                    </p>


                    <p>
                        <strong>
                            Delivery Address:
                        </strong>

                        {' '}
                        {orderCreated.deliveryAddress}
                    </p>

                </div>


                <button
                    className="btn btn-primary"
                    onClick={() =>
                        navigate('/orders')
                    }
                >
                    View Order History
                </button>

            </div>
        );
    }


    // ============================================================
    // CALCULATIONS
    // ============================================================

    const subtotal =
        calculateSubtotal();

    const grandTotal =
        Math.max(
            0,
            subtotal - discount
        );


    // ============================================================
    // UI
    // ============================================================

    return (

        <div>

            <h1
                style={{
                    fontSize: '2rem',
                    marginBottom: '2rem'
                }}
            >
                Shopping Cart & Multi-Step Checkout
            </h1>


            {/* ERROR MESSAGE */}

            {errorMessage && (

                <div
                    style={{
                        background:
                            'rgba(255,0,0,0.10)',
                        border:
                            '1px solid rgba(255,0,0,0.30)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}
                >

                    <strong>
                        Error:
                    </strong>

                    {' '}

                    {errorMessage}

                </div>
            )}


            {cartItems.length === 0 ? (

                <div
                    className="glass-card"
                    style={{
                        textAlign: 'center',
                        padding: '3rem'
                    }}
                >

                    <ShoppingBag
                        size={48}
                        color="var(--text-muted)"
                        style={{
                            marginBottom: '1rem'
                        }}
                    />


                    <h3>
                        Your cart is currently empty
                    </h3>


                    <button
                        className="btn btn-primary"
                        style={{
                            marginTop: '1rem'
                        }}
                        onClick={() =>
                            navigate('/shop')
                        }
                    >
                        Explore Marketplace Products
                    </button>

                </div>

            ) : (

                <div className="grid-3">


                    {/* ==================================================
                        CART ITEMS
                    ================================================== */}

                    <div
                        className="glass-card"
                        style={{
                            gridColumn:
                                'span 2'
                        }}
                    >

                        <h3
                            style={{
                                marginBottom:
                                    '1rem'
                            }}
                        >
                            Cart Items
                        </h3>


                        <div className="table-container">

                            <table
                                className="custom-table"
                            >

                                <thead>

                                    <tr>

                                        <th>
                                            Product
                                        </th>

                                        <th>
                                            Unit Price
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {cartItems.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.productId
                                                }
                                            >

                                                <td
                                                    style={{
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        gap:
                                                            '0.75rem'
                                                    }}
                                                >

                                                    <img
                                                        src={
                                                            item.imageUrl
                                                        }
                                                        alt={
                                                            item.name
                                                        }
                                                        style={{
                                                            width:
                                                                '40px',
                                                            height:
                                                                '40px',
                                                            borderRadius:
                                                                '4px',
                                                            objectFit:
                                                                'cover'
                                                        }}
                                                    />

                                                    <span>
                                                        {item.name}
                                                    </span>

                                                </td>


                                                <td>
                                                    ₹
                                                    {Number(
                                                        item.unitPrice
                                                    ).toFixed(2)}
                                                </td>


                                                <td>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        style={{
                                                            width:
                                                                '60px',
                                                            padding:
                                                                '0.25rem 0.5rem',
                                                            background:
                                                                'rgba(0,0,0,0.5)',
                                                            border:
                                                                '1px solid var(--border-color)',
                                                            color:
                                                                'white',
                                                            borderRadius:
                                                                '4px'
                                                        }}
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            updateQuantity(
                                                                item.productId,
                                                                parseInt(
                                                                    e.target.value
                                                                ) || 1
                                                            )
                                                        }
                                                    />

                                                </td>


                                                <td>

                                                    ₹
                                                    {(
                                                        Number(
                                                            item.unitPrice
                                                        ) *
                                                        Number(
                                                            item.quantity
                                                        )
                                                    ).toFixed(2)}

                                                </td>


                                                <td>

                                                    <button
                                                        className="btn btn-danger"
                                                        style={{
                                                            padding:
                                                                '0.3rem 0.6rem'
                                                        }}
                                                        onClick={() =>
                                                            removeItem(
                                                                item.productId
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={14}
                                                        />

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* ==================================================
                            DELIVERY ADDRESS
                        ================================================== */}

                        <div
                            style={{
                                marginTop:
                                    '2rem'
                            }}
                        >

                            <h3
                                style={{
                                    marginBottom:
                                        '1rem'
                                }}
                            >
                                Delivery Address Selection
                            </h3>


                            <select
                                className="form-select"
                                value={
                                    deliveryAddress
                                }
                                onChange={(e) =>
                                    setDeliveryAddress(
                                        e.target.value
                                    )
                                }
                            >

                                <option
                                    value="123 MG Road, Cyber City, Bangalore, Karnataka - 560001"
                                >
                                    Address 1:
                                    123 MG Road,
                                    Bangalore
                                    (Default)
                                </option>


                                <option
                                    value="45 Park Street, Connaught Place, New Delhi - 110001"
                                >
                                    Address 2:
                                    45 Park Street,
                                    New Delhi
                                </option>


                                <option
                                    value="88 Marine Drive, Churchgate, Mumbai - 400020"
                                >
                                    Address 3:
                                    88 Marine Drive,
                                    Mumbai
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ==================================================
                        ORDER SUMMARY
                    ================================================== */}

                    <div className="glass-card">

                        <h3
                            style={{
                                marginBottom:
                                    '1.25rem'
                            }}
                        >
                            Order Summary
                        </h3>


                        {/* SUBTOTAL */}

                        <div
                            style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                marginBottom:
                                    '0.75rem'
                            }}
                        >

                            <span
                                style={{
                                    color:
                                        'var(--text-secondary)'
                                }}
                            >
                                Subtotal
                            </span>


                            <span>
                                ₹
                                {subtotal.toFixed(2)}
                            </span>

                        </div>


                        {/* COUPON */}

                        <div
                            className="form-group"
                            style={{
                                marginTop:
                                    '1rem'
                            }}
                        >

                            <label
                                className="form-label"
                            >
                                Promotional Coupon Code
                            </label>


                            <div
                                style={{
                                    display:
                                        'flex',
                                    gap:
                                        '0.5rem'
                                }}
                            >

                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="FESTIVE10"
                                    value={
                                        coupon
                                    }
                                    onChange={(e) =>
                                        setCoupon(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    className="btn btn-secondary"
                                    onClick={
                                        applyCoupon
                                    }
                                >
                                    Apply
                                </button>

                            </div>

                        </div>


                        {/* DISCOUNT */}

                        {discount > 0 && (

                            <div
                                style={{
                                    display:
                                        'flex',
                                    justifyContent:
                                        'space-between',
                                    marginBottom:
                                        '0.75rem',
                                    color:
                                        'var(--success)'
                                }}
                            >

                                <span>
                                    Coupon Discount
                                </span>


                                <span>
                                    -₹
                                    {discount.toFixed(2)}
                                </span>

                            </div>

                        )}


                        {/* GRAND TOTAL */}

                        <div
                            style={{
                                display:
                                    'flex',
                                justifyContent:
                                    'space-between',
                                margin:
                                    '1rem 0',
                                borderTop:
                                    '1px solid var(--border-color)',
                                paddingTop:
                                    '1rem',
                                fontSize:
                                    '1.2rem',
                                fontWeight:
                                    700
                            }}
                        >

                            <span>
                                Grand Total
                            </span>


                            <span
                                style={{
                                    color:
                                        'var(--accent-light)'
                                }}
                            >
                                ₹
                                {grandTotal.toFixed(2)}
                            </span>

                        </div>


                        {/* PAYMENT METHOD */}

                        <div
                            className="form-group"
                            style={{
                                marginTop:
                                    '1.5rem'
                            }}
                        >

                            <label
                                className="form-label"
                            >
                                Payment Method
                            </label>


                            <select
                                className="form-select"
                                value={
                                    paymentMethod
                                }
                                onChange={(e) =>
                                    setPaymentMethod(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="RAZORPAY">
                                    Razorpay
                                    Test Payment
                                </option>

                            </select>

                        </div>


                        {/* PAYMENT BUTTON */}

                        <button
                            className="btn btn-primary"
                            style={{
                                width:
                                    '100%',
                                padding:
                                    '0.85rem',
                                marginTop:
                                    '1rem'
                            }}
                            onClick={
                                handleCheckout
                            }
                            disabled={
                                loading ||
                                paymentLoading
                            }
                        >

                            {loading ||
                            paymentLoading ? (

                                <>
                                    <Loader2
                                        size={18}
                                        style={{
                                            marginRight:
                                                '8px',
                                            animation:
                                                'spin 1s linear infinite'
                                        }}
                                    />

                                    {paymentLoading
                                        ? 'Opening Razorpay...'
                                        : 'Creating Order...'}
                                </>

                            ) : (

                                <>
                                    <CreditCard
                                        size={18}
                                        style={{
                                            marginRight:
                                                '8px'
                                        }}
                                    />

                                    Pay ₹
                                    {grandTotal.toFixed(2)}
                                    {' '}with Razorpay
                                </>

                            )}

                        </button>

                    </div>

                </div>
            )}

        </div>
    );
};


export default Cart;






// import React, {
//     useState,
//     useEffect,
//     useContext
// } from 'react';

// import { useNavigate } from 'react-router-dom';

// import { AuthContext } from '../context/AuthContext';

// import API from '../services/api';

// import paymentService
//     from '../services/paymentService';

// import {
//     Trash2,
//     ShoppingBag,
//     CreditCard,
//     CheckCircle,
//     Loader
// } from 'lucide-react';


// // ============================================================
// // LOAD RAZORPAY CHECKOUT SCRIPT
// // ============================================================

// const loadRazorpayScript = () => {

//     return new Promise((resolve) => {

//         // Already loaded
//         if (window.Razorpay) {
//             resolve(true);
//             return;
//         }

//         const script =
//             document.createElement('script');

//         script.src =
//             'https://checkout.razorpay.com/v1/checkout.js';

//         script.onload = () => {
//             resolve(true);
//         };

//         script.onerror = () => {
//             resolve(false);
//         };

//         document.body.appendChild(script);
//     });
// };


// // ============================================================
// // CART COMPONENT
// // ============================================================

// const Cart = () => {

//     const { user } = useContext(AuthContext);

//     const navigate = useNavigate();


//     // ========================================================
//     // STATE
//     // ========================================================

//     const [cartItems, setCartItems] =
//         useState([]);

//     const [deliveryAddress, setDeliveryAddress] =
//         useState(
//             '123 MG Road, Cyber City, Bangalore, Karnataka - 560001'
//         );

//     const [paymentMethod, setPaymentMethod] =
//         useState('RAZORPAY');

//     const [coupon, setCoupon] =
//         useState('');

//     const [discount, setDiscount] =
//         useState(0);

//     const [orderCreated, setOrderCreated] =
//         useState(null);

//     const [loading, setLoading] =
//         useState(false);

//     const [paymentLoading, setPaymentLoading] =
//         useState(false);

//     const [paymentStatus, setPaymentStatus] =
//         useState('');

//     const [paymentError, setPaymentError] =
//         useState('');

//     const [razorpayPaymentId, setRazorpayPaymentId] =
//         useState(null);


//     // ========================================================
//     // LOAD CART
//     // ========================================================

//     useEffect(() => {

//         try {

//             const items =
//                 JSON.parse(
//                     localStorage.getItem('cart') || '[]'
//                 );

//             setCartItems(items);

//         } catch (error) {

//             console.error(
//                 'Failed to load cart:',
//                 error
//             );

//             setCartItems([]);
//         }

//     }, []);


//     // ========================================================
//     // UPDATE QUANTITY
//     // ========================================================

//     const updateQuantity = (
//         productId,
//         newQty
//     ) => {

//         if (newQty <= 0) {

//             removeItem(productId);

//             return;
//         }

//         const updated =
//             cartItems.map((item) => {

//                 if (
//                     item.productId === productId
//                 ) {

//                     return {
//                         ...item,
//                         quantity: newQty
//                     };
//                 }

//                 return item;
//             });

//         setCartItems(updated);

//         localStorage.setItem(
//             'cart',
//             JSON.stringify(updated)
//         );
//     };


//     // ========================================================
//     // REMOVE ITEM
//     // ========================================================

//     const removeItem = (productId) => {

//         const updated =
//             cartItems.filter(
//                 (item) =>
//                     item.productId !== productId
//             );

//         setCartItems(updated);

//         localStorage.setItem(
//             'cart',
//             JSON.stringify(updated)
//         );
//     };


//     // ========================================================
//     // CALCULATE SUBTOTAL
//     // ========================================================

//     const calculateSubtotal = () => {

//         return cartItems.reduce(
//             (acc, item) =>
//                 acc +
//                 Number(item.unitPrice || 0) *
//                 Number(item.quantity || 0),
//             0
//         );
//     };


//     // ========================================================
//     // APPLY COUPON
//     // ========================================================

//     const applyCoupon = () => {

//         if (
//             coupon.trim().toUpperCase() ===
//             'FESTIVE10'
//         ) {

//             const subtotal =
//                 calculateSubtotal();

//             setDiscount(
//                 subtotal * 0.10
//             );

//             alert(
//                 'FESTIVE10 applied successfully!'
//             );

//         } else {

//             setDiscount(0);

//             alert(
//                 'Invalid promo coupon code. Try FESTIVE10'
//             );
//         }
//     };


//     // ========================================================
//     // OPEN RAZORPAY
//     // ========================================================

//     const openRazorpayCheckout = async (
//         ecommerceOrder
//     ) => {

//         try {

//             setPaymentError('');
//             setPaymentStatus('');
//             setPaymentLoading(true);


//             // ------------------------------------------------
//             // LOAD RAZORPAY SCRIPT
//             // ------------------------------------------------

//             const scriptLoaded =
//                 await loadRazorpayScript();

//             if (!scriptLoaded) {

//                 throw new Error(
//                     'Razorpay Checkout could not be loaded. Please check your internet connection.'
//                 );
//             }


//             // ------------------------------------------------
//             // CREATE RAZORPAY ORDER
//             // ------------------------------------------------

//             const razorpayOrder =
//                 await paymentService.createPaymentOrder(
//                     ecommerceOrder.id
//                 );


//             console.log(
//                 'Razorpay Order:',
//                 razorpayOrder
//             );


//             if (
//                 !razorpayOrder ||
//                 !razorpayOrder.razorpayOrderId
//             ) {

//                 throw new Error(
//                     'Razorpay order was not created.'
//                 );
//             }


//             // ------------------------------------------------
//             // RAZORPAY OPTIONS
//             // ------------------------------------------------

//             const options = {

//                 key:
//                     razorpayOrder.keyId,

//                 amount:
//                     Math.round(
//                         Number(
//                             razorpayOrder.amount
//                         ) * 100
//                     ),

//                 currency:
//                     razorpayOrder.currency ||
//                     'INR',

//                 name:
//                     'Multi Vendor Marketplace',

//                 description:
//                     `Payment for Order #${ecommerceOrder.id}`,

//                 order_id:
//                     razorpayOrder.razorpayOrderId,


//                 // ------------------------------------------------
//                 // CUSTOMER DETAILS
//                 // ------------------------------------------------

//                 prefill: {

//                     name:
//                         user?.name ||
//                         user?.username ||
//                         'Customer',

//                     email:
//                         user?.email ||
//                         '',

//                     contact:
//                         user?.phone ||
//                         user?.mobile ||
//                         ''
//                 },


//                 notes: {

//                     ecommerce_order_id:
//                         String(
//                             ecommerceOrder.id
//                         ),

//                     delivery_address:
//                         deliveryAddress
//                 },


//                 theme: {

//                     color:
//                         '#7c3aed'
//                 },


//                 modal: {

//                     confirm_close: true,

//                     escape: true,

//                     backdropclose: false,

//                     ondismiss: () => {

//                         console.log(
//                             'Razorpay checkout closed'
//                         );

//                         setPaymentLoading(false);

//                         setPaymentStatus(
//                             'Payment window closed. Your order is still pending payment.'
//                         );
//                     }
//                 },


//                 // ------------------------------------------------
//                 // PAYMENT SUCCESS
//                 // ------------------------------------------------

//                 handler: async (
//                     response
//                 ) => {

//                     console.log(
//                         'Razorpay Response:',
//                         response
//                     );


//                     try {

//                         setPaymentStatus(
//                             'Payment received. Verifying payment...'
//                         );


//                         // ----------------------------------------
//                         // VERIFY WITH BACKEND
//                         // ----------------------------------------

//                         const verification =
//                             await paymentService.verifyPayment({

//                                 orderId:
//                                     ecommerceOrder.id,

//                                 razorpayOrderId:
//                                     response.razorpay_order_id,

//                                 razorpayPaymentId:
//                                     response.razorpay_payment_id,

//                                 razorpaySignature:
//                                     response.razorpay_signature
//                             });


//                         console.log(
//                             'Payment Verification:',
//                             verification
//                         );


//                         // ----------------------------------------
//                         // SUCCESS
//                         // ----------------------------------------

//                         if (
//                             verification.status ===
//                             'SUCCESS'
//                         ) {

//                             setRazorpayPaymentId(
//                                 response.razorpay_payment_id
//                             );

//                             setPaymentStatus(
//                                 'Payment verified successfully!'
//                             );

//                             setPaymentLoading(false);


//                             /*
//                              * Only clear cart AFTER
//                              * successful backend verification.
//                              */

//                             localStorage.removeItem(
//                                 'cart'
//                             );

//                             setCartItems([]);


//                             /*
//                              * Keep ecommerce order object.
//                              *
//                              * Backend should update its
//                              * payment status to PAID.
//                              */

//                             setOrderCreated({

//                                 ...ecommerceOrder,

//                                 paymentStatus:
//                                     'PAID',

//                                 razorpayPaymentId:
//                                     response.razorpay_payment_id,

//                                 razorpayOrderId:
//                                     response.razorpay_order_id
//                             });

//                         } else {

//                             throw new Error(
//                                 verification.message ||
//                                 'Payment verification failed.'
//                             );
//                         }

//                     } catch (error) {

//                         console.error(
//                             'Payment verification error:',
//                             error
//                         );

//                         setPaymentLoading(false);

//                         setPaymentError(
//                             error.response?.data?.error ||
//                             error.response?.data?.message ||
//                             error.message ||
//                             'Payment verification failed.'
//                         );

//                         setPaymentStatus('');
//                     }
//                 }
//             };


//             // ------------------------------------------------
//             // CREATE RAZORPAY INSTANCE
//             // ------------------------------------------------

//             const razorpay =
//                 new window.Razorpay(options);


//             // ------------------------------------------------
//             // PAYMENT FAILED EVENT
//             // ------------------------------------------------

//             razorpay.on(
//                 'payment.failed',
//                 (response) => {

//                     console.error(
//                         'Razorpay payment failed:',
//                         response
//                     );

//                     setPaymentLoading(false);

//                     setPaymentStatus('');

//                     setPaymentError(
//                         response.error?.description ||
//                         'Payment failed. Please try again.'
//                     );
//                 }
//             );


//             // ------------------------------------------------
//             // OPEN RAZORPAY
//             // ------------------------------------------------

//             razorpay.open();


//         } catch (error) {

//             console.error(
//                 'Razorpay checkout error:',
//                 error
//             );

//             setPaymentLoading(false);

//             setPaymentError(
//                 error.response?.data?.error ||
//                 error.response?.data?.message ||
//                 error.message ||
//                 'Unable to start Razorpay payment.'
//             );
//         }
//     };


//     // ========================================================
//     // CREATE ECOMMERCE ORDER
//     // ========================================================

//     const handleCheckout = async () => {

//         if (!user) {

//             navigate('/login');

//             return;
//         }


//         if (cartItems.length === 0) {

//             alert(
//                 'Your cart is empty.'
//             );

//             return;
//         }


//         if (!deliveryAddress) {

//             alert(
//                 'Please select a delivery address.'
//             );

//             return;
//         }


//         setLoading(true);

//         setPaymentError('');

//         setPaymentStatus('');


//         try {

//             // ------------------------------------------------
//             // CREATE YOUR NORMAL ECOMMERCE ORDER
//             // ------------------------------------------------

//             const orderPayload = {

//                 customerId:
//                     user.id,

//                 deliveryAddress:
//                     deliveryAddress,

//                 /*
//                  * Razorpay payment
//                  */
//                 paymentMethod:
//                     'RAZORPAY',

//                 items:
//                     cartItems.map(
//                         (item) => ({
//                             productId:
//                                 item.productId,

//                             quantity:
//                                 item.quantity
//                         })
//                     )
//             };


//             console.log(
//                 'Creating ecommerce order:',
//                 orderPayload
//             );


//             const response =
//                 await API.post(
//                     '/orders',
//                     orderPayload
//                 );


//             const ecommerceOrder =
//                 response.data;


//             console.log(
//                 'Ecommerce Order Created:',
//                 ecommerceOrder
//             );


//             if (
//                 !ecommerceOrder ||
//                 !ecommerceOrder.id
//             ) {

//                 throw new Error(
//                     'Backend did not return a valid order ID.'
//                 );
//             }


//             /*
//              * IMPORTANT:
//              *
//              * We DON'T clear the cart here.
//              *
//              * We DON'T show Order Confirmed here.
//              *
//              * Payment must be verified first.
//              */


//             setPaymentStatus(
//                 'Order created. Opening Razorpay payment...'
//             );


//             // ------------------------------------------------
//             // OPEN RAZORPAY
//             // ------------------------------------------------

//             await openRazorpayCheckout(
//                 ecommerceOrder
//             );


//         } catch (error) {

//             console.error(
//                 'Order creation error:',
//                 error
//             );

//             setPaymentError(
//                 error.response?.data?.message ||
//                 error.response?.data?.error ||
//                 error.message ||
//                 'Order creation failed.'
//             );

//         } finally {

//             setLoading(false);
//         }
//     };


//     // ========================================================
//     // PAYMENT SUCCESS SCREEN
//     // ========================================================

//     if (orderCreated) {

//         return (

//             <div
//                 className="glass-card"
//                 style={{
//                     maxWidth: '650px',
//                     margin: '3rem auto',
//                     textAlign: 'center',
//                     padding: '3rem'
//                 }}
//             >

//                 <CheckCircle
//                     size={64}
//                     color="var(--success)"
//                     style={{
//                         marginBottom: '1rem'
//                     }}
//                 />


//                 <h2
//                     style={{
//                         fontSize: '1.8rem',
//                         marginBottom: '0.5rem'
//                     }}
//                 >
//                     Payment Successful!
//                 </h2>


//                 <p
//                     style={{
//                         color:
//                             'var(--text-secondary)',
//                         marginBottom: '1.5rem'
//                     }}
//                 >
//                     Your payment has been
//                     successfully verified.
//                 </p>


//                 <div
//                     style={{
//                         background:
//                             'rgba(255,255,255,0.05)',
//                         padding: '1.5rem',
//                         borderRadius:
//                             'var(--radius-md)',
//                         textAlign: 'left',
//                         marginBottom: '2rem'
//                     }}
//                 >

//                     <p>
//                         <strong>
//                             Order ID:
//                         </strong>{' '}
//                         #{orderCreated.id}
//                     </p>


//                     <p>
//                         <strong>
//                             Total Amount:
//                         </strong>{' '}
//                         ₹
//                         {Number(
//                             orderCreated.totalAmount ||
//                             0
//                         ).toFixed(2)}
//                     </p>


//                     <p>
//                         <strong>
//                             Payment Status:
//                         </strong>{' '}

//                         <span
//                             className="badge badge-success"
//                         >
//                             PAID
//                         </span>
//                     </p>


//                     <p>
//                         <strong>
//                             Payment Method:
//                         </strong>{' '}

//                         Razorpay
//                     </p>


//                     {razorpayPaymentId && (

//                         <p>

//                             <strong>
//                                 Razorpay Payment ID:
//                             </strong>{' '}

//                             <span
//                                 style={{
//                                     fontFamily:
//                                         'monospace'
//                                 }}
//                             >
//                                 {razorpayPaymentId}
//                             </span>

//                         </p>
//                     )}


//                     <p>
//                         <strong>
//                             Estimated Delivery:
//                         </strong>{' '}

//                         Within 3 Business Days
//                     </p>


//                     <p>
//                         <strong>
//                             Delivery Address:
//                         </strong>{' '}

//                         {orderCreated.deliveryAddress ||
//                             deliveryAddress}
//                     </p>

//                 </div>


//                 <button
//                     className="btn btn-primary"
//                     onClick={() =>
//                         navigate('/orders')
//                     }
//                 >
//                     View Order History & Tracking
//                 </button>

//             </div>
//         );
//     }


//     // ========================================================
//     // TOTALS
//     // ========================================================

//     const subtotal =
//         calculateSubtotal();

//     const grandTotal =
//         Math.max(
//             0,
//             subtotal - discount
//         );


//     // ========================================================
//     // UI
//     // ========================================================

//     return (

//         <div>

//             <h1
//                 style={{
//                     fontSize: '2rem',
//                     marginBottom: '2rem'
//                 }}
//             >
//                 Shopping Cart & Multi-Step Checkout
//             </h1>


//             {/* =================================================
//                 ERROR MESSAGE
//             ================================================= */}

//             {paymentError && (

//                 <div
//                     className="alert alert-danger"
//                     style={{
//                         marginBottom: '1.5rem'
//                     }}
//                 >
//                     {paymentError}
//                 </div>
//             )}


//             {/* =================================================
//                 PAYMENT STATUS
//             ================================================= */}

//             {paymentStatus && (

//                 <div
//                     className="alert alert-success"
//                     style={{
//                         marginBottom: '1.5rem'
//                     }}
//                 >
//                     {paymentStatus}
//                 </div>
//             )}


//             {cartItems.length === 0 ? (

//                 <div
//                     className="glass-card"
//                     style={{
//                         textAlign: 'center',
//                         padding: '3rem'
//                     }}
//                 >

//                     <ShoppingBag
//                         size={48}
//                         color="var(--text-muted)"
//                         style={{
//                             marginBottom: '1rem'
//                         }}
//                     />


//                     <h3>
//                         Your cart is currently empty
//                     </h3>


//                     <button
//                         className="btn btn-primary"
//                         style={{
//                             marginTop: '1rem'
//                         }}
//                         onClick={() =>
//                             navigate('/shop')
//                         }
//                     >
//                         Explore Marketplace Products
//                     </button>

//                 </div>

//             ) : (

//                 <div className="grid-3">

//                     {/* =================================================
//                         CART ITEMS
//                     ================================================= */}

//                     <div
//                         className="glass-card"
//                         style={{
//                             gridColumn: 'span 2'
//                         }}
//                     >

//                         <h3
//                             style={{
//                                 marginBottom: '1rem'
//                             }}
//                         >
//                             Cart Items
//                         </h3>


//                         <div className="table-container">

//                             <table className="custom-table">

//                                 <thead>

//                                     <tr>

//                                         <th>
//                                             Product
//                                         </th>

//                                         <th>
//                                             Unit Price
//                                         </th>

//                                         <th>
//                                             Quantity
//                                         </th>

//                                         <th>
//                                             Total
//                                         </th>

//                                         <th>
//                                             Action
//                                         </th>

//                                     </tr>

//                                 </thead>


//                                 <tbody>

//                                     {cartItems.map(
//                                         (item) => (

//                                             <tr
//                                                 key={
//                                                     item.productId
//                                                 }
//                                             >

//                                                 <td
//                                                     style={{
//                                                         display:
//                                                             'flex',
//                                                         alignItems:
//                                                             'center',
//                                                         gap:
//                                                             '0.75rem'
//                                                     }}
//                                                 >

//                                                     <img
//                                                         src={
//                                                             item.imageUrl
//                                                         }
//                                                         alt={
//                                                             item.name
//                                                         }
//                                                         style={{
//                                                             width:
//                                                                 '40px',
//                                                             height:
//                                                                 '40px',
//                                                             borderRadius:
//                                                                 '4px',
//                                                             objectFit:
//                                                                 'cover'
//                                                         }}
//                                                     />

//                                                     <span>
//                                                         {item.name}
//                                                     </span>

//                                                 </td>


//                                                 <td>
//                                                     ₹
//                                                     {Number(
//                                                         item.unitPrice ||
//                                                         0
//                                                     ).toFixed(2)}
//                                                 </td>


//                                                 <td>

//                                                     <input
//                                                         type="number"
//                                                         min="1"
//                                                         style={{
//                                                             width:
//                                                                 '60px',
//                                                             padding:
//                                                                 '0.25rem 0.5rem',
//                                                             background:
//                                                                 'rgba(0,0,0,0.5)',
//                                                             border:
//                                                                 '1px solid var(--border-color)',
//                                                             color:
//                                                                 'white',
//                                                             borderRadius:
//                                                                 '4px'
//                                                         }}
//                                                         value={
//                                                             item.quantity
//                                                         }
//                                                         onChange={(
//                                                             event
//                                                         ) =>
//                                                             updateQuantity(
//                                                                 item.productId,
//                                                                 parseInt(
//                                                                     event
//                                                                         .target
//                                                                         .value
//                                                                 ) || 1
//                                                             )
//                                                         }
//                                                     />

//                                                 </td>


//                                                 <td>
//                                                     ₹
//                                                     {(
//                                                         Number(
//                                                             item.unitPrice ||
//                                                             0
//                                                         ) *
//                                                         Number(
//                                                             item.quantity ||
//                                                             0
//                                                         )
//                                                     ).toFixed(2)}
//                                                 </td>


//                                                 <td>

//                                                     <button
//                                                         className="btn btn-danger"
//                                                         style={{
//                                                             padding:
//                                                                 '0.3rem 0.6rem'
//                                                         }}
//                                                         onClick={() =>
//                                                             removeItem(
//                                                                 item.productId
//                                                             )
//                                                         }
//                                                         disabled={
//                                                             loading ||
//                                                             paymentLoading
//                                                         }
//                                                     >

//                                                         <Trash2
//                                                             size={14}
//                                                         />

//                                                     </button>

//                                                 </td>

//                                             </tr>

//                                         )
//                                     )}

//                                 </tbody>

//                             </table>

//                         </div>


//                         {/* =================================================
//                             DELIVERY ADDRESS
//                         ================================================= */}

//                         <div
//                             style={{
//                                 marginTop: '2rem'
//                             }}
//                         >

//                             <h3
//                                 style={{
//                                     marginBottom:
//                                         '1rem'
//                                 }}
//                             >
//                                 Delivery Address Selection
//                             </h3>


//                             <select
//                                 className="form-select"
//                                 value={
//                                     deliveryAddress
//                                 }
//                                 onChange={(event) =>
//                                     setDeliveryAddress(
//                                         event.target.value
//                                     )
//                                 }
//                                 disabled={
//                                     loading ||
//                                     paymentLoading
//                                 }
//                             >

//                                 <option
//                                     value="123 MG Road, Cyber City, Bangalore, Karnataka - 560001"
//                                 >
//                                     Address 1:
//                                     123 MG Road,
//                                     Bangalore
//                                     (Default)
//                                 </option>


//                                 <option
//                                     value="45 Park Street, Connaught Place, New Delhi - 110001"
//                                 >
//                                     Address 2:
//                                     45 Park Street,
//                                     New Delhi
//                                 </option>


//                                 <option
//                                     value="88 Marine Drive, Churchgate, Mumbai - 400020"
//                                 >
//                                     Address 3:
//                                     88 Marine Drive,
//                                     Mumbai
//                                 </option>

//                             </select>

//                         </div>

//                     </div>


//                     {/* =================================================
//                         ORDER SUMMARY
//                     ================================================= */}

//                     <div className="glass-card">

//                         <h3
//                             style={{
//                                 marginBottom:
//                                     '1.25rem'
//                             }}
//                         >
//                             Order Summary
//                         </h3>


//                         {/* SUBTOTAL */}

//                         <div
//                             style={{
//                                 display:
//                                     'flex',
//                                 justifyContent:
//                                     'space-between',
//                                 marginBottom:
//                                     '0.75rem'
//                             }}
//                         >

//                             <span
//                                 style={{
//                                     color:
//                                         'var(--text-secondary)'
//                                 }}
//                             >
//                                 Subtotal
//                             </span>

//                             <span>
//                                 ₹
//                                 {subtotal.toFixed(2)}
//                             </span>

//                         </div>


//                         {/* COUPON */}

//                         <div
//                             className="form-group"
//                             style={{
//                                 marginTop:
//                                     '1rem'
//                             }}
//                         >

//                             <label
//                                 className="form-label"
//                             >
//                                 Promotional Coupon Code
//                             </label>


//                             <div
//                                 style={{
//                                     display:
//                                         'flex',
//                                     gap:
//                                         '0.5rem'
//                                 }}
//                             >

//                                 <input
//                                     type="text"
//                                     className="form-input"
//                                     placeholder="FESTIVE10"
//                                     value={coupon}
//                                     onChange={(event) =>
//                                         setCoupon(
//                                             event.target.value
//                                         )
//                                     }
//                                     disabled={
//                                         loading ||
//                                         paymentLoading
//                                     }
//                                 />


//                                 <button
//                                     className="btn btn-secondary"
//                                     onClick={
//                                         applyCoupon
//                                     }
//                                     disabled={
//                                         loading ||
//                                         paymentLoading
//                                     }
//                                 >
//                                     Apply
//                                 </button>

//                             </div>

//                         </div>


//                         {/* DISCOUNT */}

//                         {discount > 0 && (

//                             <div
//                                 style={{
//                                     display:
//                                         'flex',
//                                     justifyContent:
//                                         'space-between',
//                                     marginBottom:
//                                         '0.75rem',
//                                     color:
//                                         'var(--success)'
//                                 }}
//                             >

//                                 <span>
//                                     Coupon Discount
//                                 </span>

//                                 <span>
//                                     -₹
//                                     {discount.toFixed(2)}
//                                 </span>

//                             </div>

//                         )}


//                         {/* GRAND TOTAL */}

//                         <div
//                             style={{
//                                 display:
//                                     'flex',
//                                 justifyContent:
//                                     'space-between',
//                                 margin:
//                                     '1rem 0',
//                                 borderTop:
//                                     '1px solid var(--border-color)',
//                                 paddingTop:
//                                     '1rem',
//                                 fontSize:
//                                     '1.2rem',
//                                 fontWeight:
//                                     700
//                             }}
//                         >

//                             <span>
//                                 Grand Total
//                             </span>

//                             <span
//                                 style={{
//                                     color:
//                                         'var(--accent-light)'
//                                 }}
//                             >
//                                 ₹
//                                 {grandTotal.toFixed(2)}
//                             </span>

//                         </div>


//                         {/* PAYMENT METHOD */}

//                         <div
//                             className="form-group"
//                             style={{
//                                 marginTop:
//                                     '1.5rem'
//                             }}
//                         >

//                             <label
//                                 className="form-label"
//                             >
//                                 Payment Method
//                             </label>


//                             <select
//                                 className="form-select"
//                                 value={
//                                     paymentMethod
//                                 }
//                                 onChange={(event) =>
//                                     setPaymentMethod(
//                                         event.target.value
//                                     )
//                                 }
//                                 disabled={
//                                     loading ||
//                                     paymentLoading
//                                 }
//                             >

//                                 <option value="RAZORPAY">
//                                     Razorpay
//                                     Test Payment
//                                 </option>

//                             </select>

//                         </div>


//                         {/* PAY BUTTON */}

//                         <button
//                             className="btn btn-primary"
//                             style={{
//                                 width:
//                                     '100%',
//                                 padding:
//                                     '0.85rem',
//                                 marginTop:
//                                     '1rem'
//                             }}
//                             onClick={
//                                 handleCheckout
//                             }
//                             disabled={
//                                 loading ||
//                                 paymentLoading
//                             }
//                         >

//                             {loading ||
//                             paymentLoading ? (

//                                 <>
//                                     <Loader
//                                         size={18}
//                                         style={{
//                                             animation:
//                                                 'spin 1s linear infinite'
//                                         }}
//                                     />

//                                     {paymentLoading
//                                         ? 'Opening Payment...'
//                                         : 'Creating Order...'}
//                                 </>

//                             ) : (

//                                 <>
//                                     <CreditCard
//                                         size={18}
//                                     />

//                                     Pay ₹
//                                     {grandTotal.toFixed(
//                                         2
//                                     )} with Razorpay
//                                 </>
//                             )}

//                         </button>


//                         {/* SECURITY MESSAGE */}

//                         <p
//                             style={{
//                                 marginTop:
//                                     '1rem',
//                                 fontSize:
//                                     '0.8rem',
//                                 color:
//                                     'var(--text-secondary)',
//                                 textAlign:
//                                     'center'
//                             }}
//                         >
//                             🔒 Secure payment powered by
//                             Razorpay Test Mode
//                         </p>

//                     </div>

//                 </div>
//             )}

//         </div>
//     );
// };


// export default Cart;








// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import API from '../services/api';
// import { Trash2, ShoppingBag, CreditCard, CheckCircle } from 'lucide-react';

// const Cart = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [cartItems, setCartItems] = useState([]);
//   const [deliveryAddress, setDeliveryAddress] = useState('123 MG Road, Cyber City, Bangalore, Karnataka - 560001');
//   const [paymentMethod, setPaymentMethod] = useState('UPI');
//   const [coupon, setCoupon] = useState('');
//   const [discount, setDiscount] = useState(0);
//   const [orderCreated, setOrderCreated] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const items = JSON.parse(localStorage.getItem('cart') || '[]');
//     setCartItems(items);
//   }, []);

//   const updateQuantity = (productId, newQty) => {
//     if (newQty <= 0) {
//       removeItem(productId);
//       return;
//     }
//     const updated = cartItems.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item));
//     setCartItems(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const removeItem = (productId) => {
//     const updated = cartItems.filter((item) => item.productId !== productId);
//     setCartItems(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const calculateSubtotal = () => {
//     return cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
//   };

//   const applyCoupon = () => {
//     if (coupon.toUpperCase() === 'FESTIVE10') {
//       setDiscount(calculateSubtotal() * 0.1);
//     } else {
//       alert('Invalid promo coupon code. Try FESTIVE10');
//     }
//   };

//   const handleCheckout = async () => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }

//     if (cartItems.length === 0) return;

//     setLoading(true);
//     try {
//       const orderPayload = {
//         customerId: user.id,
//         deliveryAddress,
//         paymentMethod,
//         items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
//       };

//       const res = await API.post('/orders', orderPayload);
//       setOrderCreated(res.data);
//       localStorage.removeItem('cart');
//       setCartItems([]);
//     } catch (err) {
//       alert(err.response?.data?.message || 'Order creation failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (orderCreated) {
//     return (
//       <div className="glass-card" style={{ maxWidth: '650px', margin: '3rem auto', textAlign: 'center', padding: '3rem' }}>
//         <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
//         <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Order Confirmed Successfully!</h2>
//         <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
//           Unique System Order ID: <strong style={{ color: 'var(--accent-light)' }}>#{orderCreated.id}</strong>
//         </p>

//         <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem' }}>
//           <p><strong>Total Amount:</strong> ₹{orderCreated.totalAmount}</p>
//           <p><strong>Payment Status:</strong> <span className="badge badge-success">{orderCreated.paymentStatus}</span></p>
//           <p><strong>Payment Method:</strong> {orderCreated.paymentMethod}</p>
//           <p><strong>Estimated Delivery:</strong> Within 3 Business Days</p>
//           <p><strong>Delivery Address:</strong> {orderCreated.deliveryAddress}</p>
//         </div>

//         <button className="btn btn-primary" onClick={() => navigate('/orders')}>
//           View Order History & Tracking SLA
//         </button>
//       </div>
//     );
//   }

//   const subtotal = calculateSubtotal();
//   const grandTotal = Math.max(0, subtotal - discount);

//   return (
//     <div>
//       <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Shopping Cart & Multi-Step Checkout</h1>

//       {cartItems.length === 0 ? (
//         <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
//           <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
//           <h3>Your cart is currently empty</h3>
//           <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/shop')}>
//             Explore Marketplace Products
//           </button>
//         </div>
//       ) : (
//         <div className="grid-3">
//           <div className="glass-card" style={{ gridColumn: 'span 2' }}>
//             <h3 style={{ marginBottom: '1rem' }}>Cart Items</h3>
//             <div className="table-container">
//               <table className="custom-table">
//                 <thead>
//                   <tr>
//                     <th>Product</th>
//                     <th>Unit Price</th>
//                     <th>Quantity</th>
//                     <th>Total</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cartItems.map((item) => (
//                     <tr key={item.productId}>
//                       <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
//                         <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
//                         <span>{item.name}</span>
//                       </td>
//                       <td>₹{item.unitPrice}</td>
//                       <td>
//                         <input
//                           type="number"
//                           min="1"
//                           style={{ width: '60px', padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px' }}
//                           value={item.quantity}
//                           onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
//                         />
//                       </td>
//                       <td>₹{item.unitPrice * item.quantity}</td>
//                       <td>
//                         <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem' }} onClick={() => removeItem(item.productId)}>
//                           <Trash2 size={14} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div style={{ marginTop: '2rem' }}>
//               <h3 style={{ marginBottom: '1rem' }}>Delivery Address Selection</h3>
//               <select className="form-select" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}>
//                 <option value="123 MG Road, Cyber City, Bangalore, Karnataka - 560001">Address 1: 123 MG Road, Bangalore (Default)</option>
//                 <option value="45 Park Street, Connaught Place, New Delhi - 110001">Address 2: 45 Park Street, New Delhi</option>
//                 <option value="88 Marine Drive, Churchgate, Mumbai - 400020">Address 3: 88 Marine Drive, Mumbai</option>
//               </select>
//             </div>
//           </div>

//           <div className="glass-card">
//             <h3 style={{ marginBottom: '1.25rem' }}>Order Summary</h3>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
//               <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
//               <span>₹{subtotal.toFixed(2)}</span>
//             </div>

//             <div className="form-group" style={{ marginTop: '1rem' }}>
//               <label className="form-label">Promotional Coupon Code</label>
//               <div style={{ display: 'flex', gap: '0.5rem' }}>
//                 <input
//                   type="text"
//                   className="form-input"
//                   placeholder="FESTIVE10"
//                   value={coupon}
//                   onChange={(e) => setCoupon(e.target.value)}
//                 />
//                 <button className="btn btn-secondary" onClick={applyCoupon}>Apply</button>
//               </div>
//             </div>

//             {discount > 0 && (
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--success)' }}>
//                 <span>Coupon Discount</span>
//                 <span>-₹{discount.toFixed(2)}</span>
//               </div>
//             )}

//             <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
//               <span>Grand Total</span>
//               <span style={{ color: 'var(--accent-light)' }}>₹{grandTotal.toFixed(2)}</span>
//             </div>

//             <div className="form-group" style={{ marginTop: '1.5rem' }}>
//               <label className="form-label">Select Payment Method</label>
//               <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
//                 <option value="UPI">UPI Instant Payment (GPay / PhonePe / Paytm)</option>
//                 <option value="CARD">Credit / Debit Card (Visa / MasterCard / RuPay)</option>
//                 <option value="NET_BANKING">Net Banking (SBI / HDFC / ICICI)</option>
//                 <option value="COD">Cash on Delivery (COD with OTP Delivery Scan)</option>
//                 <option value="BNPL">Buy Now Pay Later (BNPL Credit)</option>
//               </select>
//             </div>

//             <button className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }} onClick={handleCheckout} disabled={loading}>
//               <CreditCard size={18} /> {loading ? 'Processing Order...' : 'Confirm & Place Order'}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Cart;
