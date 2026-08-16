import React, { useEffect, useState, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const Shop = () => {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [cartSuccess, setCartSuccess] = useState('');

  // =====================================================
  // BACKEND IMAGE URL
  // =====================================================

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

  // =====================================================
  // GET PRODUCT IMAGES
  // =====================================================

  const getProductImages = (product) => {
    // If backend gives imageUrls array
    if (
      Array.isArray(product.imageUrls) &&
      product.imageUrls.length > 0
    ) {
      return product.imageUrls;
    }

    // Fallback to single imageUrl
    if (product.imageUrl) {
      return [product.imageUrl];
    }

    return [];
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    API.get('/products?status=ACTIVE')
      .then((res) => {
        console.log('PRODUCTS FROM BACKEND:', res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Error loading products:', err);
      });

    API.get('/categories')
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error('Error loading categories:', err);
      });
  }, []);

  // =====================================================
  // FILTER PRODUCTS
  // =====================================================

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.categoryId === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (product) => {
    let cart = JSON.parse(
      localStorage.getItem('cart') || '[]'
    );

    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id
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

        // Save main image
        imageUrl: getImageUrl(product.imageUrl),

        // Save all images
        imageUrls: getProductImages(product).map(
          (img) => getImageUrl(img)
        ),
      });
    }

    localStorage.setItem(
      'cart',
      JSON.stringify(cart)
    );

    setCartSuccess(
      `Added "${product.name}" to your shopping cart!`
    );

    setTimeout(() => {
      setCartSuccess('');
    }, 3000);
  };

  // =====================================================
  // OPEN PRODUCT DETAILS
  // =====================================================

  const openProductDetails = (product) => {
    setSelectedProduct(product);

    const images = getProductImages(product);

    if (images.length > 0) {
      setSelectedImage(
        getImageUrl(images[0])
      );
    } else {
      setSelectedImage(
        'https://picsum.photos/400/300'
      );
    }
  };

  // =====================================================
  // CLOSE PRODUCT DETAILS
  // =====================================================

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setSelectedImage('');
  };

  return (
    <div>

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >

        <div>

          <h1 style={{ fontSize: '2rem' }}>
            Marketplace Catalogue
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)'
            }}
          >
            Browse GST-compliant products from
            verified marketplace vendors
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
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >

        <div
          style={{
            flex: 1,
            minWidth: '250px',
            position: 'relative'
          }}
        >

          <input
            type="text"
            className="form-input"
            placeholder="Search products by title, description..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div style={{ width: '200px' }}>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value)
            }
          >

            <option value="ALL">
              All Categories
            </option>

            {categories.map((c) => (

              <option
                key={c.id}
                value={c.id}
              >
                {c.name} (GST {c.gstRate}%)
              </option>

            ))}

          </select>

        </div>

      </div>

      {/* =================================================
          PRODUCTS GRID
      ================================================= */}

      <div className="grid-3">

        {filteredProducts.map((product) => {

          const productImages =
            getProductImages(product);

          const mainImage =
            productImages.length > 0
              ? getImageUrl(productImages[0])
              : 'https://picsum.photos/400/300';

          return (

            <div
              key={product.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >

              <div>

                {/* =========================================
                    MAIN PRODUCT IMAGE
                ========================================== */}

                <div
                  style={{
                    height: '180px',
                    borderRadius:
                      'var(--radius-sm)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: '#000'
                  }}
                >

                  <img
                    src={mainImage}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://picsum.photos/400/300';
                    }}
                  />

                </div>

                {/* =========================================
                    BADGE
                ========================================== */}

                <span
                  className="badge badge-info"
                  style={{
                    marginBottom: '0.5rem'
                  }}
                >
                  Verified Vendor Product
                </span>

                {/* =========================================
                    PRODUCT NAME
                ========================================== */}

                <h3
                  style={{
                    fontSize: '1.15rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  {product.name}
                </h3>

                {/* =========================================
                    DESCRIPTION
                ========================================== */}

                <p
                  style={{
                    color:
                      'var(--text-secondary)',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    height: '40px',
                    overflow: 'hidden'
                  }}
                >
                  {product.description}
                </p>

              </div>

              {/* ===========================================
                  PRICE + STOCK
              ============================================ */}

              <div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'baseline',
                    marginBottom: '1rem'
                  }}
                >

                  <div>

                    <span
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color:
                          'var(--accent-light)'
                      }}
                    >
                      ₹{product.basePrice}
                    </span>

                    <span
                      style={{
                        textDecoration:
                          'line-through',
                        color:
                          'var(--text-muted)',
                        fontSize: '0.9rem',
                        marginLeft: '0.5rem'
                      }}
                    >
                      ₹{product.mrp}
                    </span>

                  </div>

                  <span className="badge badge-success">
                    Stock: {product.stock}
                  </span>

                </div>

                {/* =========================================
                    BUTTONS
                ========================================== */}

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem'
                  }}
                >

                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() =>
                      openProductDetails(product)
                    }
                  >
                    View Details
                  </button>

                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>

                </div>

              </div>

            </div>

          );
        })}

      </div>

      {/* =================================================
          PRODUCT DETAIL MODAL
      ================================================= */}

      {selectedProduct && (

        <div
          className="modal-overlay"
          onClick={closeProductDetails}
        >

          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2
              style={{
                marginBottom: '1rem'
              }}
            >
              {selectedProduct.name}
            </h2>

            {/* =========================================
                LARGE SELECTED IMAGE
            ========================================== */}

            <img
              src={selectedImage}
              alt={selectedProduct.name}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'contain',
                background: '#000',
                borderRadius:
                  'var(--radius-md)',
                marginBottom: '1rem'
              }}
              onError={(e) => {
                e.currentTarget.src =
                  'https://picsum.photos/400/300';
              }}
            />

            {/* =========================================
                4 IMAGE THUMBNAILS
            ========================================== */}

            {getProductImages(selectedProduct)
              .length > 0 && (

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  paddingBottom: '5px'
                }}
              >

                {getProductImages(
                  selectedProduct
                ).map((image, index) => {

                  const imageUrl =
                    getImageUrl(image);

                  const isSelected =
                    selectedImage === imageUrl;

                  return (

                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          imageUrl
                        )
                      }
                      style={{
                        width: '75px',
                        height: '75px',
                        padding: '0',
                        borderRadius:
                          '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',

                        border: isSelected
                          ? '3px solid var(--accent-light)'
                          : '2px solid rgba(255,255,255,0.2)',

                        background: '#000',
                        flexShrink: 0
                      }}
                    >

                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://picsum.photos/100/100';
                        }}
                      />

                    </button>

                  );

                })}

              </div>

            )}

            {/* =========================================
                DESCRIPTION
            ========================================== */}

            <p
              style={{
                color:
                  'var(--text-secondary)',
                marginBottom: '1rem'
              }}
            >
              {selectedProduct.description}
            </p>

            {/* =========================================
                PRODUCT INFO
            ========================================== */}

            <div
              style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                background:
                  'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius:
                  'var(--radius-sm)'
              }}
            >

              <div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  Selling Price
                </span>

                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color:
                      'var(--accent-light)'
                  }}
                >
                  ₹{selectedProduct.basePrice}
                </p>

              </div>

              <div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  MRP
                </span>

                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textDecoration:
                      'line-through'
                  }}
                >
                  ₹{selectedProduct.mrp}
                </p>

              </div>

              <div>

                <span
                  style={{
                    fontSize: '0.8rem',
                    color:
                      'var(--text-muted)'
                  }}
                >
                  Applicable GST
                </span>

                <p
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}
                >
                  {selectedProduct.gstRate}%
                </p>

              </div>

            </div>

            {/* =========================================
                MODAL BUTTONS
            ========================================== */}

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent:
                  'flex-end'
              }}
            >

              <button
                className="btn btn-secondary"
                onClick={closeProductDetails}
              >
                Close
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  addToCart(selectedProduct);
                  closeProductDetails();
                }}
              >
                <ShoppingCart size={16} />
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



