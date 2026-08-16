import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const AddProduct = ({ onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);

    // =====================================================
    // PRODUCT FORM
    // =====================================================

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        description: "",
        mrp: "",
        basePrice: "",
        stock: "",
        gstRate: "18"
    });

    // =====================================================
    // IMAGES
    // =====================================================

    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    // =====================================================
    // UI STATES
    // =====================================================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    // =====================================================
    // IMAGE SELECTION
    // =====================================================

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || []);

        setError("");
        setSuccess("");

        if (selectedFiles.length === 0) {
            return;
        }

        // Minimum 4 images
        if (selectedFiles.length < 4) {
            setError("Please select at least 4 product images.");
            return;
        }

        // Maximum 8 images
        if (selectedFiles.length > 8) {
            setError("You can upload a maximum of 8 product images.");
            return;
        }

        // Validate each image
        for (const file of selectedFiles) {
            if (!file.type.startsWith("image/")) {
                setError(`Only image files are allowed: ${file.name}`);
                return;
            }

            // 10 MB maximum
            if (file.size > 10 * 1024 * 1024) {
                setError(`${file.name} is larger than 10MB.`);
                return;
            }
        }

        // Remove old preview URLs
        previews.forEach((url) => URL.revokeObjectURL(url));

        setFiles(selectedFiles);

        const previewUrls = selectedFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setPreviews(previewUrls);
    };

    // =====================================================
    // CLEAN PREVIEWS
    // =====================================================

    useEffect(() => {
        return () => {
            previews.forEach((url) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    // =====================================================
    // SUBMIT PRODUCT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // -------------------------------------------------
        // USER CHECK
        // -------------------------------------------------

        if (!user) {
            setError("User information not available. Please login again.");
            return;
        }

        // -------------------------------------------------
        // PRODUCT NAME
        // -------------------------------------------------

        if (!formData.name.trim()) {
            setError("Product name is required.");
            return;
        }

        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (!formData.categoryId) {
            setError("Please select a category.");
            return;
        }

        // -------------------------------------------------
        // DESCRIPTION
        // -------------------------------------------------

        if (!formData.description.trim()) {
            setError("Product description is required.");
            return;
        }

        // -------------------------------------------------
        // MRP
        // -------------------------------------------------

        if (
            formData.mrp === "" ||
            Number(formData.mrp) <= 0
        ) {
            setError("MRP must be greater than zero.");
            return;
        }

        // -------------------------------------------------
        // BASE PRICE / SELLING PRICE
        // -------------------------------------------------

        if (
            formData.basePrice === "" ||
            Number(formData.basePrice) <= 0
        ) {
            setError("Selling price must be greater than zero.");
            return;
        }

        if (
            Number(formData.basePrice) >
            Number(formData.mrp)
        ) {
            setError("Selling price cannot exceed MRP.");
            return;
        }

        // -------------------------------------------------
        // STOCK
        // -------------------------------------------------

        if (
            formData.stock === "" ||
            Number(formData.stock) < 0
        ) {
            setError("Stock cannot be negative.");
            return;
        }

        // -------------------------------------------------
        // IMAGES
        // -------------------------------------------------

        if (files.length < 4) {
            setError("Please upload at least 4 product images.");
            return;
        }

        if (files.length > 8) {
            setError("Maximum 8 product images are allowed.");
            return;
        }

        try {
            setLoading(true);

            // =================================================
            // CREATE MULTIPART FORM DATA
            // =================================================

            const multipartData = new FormData();

            // =================================================
            // PRODUCT JSON
            //
            // IMPORTANT:
            // Backend ProductDTO expects:
            // basePrice
            // mrp
            // categoryId
            // vendorId
            // stock
            // =================================================

            const productData = {
                vendorId: Number(user.id),

                name: formData.name.trim(),

                categoryId: Number(formData.categoryId),

                description: formData.description.trim(),

                basePrice: Number(formData.basePrice),

                mrp: Number(formData.mrp),

                stock: Number(formData.stock),

                gstRate: Number(formData.gstRate)
            };

            // =================================================
            // ADD PRODUCT JSON
            // =================================================

            multipartData.append(
                "product",
                JSON.stringify(productData)
            );

            // =================================================
            // ADD IMAGES
            //
            // Backend:
            // @RequestPart("images")
            // MultipartFile[] images
            // =================================================

            files.forEach((file) => {
                multipartData.append("images", file);
            });

            // =================================================
            // API REQUEST
            // =================================================

            const response = await API.post(
                "/vendor/products",
                multipartData
            );

            console.log(
                "PRODUCT CREATED SUCCESSFULLY:",
                response.data
            );

            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                "Product submitted successfully for review!"
            );

            // Reset form
            setFormData({
                name: "",
                categoryId: "",
                description: "",
                mrp: "",
                basePrice: "",
                stock: "",
                gstRate: "18"
            });

            // Remove previews
            previews.forEach((url) => {
                URL.revokeObjectURL(url);
            });

            setFiles([]);
            setPreviews([]);

            // Notify VendorManagement
            if (onSuccess) {
                onSuccess(response.data);
            }

        } catch (err) {
            console.error(
                "PRODUCT UPLOAD ERROR:",
                err
            );

            const backendMessage =
                err.response?.data?.message;

            if (backendMessage) {
                setError(backendMessage);
            } else {
                setError(
                    "Failed to create product. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const handleClose = () => {
        if (loading) {
            return;
        }

        onClose();
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="add-product-overlay">

            <div className="add-product-modal">

                <form onSubmit={handleSubmit}>

                    <h2>Add Product Listing</h2>

                    {/* =====================================
                        PRODUCT NAME
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Product Name / Title
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. HP Laptop"
                            required
                        />

                    </div>

                    {/* =====================================
                        CATEGORY
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Category
                            </option>

                            <option value="1">
                                Electronics
                            </option>

                            <option value="2">
                                Fashion
                            </option>

                            <option value="3">
                                Home & Kitchen
                            </option>

                            <option value="4">
                                Beauty
                            </option>

                            <option value="5">
                                Books
                            </option>

                        </select>

                    </div>

                    {/* =====================================
                        DESCRIPTION
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Detailed product specifications..."
                            rows="5"
                            required
                        />

                    </div>

                    {/* =====================================
                        MRP + SELLING PRICE
                    ====================================== */}

                    <div className="two-column">

                        <div className="form-group">

                            <label>
                                Maximum Retail Price (MRP)
                            </label>

                            <input
                                type="number"
                                name="mrp"
                                value={formData.mrp}
                                onChange={handleChange}
                                placeholder="60000"
                                min="0.01"
                                step="0.01"
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>
                                Selling Price
                            </label>

                            <input
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleChange}
                                placeholder="55000"
                                min="0.01"
                                step="0.01"
                                required
                            />

                        </div>

                    </div>

                    {/* =====================================
                        STOCK
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Initial Stock Quantity
                        </label>

                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="10"
                            min="0"
                            step="1"
                            required
                        />

                    </div>

                    {/* =====================================
                        GST
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            GST Rate
                        </label>

                        <input
                            type="number"
                            name="gstRate"
                            value={formData.gstRate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />

                    </div>

                    {/* =====================================
                        IMAGES
                    ====================================== */}

                    <div className="form-group">

                        <label>
                            Product Images
                        </label>

                        <p className="image-help">
                            Upload at least 4 images
                            (front, back, side, etc.).
                            Maximum 8 images.
                        </p>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {/* IMAGE PREVIEWS */}

                        {previews.length > 0 && (

                            <div className="image-preview-grid">

                                {previews.map(
                                    (preview, index) => (

                                        <div
                                            className="image-preview-item"
                                            key={preview}
                                        >

                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                            />

                                            <span>
                                                Image {index + 1}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                    {/* =====================================
                        ERROR
                    ====================================== */}

                    {error && (

                        <div className="form-error">
                            {error}
                        </div>

                    )}

                    {/* =====================================
                        SUCCESS
                    ====================================== */}

                    {success && (

                        <div className="form-success">
                            {success}
                        </div>

                    )}

                    {/* =====================================
                        BUTTONS
                    ====================================== */}

                    <div className="form-actions">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Uploading..."
                                : "Submit Listing for Review"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default AddProduct;
