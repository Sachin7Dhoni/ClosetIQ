import React from "react";

function ProductCard({ product }) {

  const addWishlist = () => {
    fetch(`http://127.0.0.1:8000/wishlist/user1/${product.product_id}`, {
      method: "POST"
    });
    alert("Added to wishlist ❤️");
  };

  const addCart = () => {
    fetch(`http://127.0.0.1:8000/cart/user1/${product.product_id}`, {
      method: "POST"
    });
    alert("Added to cart 🛒");
  };

  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "10px",
      textAlign: "center",
      transition: "0.3s"
    }}>
      <img src={product.image_url} alt="" width="100%" />

      <h4>{product.category}</h4>
      <p>₹{product.price} | ⭐ {product.rating}</p>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={addWishlist}>❤️</button>
        <button onClick={addCart}>🛒</button>
      </div>
    </div>
  );
}

export default ProductCard;