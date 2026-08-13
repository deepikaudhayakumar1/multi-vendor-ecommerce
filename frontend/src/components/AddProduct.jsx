import React, { useEffect, useState } from "react";
import axios from "axios";

const AddProduct = ({ onClose, onSuccess }) => {

    // ------------------------------------
    // Product form state
    // ------------------------------------

    const [formData, setFormData] = useState({
        name: "",
        category: "Electronics",
        description: "",
        mrp: "",
        sellingPrice: "",
        stock: "",
        gstRate: "18"
    });


    // ------------------------------------
    // Uploaded files
    // ------------------------------------

    const [files, setFiles] = useState([]);


    // ------------------------------------
    // Image previews
    // ------------------------------------

    const [previews, setPreviews] = useState([]);


    // ------------------------------------
    // Loading / error / success
    // ------------------------------------

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // ------------------------------------
    // Handle text fields
    // ------------------------------------

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ------------------------------------
    // Handle image selection
    // ------------------------------------

    const handleImageChange = (e) => {

        const selectedFiles =
            Array.from(e.target.files || []);


        setError("");


        if (selectedFiles.length === 0) {
            return;
        }


        // Maximum 8 images
        if (selectedFiles.length > 8) {

            setError(
                "You can upload a maximum of 8 images."
            );

            return;
        }


        // Validate every file
        for (const file of selectedFiles) {

            if (!file.type.startsWith("image/")) {

                setError(
                    "Only image files are allowed."
                );

                return;
            }


            // 10 MB
            if (file.size > 10 * 1024 * 1024) {

                setError(
                    `${file.name} is larger than 10MB.`
                );

                return;
            }
        }


        setFiles(selectedFiles);


        // Create browser previews
        const previewUrls =
            selectedFiles.map((file) =>
                URL.createObjectURL(file)
            );


        setPreviews(previewUrls);
    };


    // ------------------------------------
    // Clean preview URLs
    // ------------------------------------

    useEffect(() => {

        return () => {

            previews.forEach((url) => {
                URL.revokeObjectURL(url);
            });

        };

    }, [previews]);


    // ------------------------------------
    // Submit product
    // ------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSuccess("");


        // -----------------------------
        // Basic validation
        // -----------------------------

        if (!formData.name.trim()) {

            setError("Product name is required.");

            return;
        }


        if (!formData.description.trim()) {

            setError("Product description is required.");

            return;
        }


        if (
            !formData.mrp ||
            Number(formData.mrp) <= 0
        ) {

            setError(
                "MRP must be greater than zero."
            );

            return;
        }


        if (
            !formData.sellingPrice ||
            Number(formData.sellingPrice) <= 0
        ) {

            setError(
                "Selling price must be greater than zero."
            );

            return;
        }


        if (
            Number(formData.sellingPrice) >
            Number(formData.mrp)
        ) {

            setError(
                "Selling price cannot exceed MRP."
            );

            return;
        }


        if (
            formData.stock === "" ||
            Number(formData.stock) < 0
        ) {

            setError(
                "Stock cannot be negative."
            );

            return;
        }


        // SRS minimum 4 images
        if (files.length < 4) {

            setError(
                "Please upload at least 4 product images."
            );

            return;
        }


        try {

            setLoading(true);


            // ------------------------------------
            // Create FormData
            // ------------------------------------

            const multipartData = new FormData();


            // Product JSON
            const productData = {
                name: formData.name,
                category: formData.category,
                description: formData.description,
                mrp: Number(formData.mrp),
                sellingPrice: Number(
                    formData.sellingPrice
                ),
                stock: Number(formData.stock),
                gstRate: Number(formData.gstRate)
            };


            multipartData.append(
                "product",
                new Blob(
                    [
                        JSON.stringify(productData)
                    ],
                    {
                        type: "application/json"
                    }
                )
            );


            // ------------------------------------
            // Add multiple images
            // ------------------------------------

            files.forEach((file) => {

                multipartData.append(
                    "images",
                    file
                );

            });


            // ------------------------------------
            // Get JWT token
            // ------------------------------------

            const token =
                localStorage.getItem("token");


            // ------------------------------------
            // POST request
            // ------------------------------------

            const response =
                await axios.post(
                    "http://localhost:8080/api/vendor/products",
                    multipartData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            console.log(
                "PRODUCT CREATED:",
                response.data
            );


            setSuccess(
                "Product submitted successfully for review!"
            );


            // Reset form

            setFormData({
                name: "",
                category: "Electronics",
                description: "",
                mrp: "",
                sellingPrice: "",
                stock: "",
                gstRate: "18"
            });


            setFiles([]);

            setPreviews([]);


            if (onSuccess) {
                onSuccess(response.data);
            }


        } catch (err) {

            console.error(
                "PRODUCT UPLOAD ERROR:",
                err
            );


            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Failed to create product. Please try again."
                );
            }


        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="add-product-overlay">

            <div className="add-product-modal">

                <form
                    onSubmit={handleSubmit}
                >

                    <h2>
                        Add Product Listing
                    </h2>


                    {/* =================================
                        Product Name
                    ================================= */}

                    <div className="form-group">

                        <label>
                            Product Name / Title
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Wireless Ergonomic Mouse"
                            required
                        />

                    </div>


                    {/* =================================
                        Category
                    ================================= */}

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >

                            <option value="Electronics">
                                Electronics (GST 18%)
                            </option>

                            <option value="Fashion">
                                Fashion (GST 12%)
                            </option>

                            <option value="Home">
                                Home & Kitchen (GST 18%)
                            </option>

                            <option value="Beauty">
                                Beauty (GST 18%)
                            </option>

                            <option value="Books">
                                Books (GST 5%)
                            </option>

                        </select>

                    </div>


                    {/* =================================
                        Description
                    ================================= */}

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


                    {/* =================================
                        MRP + Selling Price
                    ================================= */}

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
                                placeholder="1999.00"
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Selling Base Price (≤ MRP)
                            </label>

                            <input
                                type="number"
                                name="sellingPrice"
                                value={
                                    formData.sellingPrice
                                }
                                onChange={handleChange}
                                placeholder="1499.00"
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>

                    </div>


                    {/* =================================
                        Stock
                    ================================= */}

                    <div className="form-group">

                        <label>
                            Initial Stock Quantity (≥ 0)
                        </label>

                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="50"
                            min="0"
                            required
                        />

                    </div>


                    {/* =================================
                        IMAGE UPLOAD
                    ================================= */}

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
                            onChange={
                                handleImageChange
                            }
                        />


                        {/* =================================
                            Image Preview
                        ================================= */}

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
                                                alt={
                                                    `Preview ${index + 1}`
                                                }
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


                    {/* =================================
                        Error
                    ================================= */}

                    {error && (

                        <div className="form-error">
                            {error}
                        </div>

                    )}


                    {/* =================================
                        Success
                    ================================= */}

                    {success && (

                        <div className="form-success">
                            {success}
                        </div>

                    )}


                    {/* =================================
                        Buttons
                    ================================= */}

                    <div className="form-actions">

                        <button
                            type="button"
                            onClick={onClose}
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
                                : "Submit Listing for Review"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default AddProduct;