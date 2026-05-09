import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  FaStar,
  FaHeart,
  FaShoppingCart
} from "react-icons/fa";

export default function ProductPage() {

  const { state } = useLocation();

  const [selectedSize, setSelectedSize] = useState("");

  if (!state) {
    return <h1>No Product Found</h1>;
  }

  const sizes = ["S", "M", "L", "XL"];

  const addToCart = () => {

    if (!selectedSize) {
      alert("Please select size");
      return;
    }

    alert(
      `${state.category} (${selectedSize}) added to cart`
    );
  };

  const buyNow = () => {

    if (!selectedSize) {
      alert("Please select size");
      return;
    }

    alert(
      `Proceeding to payment for ${state.category}`
    );
  };

  return (

    <div className="product-page">

      {/* LEFT IMAGE */}

      <div className="product-left">

        <img
          src={state.image_url}
          alt=""
          className="product-page-image"
        />

      </div>

      {/* RIGHT DETAILS */}

      <div className="product-right">

        <h1 className="product-page-title">
          {state.brand} {state.category}
        </h1>

        <div className="product-style">
          {state.style}
        </div>

        <div className="product-price">
          ₹{state.final_price}
        </div>

        <div className="product-rating">

          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />

          <span>
            ({state.rating})
          </span>

        </div>

        <p className="product-description">
          Premium fashion wear with modern style.
          Perfect for casual and trendy outfits.
        </p>

        {/* SIZE */}

        <h2>Choose Size</h2>

        <div className="size-container">

          {sizes.map((size) => (

            <button
              key={size}
              className={
                selectedSize === size
                  ? "size-btn active-size"
                  : "size-btn"
              }
              onClick={() =>
                setSelectedSize(size)
              }
            >
              {size}
            </button>

          ))}

        </div>

        {/* BUTTONS */}

        <div className="product-buttons">

          <button
            className="add-cart-btn"
            onClick={addToCart}
          >
            <FaShoppingCart />
            Add To Cart
          </button>

          <button
            className="buy-btn"
            onClick={buyNow}
          >
            Buy Now
          </button>

        </div>

        {/* EXTRA */}

        <div className="extra-info">

          <div>
            ❤️ Wishlist Available
          </div>

          <div>
            🚚 Free Delivery
          </div>

          <div>
            🔥 Trending Fashion
          </div>

        </div>

      </div>

    </div>

  );
}