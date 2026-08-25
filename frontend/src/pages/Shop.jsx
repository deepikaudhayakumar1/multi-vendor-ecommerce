import React, {
    useEffect,
    useState,
    useContext
} from "react";

import API from "../services/api";
import reviewService from "../services/ReviewService";

import { AuthContext } from "../context/AuthContext";

import {
    ShoppingCart,
    Star,
    Camera,
    X,
    ThumbsUp
} from "lucide-react";

import WishlistButton from "../components/WishlistButton";


const Shop = () => {

    const { user } = useContext(AuthContext);

    // =====================================================
    // PRODUCT STATES
    // =====================================================

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");

    const [cartSuccess, setCartSuccess] = useState("");


    // =====================================================
    // REVIEW STATES
    // =====================================================

    const [reviews, setReviews] = useState([]);

    const [reviewLoading, setReviewLoading] = useState(false);

    const [reviewSubmitting, setReviewSubmitting] =
        useState(false);

    const [reviewRating, setReviewRating] =
        useState(5);

    const [reviewComment, setReviewComment] =
        useState("");

    const [reviewImages, setReviewImages] =
        useState([]);

    const [reviewImagePreviews, setReviewImagePreviews] =
        useState([]);

    const [reviewMessage, setReviewMessage] =
        useState("");

    const [reviewError, setReviewError] =
        useState("");


    // =====================================================
    // BACKEND IMAGE URL
    // =====================================================

    const getImageUrl = (imageUrl) => {

        if (!imageUrl) {
            return "https://picsum.photos/400/300";
        }

        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        return `http://localhost:8080${imageUrl}`;
    };


    // =====================================================
    // GET PRODUCT IMAGES
    // =====================================================

    const getProductImages = (product) => {

        if (
            Array.isArray(product.imageUrls) &&
            product.imageUrls.length > 0
        ) {
            return product.imageUrls;
        }

        if (product.imageUrl) {
            return [product.imageUrl];
        }

        return [];
    };


    // =====================================================
    // LOAD PRODUCTS + CATEGORIES
    // =====================================================

    useEffect(() => {

        API.get("/products?status=ACTIVE")
            .then((res) => {

                console.log(
                    "PRODUCTS FROM BACKEND:",
                    res.data
                );

                setProducts(
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );
            })
            .catch((err) => {

                console.error(
                    "Error loading products:",
                    err
                );
            });


        API.get("/categories")
            .then((res) => {

                setCategories(
                    Array.isArray(res.data)
                        ? res.data
                        : []
                );
            })
            .catch((err) => {

                console.error(
                    "Error loading categories:",
                    err
                );
            });

    }, []);


    // =====================================================
    // FILTER PRODUCTS
    // =====================================================

    const filteredProducts = products.filter((product) => {

        const searchText =
            search.toLowerCase().trim();

        const matchesSearch =
            product.name
                ?.toLowerCase()
                .includes(searchText) ||

            product.description
                ?.toLowerCase()
                .includes(searchText);


        const matchesCategory =
            selectedCategory === "ALL" ||
            Number(product.categoryId) ===
                Number(selectedCategory);


        return (
            matchesSearch &&
            matchesCategory
        );
    });


    // =====================================================
    // ADD TO CART
    // =====================================================

    const addToCart = (product) => {

        let cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );


        const existingIndex =
            cart.findIndex(
                (item) =>
                    item.productId === product.id
            );


        if (existingIndex > -1) {

            cart[existingIndex].quantity += 1;

        } else {

            cart.push({

                productId: product.id,

                name: product.name,

                unitPrice: product.basePrice,

                mrp: product.mrp,

                quantity: 1,

                vendorId: product.vendorId,

                imageUrl:
                    getImageUrl(
                        product.imageUrl
                    ),

                imageUrls:
                    getProductImages(product)
                        .map((image) =>
                            getImageUrl(image)
                        )
            });
        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        setCartSuccess(
            `Added "${product.name}" to your shopping cart!`
        );


        setTimeout(() => {

            setCartSuccess("");

        }, 3000);
    };


    // =====================================================
    // LOAD REVIEWS
    // =====================================================

    const loadReviews = async (productId) => {

        try {

            setReviewLoading(true);

            const response =
                await reviewService.getProductReviews(
                    productId
                );


            setReviews(
                Array.isArray(response)
                    ? response
                    : []
            );

        } catch (error) {

            console.error(
                "Error loading reviews:",
                error
            );

            setReviews([]);

        } finally {

            setReviewLoading(false);
        }
    };


    // =====================================================
    // OPEN PRODUCT DETAILS
    // =====================================================

    const openProductDetails = async (product) => {

        setSelectedProduct(product);

        setReviewRating(5);

        setReviewComment("");

        setReviewImages([]);

        setReviewImagePreviews([]);

        setReviewMessage("");

        setReviewError("");


        const images =
            getProductImages(product);


        if (images.length > 0) {

            setSelectedImage(
                getImageUrl(images[0])
            );

        } else {

            setSelectedImage(
                "https://picsum.photos/400/300"
            );
        }


        await loadReviews(product.id);
    };


    // =====================================================
    // CLOSE PRODUCT DETAILS
    // =====================================================

    const closeProductDetails = () => {

        setSelectedProduct(null);

        setSelectedImage("");

        setReviews([]);

        setReviewImages([]);

        setReviewImagePreviews([]);

        setReviewComment("");

        setReviewRating(5);

        setReviewMessage("");

        setReviewError("");
    };


    // =====================================================
    // HANDLE REVIEW IMAGE SELECTION
    // =====================================================

    const handleReviewImageChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );


        // Maximum 5 images

        if (files.length > 5) {

            setReviewError(
                "You can upload maximum 5 images."
            );

            return;
        }


        // Validate images

        const validFiles =
            files.filter((file) => {

                if (
                    !file.type.startsWith("image/")
                ) {
                    return false;
                }


                // Maximum 5 MB

                if (
                    file.size >
                    5 * 1024 * 1024
                ) {
                    return false;
                }


                return true;
            });


        if (
            validFiles.length !==
            files.length
        ) {

            setReviewError(
                "Only images up to 5 MB each are allowed."
            );

            return;
        }


        setReviewError("");

        setReviewImages(validFiles);


        const previews =
            validFiles.map((file) =>
                URL.createObjectURL(file)
            );


        setReviewImagePreviews(
            previews
        );
    };


    // =====================================================
    // REMOVE REVIEW IMAGE
    // =====================================================

    const removeReviewImage = (index) => {

        const updatedFiles =
            reviewImages.filter(
                (_, i) => i !== index
            );


        const updatedPreviews =
            reviewImagePreviews.filter(
                (_, i) => i !== index
            );


        setReviewImages(
            updatedFiles
        );

        setReviewImagePreviews(
            updatedPreviews
        );
    };


    // =====================================================
    // SUBMIT REVIEW
    // =====================================================

    const submitReview = async (event) => {

        event.preventDefault();


        if (!selectedProduct) {
            return;
        }


        // =================================================
        // LOGIN CHECK
        // =================================================

        if (!user) {

            setReviewError(
                "Please login to write a review."
            );

            return;
        }


        // =================================================
        // REVIEW VALIDATION
        // =================================================

        if (!reviewComment.trim()) {

            setReviewError(
                "Please write your review."
            );

            return;
        }


        if (
            reviewComment.trim().length < 5
        ) {

            setReviewError(
                "Review should contain at least 5 characters."
            );

            return;
        }


        if (
            reviewRating < 1 ||
            reviewRating > 5
        ) {

            setReviewError(
                "Rating must be between 1 and 5."
            );

            return;
        }


        try {

            setReviewSubmitting(true);

            setReviewError("");

            setReviewMessage("");


            // =================================================
            // CREATE REVIEW
            //
            // IMPORTANT:
            //
            // Backend endpoint:
            //
            // POST
            // /api/reviews/product/{productId}
            //
            // reviewService handles FormData.
            // =================================================

            console.log(
                "Creating review for product:",
                selectedProduct.id
            );


            await reviewService.createReview(

                selectedProduct.id,

                reviewRating,

                "",

                reviewComment.trim(),

                reviewImages
            );


            // =================================================
            // SUCCESS
            // =================================================

            setReviewMessage(
                "Your review has been submitted successfully!"
            );


            setReviewComment("");

            setReviewRating(5);

            setReviewImages([]);

            setReviewImagePreviews([]);


            // =================================================
            // RELOAD REVIEWS
            // =================================================

            await loadReviews(
                selectedProduct.id
            );


        } catch (error) {

            console.error(
                "Error submitting review:",
                error
            );


            console.error(
                "Backend error:",
                error.response?.data
            );


            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                setReviewError(
                    "Please login again to submit your review."
                );

            } else {

                const backendMessage =
                    typeof error.response?.data ===
                    "string"
                        ? error.response.data
                        : error.response?.data?.message;


                setReviewError(
                    backendMessage ||
                    "Unable to submit review. Please try again."
                );
            }

        } finally {

            setReviewSubmitting(false);
        }
    };


    // =====================================================
    // CALCULATE AVERAGE RATING
    // =====================================================

    const calculateAverageRating = () => {

        if (!reviews.length) {
            return 0;
        }


        const total =
            reviews.reduce(
                (sum, review) =>
                    sum +
                    Number(
                        review.rating || 0
                    ),
                0
            );


        return (
            total / reviews.length
        ).toFixed(1);
    };


    // =====================================================
    // STAR DISPLAY
    // =====================================================

    const renderStars = (
        rating,
        interactive = false
    ) => {

        return (

            <div
                style={{
                    display: "flex",
                    gap: "3px"
                }}
            >

                {[1, 2, 3, 4, 5].map(
                    (star) => (

                        <Star
                            key={star}

                            size={
                                interactive
                                    ? 28
                                    : 17
                            }

                            fill={
                                star <= rating
                                    ? "#f5a623"
                                    : "transparent"
                            }

                            stroke={
                                star <= rating
                                    ? "#f5a623"
                                    : "var(--text-muted)"
                            }

                            style={{
                                cursor:
                                    interactive
                                        ? "pointer"
                                        : "default"
                            }}

                            onClick={() => {

                                if (
                                    interactive
                                ) {

                                    setReviewRating(
                                        star
                                    );
                                }
                            }}
                        />

                    )
                )}

            </div>
        );
    };


    // =====================================================
    // REVIEW IMAGE URL
    // =====================================================

    const getReviewImageUrl = (image) => {

        if (!image) {
            return "";
        }


        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {

            return image;
        }


        return `http://localhost:8080${image}`;
    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem"
                }}
            >

                <div>

                    <h1
                        style={{
                            fontSize: "2rem"
                        }}
                    >
                        Marketplace Catalogue
                    </h1>


                    <p
                        style={{
                            color:
                                "var(--text-secondary)"
                        }}
                    >
                        Browse GST-compliant products
                        from verified marketplace vendors
                    </p>

                </div>

            </div>


            {/* =================================================
                CART SUCCESS
            ================================================= */}

            {cartSuccess && (

                <div className="alert alert-success">

                    {cartSuccess}

                </div>

            )}


            {/* =================================================
                FILTER BAR
            ================================================= */}

            <div
                className="glass-card"
                style={{
                    marginBottom: "2rem",
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap"
                }}
            >

                {/* SEARCH */}

                <div
                    style={{
                        flex: 1,
                        minWidth: "250px"
                    }}
                >

                    <input
                        type="text"
                        className="form-input"

                        placeholder="Search products by title, description..."

                        value={search}

                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>


                {/* CATEGORY */}

                <div
                    style={{
                        width: "200px"
                    }}
                >

                    <select
                        className="form-select"

                        value={
                            selectedCategory
                        }

                        onChange={(event) =>
                            setSelectedCategory(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Categories
                        </option>


                        {categories.map(
                            (category) => (

                                <option
                                    key={
                                        category.id
                                    }

                                    value={
                                        category.id
                                    }
                                >

                                    {category.name}
                                    {" "}
                                    (GST{" "}
                                    {category.gstRate}
                                    %)

                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* =================================================
                PRODUCTS GRID
            ================================================= */}

            <div className="grid-3">

                {filteredProducts.length === 0 ? (

                    <div
                        className="glass-card"
                        style={{
                            gridColumn:
                                "1 / -1",
                            textAlign: "center",
                            padding: "3rem"
                        }}
                    >

                        <h3>
                            No products found
                        </h3>

                        <p
                            style={{
                                color:
                                    "var(--text-secondary)"
                            }}
                        >
                            Try changing your
                            search or category.
                        </p>

                    </div>

                ) : (

                    filteredProducts.map(
                        (product) => {

                            const productImages =
                                getProductImages(
                                    product
                                );


                            const mainImage =
                                productImages.length >
                                0

                                    ? getImageUrl(
                                        productImages[0]
                                    )

                                    : "https://picsum.photos/400/300";


                            return (

                                <div
                                    key={
                                        product.id
                                    }

                                    className="glass-card"

                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        justifyContent:
                                            "space-between"
                                    }}
                                >

                                    <div>

                                        {/* =================================================
                                            PRODUCT IMAGE + WISHLIST
                                        ================================================= */}

                                        <div
                                            style={{
                                                height:
                                                    "180px",
                                                borderRadius:
                                                    "var(--radius-sm)",
                                                overflow:
                                                    "hidden",
                                                marginBottom:
                                                    "1rem",
                                                background:
                                                    "#000",
                                                position:
                                                    "relative"
                                            }}
                                        >

                                            {/* WISHLIST */}

                                            <div
                                                style={{
                                                    position:
                                                        "absolute",
                                                    top:
                                                        "10px",
                                                    right:
                                                        "10px",
                                                    zIndex:
                                                        5
                                                }}
                                            >

                                                <WishlistButton
                                                    productId={
                                                        product.id
                                                    }
                                                />

                                            </div>


                                            {/* IMAGE */}

                                            <img
                                                src={
                                                    mainImage
                                                }

                                                alt={
                                                    product.name
                                                }

                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "100%",
                                                    objectFit:
                                                        "cover"
                                                }}

                                                onError={(
                                                    event
                                                ) => {

                                                    event.currentTarget.src =
                                                        "https://picsum.photos/400/300";
                                                }}
                                            />

                                        </div>


                                        {/* BADGE */}

                                        <span
                                            className="badge badge-info"

                                            style={{
                                                marginBottom:
                                                    "0.5rem"
                                            }}
                                        >
                                            Verified Vendor Product
                                        </span>


                                        {/* PRODUCT NAME */}

                                        <h3
                                            style={{
                                                fontSize:
                                                    "1.15rem",
                                                marginBottom:
                                                    "0.5rem"
                                            }}
                                        >
                                            {product.name}
                                        </h3>


                                        {/* DESCRIPTION */}

                                        <p
                                            style={{
                                                color:
                                                    "var(--text-secondary)",
                                                fontSize:
                                                    "0.85rem",
                                                marginBottom:
                                                    "1rem",
                                                height:
                                                    "40px",
                                                overflow:
                                                    "hidden"
                                            }}
                                        >
                                            {
                                                product.description
                                            }
                                        </p>

                                    </div>


                                    {/* =================================================
                                        PRICE + STOCK
                                    ================================================= */}

                                    <div>

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "baseline",
                                                marginBottom:
                                                    "1rem"
                                            }}
                                        >

                                            <div>

                                                <span
                                                    style={{
                                                        fontSize:
                                                            "1.4rem",
                                                        fontWeight:
                                                            700,
                                                        color:
                                                            "var(--accent-light)"
                                                    }}
                                                >
                                                    ₹
                                                    {
                                                        product.basePrice
                                                    }
                                                </span>


                                                <span
                                                    style={{
                                                        textDecoration:
                                                            "line-through",
                                                        color:
                                                            "var(--text-muted)",
                                                        fontSize:
                                                            "0.9rem",
                                                        marginLeft:
                                                            "0.5rem"
                                                    }}
                                                >
                                                    ₹
                                                    {
                                                        product.mrp
                                                    }
                                                </span>

                                            </div>


                                            <span className="badge badge-success">

                                                Stock:{" "}
                                                {
                                                    product.stock
                                                }

                                            </span>

                                        </div>


                                        {/* BUTTONS */}

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap:
                                                    "0.5rem"
                                            }}
                                        >

                                            <button
                                                className="btn btn-secondary"

                                                style={{
                                                    flex: 1
                                                }}

                                                onClick={() =>
                                                    openProductDetails(
                                                        product
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>


                                            <button
                                                className="btn btn-primary"

                                                style={{
                                                    flex: 1
                                                }}

                                                onClick={() =>
                                                    addToCart(
                                                        product
                                                    )
                                                }
                                            >

                                                <ShoppingCart
                                                    size={16}
                                                />

                                                Add to Cart

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )
                )}

            </div>


            {/* =================================================
                PRODUCT DETAIL MODAL
            ================================================= */}

            {selectedProduct && (

                <div
                    className="modal-overlay"

                    onClick={
                        closeProductDetails
                    }
                >

                    <div
                        className="modal-content"

                        onClick={(event) =>
                            event.stopPropagation()
                        }

                        style={{
                            maxHeight:
                                "90vh",
                            overflowY:
                                "auto"
                        }}
                    >

                        {/* =================================================
                            PRODUCT TITLE
                        ================================================= */}

                        <h2
                            style={{
                                marginBottom:
                                    "1rem"
                            }}
                        >
                            {
                                selectedProduct.name
                            }
                        </h2>


                        {/* =================================================
                            LARGE IMAGE
                        ================================================= */}

                        <img
                            src={
                                selectedImage
                            }

                            alt={
                                selectedProduct.name
                            }

                            style={{
                                width:
                                    "100%",
                                height:
                                    "300px",
                                objectFit:
                                    "contain",
                                background:
                                    "#000",
                                borderRadius:
                                    "var(--radius-md)",
                                marginBottom:
                                    "1rem"
                            }}

                            onError={(event) => {

                                event.currentTarget.src =
                                    "https://picsum.photos/400/300";
                            }}
                        />


                        {/* =================================================
                            IMAGE THUMBNAILS
                        ================================================= */}

                        {getProductImages(
                            selectedProduct
                        ).length > 0 && (

                            <div
                                style={{
                                    display:
                                        "flex",
                                    gap:
                                        "10px",
                                    marginBottom:
                                        "1.5rem",
                                    overflowX:
                                        "auto",
                                    paddingBottom:
                                        "5px"
                                }}
                            >

                                {getProductImages(
                                    selectedProduct
                                ).map(
                                    (
                                        image,
                                        index
                                    ) => {

                                        const imageUrl =
                                            getImageUrl(
                                                image
                                            );


                                        const isSelected =
                                            selectedImage ===
                                            imageUrl;


                                        return (

                                            <button
                                                key={
                                                    index
                                                }

                                                type="button"

                                                onClick={() =>
                                                    setSelectedImage(
                                                        imageUrl
                                                    )
                                                }

                                                style={{
                                                    width:
                                                        "75px",
                                                    height:
                                                        "75px",
                                                    padding:
                                                        0,
                                                    borderRadius:
                                                        "8px",
                                                    overflow:
                                                        "hidden",
                                                    cursor:
                                                        "pointer",

                                                    border:
                                                        isSelected
                                                            ? "3px solid var(--accent-light)"
                                                            : "2px solid rgba(255,255,255,0.2)",

                                                    background:
                                                        "#000",
                                                    flexShrink:
                                                        0
                                                }}
                                            >

                                                <img
                                                    src={
                                                        imageUrl
                                                    }

                                                    alt={
                                                        `Product ${index + 1}`
                                                    }

                                                    style={{
                                                        width:
                                                            "100%",
                                                        height:
                                                            "100%",
                                                        objectFit:
                                                            "cover"
                                                    }}

                                                    onError={(
                                                        event
                                                    ) => {

                                                        event.currentTarget.src =
                                                            "https://picsum.photos/100/100";
                                                    }}
                                                />

                                            </button>

                                        );
                                    }
                                )}

                            </div>

                        )}


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <p
                            style={{
                                color:
                                    "var(--text-secondary)",
                                marginBottom:
                                    "1rem"
                            }}
                        >
                            {
                                selectedProduct.description
                            }
                        </p>


                        {/* =================================================
                            PRODUCT INFO
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "1.5rem",
                                marginBottom:
                                    "1.5rem",
                                background:
                                    "rgba(255,255,255,0.05)",
                                padding:
                                    "1rem",
                                borderRadius:
                                    "var(--radius-sm)",
                                flexWrap:
                                    "wrap"
                            }}
                        >

                            {/* SELLING PRICE */}

                            <div>

                                <span
                                    style={{
                                        fontSize:
                                            "0.8rem",
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    Selling Price
                                </span>

                                <p
                                    style={{
                                        fontSize:
                                            "1.25rem",
                                        fontWeight:
                                            700,
                                        color:
                                            "var(--accent-light)"
                                    }}
                                >
                                    ₹
                                    {
                                        selectedProduct.basePrice
                                    }
                                </p>

                            </div>


                            {/* MRP */}

                            <div>

                                <span
                                    style={{
                                        fontSize:
                                            "0.8rem",
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    MRP
                                </span>

                                <p
                                    style={{
                                        fontSize:
                                            "1.25rem",
                                        fontWeight:
                                            700,
                                        textDecoration:
                                            "line-through"
                                    }}
                                >
                                    ₹
                                    {
                                        selectedProduct.mrp
                                    }
                                </p>

                            </div>


                            {/* GST */}

                            <div>

                                <span
                                    style={{
                                        fontSize:
                                            "0.8rem",
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    Applicable GST
                                </span>

                                <p
                                    style={{
                                        fontSize:
                                            "1.25rem",
                                        fontWeight:
                                            700
                                    }}
                                >
                                    {
                                        selectedProduct.gstRate
                                    }%
                                </p>

                            </div>


                            {/* STOCK */}

                            <div>

                                <span
                                    style={{
                                        fontSize:
                                            "0.8rem",
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    Available Stock
                                </span>

                                <p
                                    style={{
                                        fontSize:
                                            "1.25rem",
                                        fontWeight:
                                            700
                                    }}
                                >
                                    {
                                        selectedProduct.stock
                                    }
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            REVIEWS SECTION
                        ================================================= */}

                        <div
                            style={{
                                marginTop:
                                    "2rem",
                                borderTop:
                                    "1px solid rgba(255,255,255,0.1)",
                                paddingTop:
                                    "2rem"
                            }}
                        >

                            {/* REVIEW HEADER */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    marginBottom:
                                        "1.5rem",
                                    flexWrap:
                                        "wrap",
                                    gap:
                                        "1rem"
                                }}
                            >

                                <div>

                                    <h2
                                        style={{
                                            marginBottom:
                                                "0.4rem"
                                        }}
                                    >
                                        Customer Reviews
                                    </h2>

                                    <p
                                        style={{
                                            color:
                                                "var(--text-secondary)",
                                            margin:
                                                0
                                        }}
                                    >

                                        {reviews.length ===
                                        0
                                            ? "No reviews yet"
                                            : `${reviews.length} review${
                                                reviews.length >
                                                1
                                                    ? "s"
                                                    : ""
                                            }`}

                                    </p>

                                </div>


                                {/* AVERAGE RATING */}

                                {reviews.length >
                                    0 && (

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap:
                                                "0.6rem"
                                        }}
                                    >

                                        <span
                                            style={{
                                                fontSize:
                                                    "1.8rem",
                                                fontWeight:
                                                    700
                                            }}
                                        >
                                            {
                                                calculateAverageRating()
                                            }
                                        </span>

                                        {renderStars(
                                            Math.round(
                                                Number(
                                                    calculateAverageRating()
                                                )
                                            )
                                        )}

                                    </div>

                                )}

                            </div>


                            {/* =================================================
                                WRITE REVIEW
                            ================================================= */}

                            {user ? (

                                <form
                                    onSubmit={
                                        submitReview
                                    }

                                    style={{
                                        background:
                                            "rgba(255,255,255,0.04)",
                                        padding:
                                            "1.2rem",
                                        borderRadius:
                                            "var(--radius-md)",
                                        marginBottom:
                                            "2rem"
                                    }}
                                >

                                    <h3
                                        style={{
                                            marginBottom:
                                                "1rem"
                                        }}
                                    >
                                        Write a Review
                                    </h3>


                                    {/* RATING */}

                                    <div
                                        style={{
                                            marginBottom:
                                                "1rem"
                                        }}
                                    >

                                        <label
                                            style={{
                                                display:
                                                    "block",
                                                marginBottom:
                                                    "0.5rem",
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Your Rating
                                        </label>

                                        {renderStars(
                                            reviewRating,
                                            true
                                        )}

                                    </div>


                                    {/* COMMENT */}

                                    <div
                                        style={{
                                            marginBottom:
                                                "1rem"
                                        }}
                                    >

                                        <label
                                            style={{
                                                display:
                                                    "block",
                                                marginBottom:
                                                    "0.5rem",
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Your Review
                                        </label>


                                        <textarea
                                            className="form-input"

                                            rows="4"

                                            placeholder="Share your experience with this product..."

                                            value={
                                                reviewComment
                                            }

                                            onChange={(
                                                event
                                            ) =>
                                                setReviewComment(
                                                    event.target.value
                                                )
                                            }

                                            maxLength={
                                                1000
                                            }

                                            style={{
                                                resize:
                                                    "vertical"
                                            }}
                                        />


                                        <small
                                            style={{
                                                color:
                                                    "var(--text-muted)"
                                            }}
                                        >
                                            {
                                                reviewComment.length
                                            }
                                            /1000
                                        </small>

                                    </div>


                                    {/* IMAGE UPLOAD */}

                                    <div
                                        style={{
                                            marginBottom:
                                                "1rem"
                                        }}
                                    >

                                        <label
                                            style={{
                                                display:
                                                    "block",
                                                marginBottom:
                                                    "0.5rem",
                                                fontWeight:
                                                    600
                                            }}
                                        >
                                            Add Product Photos
                                        </label>


                                        <label
                                            htmlFor="reviewImages"

                                            style={{
                                                display:
                                                    "inline-flex",
                                                alignItems:
                                                    "center",
                                                gap:
                                                    "0.5rem",
                                                padding:
                                                    "0.7rem 1rem",
                                                border:
                                                    "1px dashed rgba(255,255,255,0.3)",
                                                borderRadius:
                                                    "8px",
                                                cursor:
                                                    "pointer"
                                            }}
                                        >

                                            <Camera
                                                size={18}
                                            />

                                            Upload Photos

                                        </label>


                                        <input
                                            id="reviewImages"

                                            type="file"

                                            accept="image/*"

                                            multiple

                                            onChange={
                                                handleReviewImageChange
                                            }

                                            style={{
                                                display:
                                                    "none"
                                            }}
                                        />


                                        <p
                                            style={{
                                                fontSize:
                                                    "0.8rem",
                                                color:
                                                    "var(--text-muted)",
                                                marginTop:
                                                    "0.5rem"
                                            }}
                                        >
                                            Maximum 5 photos,
                                            5 MB each
                                        </p>


                                        {/* IMAGE PREVIEWS */}

                                        {reviewImagePreviews.length >
                                            0 && (

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "10px",
                                                    flexWrap:
                                                        "wrap",
                                                    marginTop:
                                                        "1rem"
                                                }}
                                            >

                                                {reviewImagePreviews.map(
                                                    (
                                                        preview,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={
                                                                index
                                                            }

                                                            style={{
                                                                width:
                                                                    "90px",
                                                                height:
                                                                    "90px",
                                                                position:
                                                                    "relative"
                                                            }}
                                                        >

                                                            <img
                                                                src={
                                                                    preview
                                                                }

                                                                alt={
                                                                    `Review ${
                                                                        index +
                                                                        1
                                                                    }`
                                                                }

                                                                style={{
                                                                    width:
                                                                        "100%",
                                                                    height:
                                                                        "100%",
                                                                    objectFit:
                                                                        "cover",
                                                                    borderRadius:
                                                                        "8px"
                                                                }}
                                                            />


                                                            <button
                                                                type="button"

                                                                onClick={() =>
                                                                    removeReviewImage(
                                                                        index
                                                                    )
                                                                }

                                                                style={{
                                                                    position:
                                                                        "absolute",
                                                                    top:
                                                                        "-7px",
                                                                    right:
                                                                        "-7px",
                                                                    width:
                                                                        "24px",
                                                                    height:
                                                                        "24px",
                                                                    borderRadius:
                                                                        "50%",
                                                                    border:
                                                                        "none",
                                                                    cursor:
                                                                        "pointer",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center"
                                                                }}
                                                            >

                                                                <X
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                            </button>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>


                                    {/* ERROR */}

                                    {reviewError && (

                                        <div
                                            className="alert alert-danger"

                                            style={{
                                                marginBottom:
                                                    "1rem"
                                            }}
                                        >
                                            {
                                                reviewError
                                            }
                                        </div>

                                    )}


                                    {/* SUCCESS */}

                                    {reviewMessage && (

                                        <div
                                            className="alert alert-success"

                                            style={{
                                                marginBottom:
                                                    "1rem"
                                            }}
                                        >
                                            {
                                                reviewMessage
                                            }
                                        </div>

                                    )}


                                    {/* SUBMIT */}

                                    <button
                                        type="submit"

                                        className="btn btn-primary"

                                        disabled={
                                            reviewSubmitting
                                        }

                                        style={{
                                            width:
                                                "100%"
                                        }}
                                    >

                                        {reviewSubmitting
                                            ? "Submitting Review..."
                                            : "Submit Review"}

                                    </button>

                                </form>

                            ) : (

                                <div
                                    style={{
                                        background:
                                            "rgba(255,255,255,0.04)",
                                        padding:
                                            "1rem",
                                        borderRadius:
                                            "var(--radius-md)",
                                        marginBottom:
                                            "2rem",
                                        textAlign:
                                            "center"
                                    }}
                                >
                                    Please login to write
                                    a review.
                                </div>

                            )}


                            {/* =================================================
                                EXISTING REVIEWS
                            ================================================= */}

                            <div>

                                <h3
                                    style={{
                                        marginBottom:
                                            "1rem"
                                    }}
                                >
                                    Reviews from Customers
                                </h3>


                                {reviewLoading ? (

                                    <p
                                        style={{
                                            color:
                                                "var(--text-secondary)"
                                        }}
                                    >
                                        Loading reviews...
                                    </p>

                                ) : reviews.length ===
                                  0 ? (

                                    <div
                                        style={{
                                            textAlign:
                                                "center",
                                            padding:
                                                "2rem",
                                            color:
                                                "var(--text-secondary)"
                                        }}
                                    >

                                        <Star
                                            size={40}
                                            style={{
                                                marginBottom:
                                                    "0.5rem",
                                                opacity:
                                                    0.5
                                            }}
                                        />

                                        <p>
                                            Be the first
                                            customer to
                                            review this
                                            product.
                                        </p>

                                    </div>

                                ) : (

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            gap:
                                                "1rem"
                                        }}
                                    >

                                        {reviews.map(
                                            (review) => (

                                                <div
                                                    key={
                                                        review.id
                                                    }

                                                    style={{
                                                        padding:
                                                            "1rem",
                                                        border:
                                                            "1px solid rgba(255,255,255,0.1)",
                                                        borderRadius:
                                                            "var(--radius-md)"
                                                    }}
                                                >

                                                    {/* REVIEWER */}

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            marginBottom:
                                                                "0.6rem"
                                                        }}
                                                    >

                                                        <div>

                                                            <strong>
                                                                {
                                                                    review.customerName ||
                                                                    "Verified Customer"
                                                                }
                                                            </strong>


                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "4px"
                                                                }}
                                                            >

                                                                {renderStars(
                                                                    Number(
                                                                        review.rating ||
                                                                            0
                                                                    )
                                                                )}

                                                            </div>

                                                        </div>


                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "0.8rem",
                                                                color:
                                                                    "var(--text-muted)"
                                                            }}
                                                        >

                                                            {review.createdAt
                                                                ? new Date(
                                                                    review.createdAt
                                                                ).toLocaleDateString()
                                                                : ""}

                                                        </span>

                                                    </div>


                                                    {/* REVIEW TITLE */}

                                                    {review.title && (

                                                        <h4
                                                            style={{
                                                                marginBottom:
                                                                    "0.4rem"
                                                            }}
                                                        >
                                                            {
                                                                review.title
                                                            }
                                                        </h4>

                                                    )}


                                                    {/* REVIEW TEXT */}

                                                    <p
                                                        style={{
                                                            color:
                                                                "var(--text-secondary)",
                                                            lineHeight:
                                                                1.6,
                                                            marginBottom:
                                                                "0.8rem"
                                                        }}
                                                    >

                                                        {
                                                            review.reviewText
                                                        }

                                                    </p>


                                                    {/* REVIEW IMAGES */}

                                                    {Array.isArray(
                                                        review.imageUrls
                                                    ) &&
                                                        review.imageUrls
                                                            .length >
                                                            0 && (

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap:
                                                                        "10px",
                                                                    flexWrap:
                                                                        "wrap",
                                                                    marginBottom:
                                                                        "0.8rem"
                                                                }}
                                                            >

                                                                {review.imageUrls.map(
                                                                    (
                                                                        image,
                                                                        index
                                                                    ) => (

                                                                        <img
                                                                            key={
                                                                                index
                                                                            }

                                                                            src={
                                                                                getReviewImageUrl(
                                                                                    image
                                                                                )
                                                                            }

                                                                            alt="Customer review"

                                                                            style={{
                                                                                width:
                                                                                    "100px",
                                                                                height:
                                                                                    "100px",
                                                                                objectFit:
                                                                                    "cover",
                                                                                borderRadius:
                                                                                    "8px"
                                                                            }}

                                                                            onError={(
                                                                                event
                                                                            ) => {

                                                                                event.currentTarget.src =
                                                                                    "https://picsum.photos/100/100";
                                                                            }}
                                                                        />

                                                                    )
                                                                )}

                                                            </div>

                                                        )}


                                                    {/* VERIFIED PURCHASE + HELPFUL */}

                                                    <div
                                                        style={{
                                                            display:
                                                                "flex",
                                                            alignItems:
                                                                "center",
                                                            gap:
                                                                "1rem"
                                                        }}
                                                    >

                                                        {review.verifiedPurchase && (

                                                            <span className="badge badge-success">
                                                                Verified Purchase
                                                            </span>

                                                        )}


                                                        <button
                                                            type="button"

                                                            style={{
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap:
                                                                    "0.3rem",
                                                                background:
                                                                    "transparent",
                                                                border:
                                                                    "none",
                                                                color:
                                                                    "var(--text-secondary)",
                                                                cursor:
                                                                    "pointer"
                                                            }}
                                                        >

                                                            <ThumbsUp
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            Helpful

                                                        </button>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* =================================================
                            MODAL BUTTONS
                        ================================================= */}

                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "1rem",
                                justifyContent:
                                    "flex-end",
                                marginTop:
                                    "2rem"
                            }}
                        >

                            <button
                                className="btn btn-secondary"

                                onClick={
                                    closeProductDetails
                                }
                            >
                                Close
                            </button>


                            <button
                                className="btn btn-primary"

                                onClick={() => {

                                    addToCart(
                                        selectedProduct
                                    );

                                    closeProductDetails();
                                }}
                            >

                                <ShoppingCart
                                    size={16}
                                />

                                Add to Cart

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default Shop;