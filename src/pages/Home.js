import WeatherBox from "../components/WeatherBox";
import RecommendationForm from "../components/RecommendationForm";

import { motion } from "framer-motion";

import { useEffect, useState } from "react";

import axios from "axios";

import {
  FaHeart,
  FaShoppingCart,
  FaStar
} from "react-icons/fa";

import {
  useNavigate
} from "react-router-dom";

export default function Home() {

  const navigate = useNavigate();

  // ================= STATES =================

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const [wishlist, setWishlist] = useState(
    JSON.parse(localStorage.getItem("wishlist")) || []
  );

  const [showCart, setShowCart] = useState(false);

  const [recommended, setRecommended] = useState([]);

  const [weatherData, setWeatherData] = useState(null);

  // ================= FETCH PRODUCTS =================

  useEffect(() => {

    axios
      .get("http://127.0.0.1:8000/products")
      .then((res) => {

        console.log(res.data);

        setProducts(res.data);

      })
      .catch((err) => {

        console.log(err);

      });

  }, []);

  // ================= SAVE CART =================

  useEffect(() => {

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

  }, [cart]);

  // ================= SAVE WISHLIST =================

  useEffect(() => {

    localStorage.setItem(
      "wishlist",
      JSON.stringify(wishlist)
    );

  }, [wishlist]);

  // ================= ADD TO CART =================

  const addToCart = (product) => {

    if (!product) return;

    const exists = cart.find(
      (item) =>
        item?.product_id === product?.product_id
    );

    if (exists) {

      alert("Already in cart");

      return;
    }

    setCart([...cart, product]);

    alert("Added to cart");
  };

  // ================= REMOVE CART =================

  const removeCart = (id) => {

    const updated = cart.filter(
      (item) =>
        item?.product_id !== id
    );

    setCart(updated);
  };

  // ================= TOGGLE WISHLIST =================

  const toggleWishlist = (product) => {

    if (!product) return;

    const exists = wishlist.find(
      (item) =>
        item?.product_id === product?.product_id
    );

    if (exists) {

      const updated = wishlist.filter(
        (item) =>
          item?.product_id !== product?.product_id
      );

      setWishlist(updated);

    } else {

      setWishlist([...wishlist, product]);

    }
  };

  // ================= PAYMENT =================

  const handlePayment = async () => {

    const total = cart.reduce(
      (sum, item) =>
        sum + Number(item?.final_price || 0),
      0
    );

    if (total <= 0) {

      alert("Cart is empty");

      return;
    }

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/create-order",
        {
          amount: total
        }
      );

      const data = res.data;

      const options = {

        key: data.key,

        amount: data.amount,

        currency: "INR",

        name: "ClosetIQ",

        description: "Fashion Purchase",

        order_id: data.order_id,

        handler: async function (response) {

          const verify = await axios.post(
            "http://127.0.0.1:8000/verify-payment",
            {
              order_id:
                response.razorpay_order_id,

              payment_id:
                response.razorpay_payment_id,

              signature:
                response.razorpay_signature
            }
          );

          if (verify.data.status === "success") {

            alert("✅ Payment Successful");

            setCart([]);

          } else {

            alert("❌ Payment Failed");

          }
        },

        theme: {
          color: "#2563eb"
        }
      };

      const razor = new window.Razorpay(options);

      razor.open();

    } catch (err) {

      console.log(err);

      alert("Payment Error");

    }
  };

  // ================= SMART RECOMMEND =================

  const handleRecommend = (data) => {

    console.log(data);

    let filteredProducts = [...products];

    // HOT WEATHER

    if (data?.weather === "Hot") {

      filteredProducts = filteredProducts.filter(
        (p) => {

          const category =
            p?.category?.toLowerCase() || "";

          return (
            category.includes("top") ||
            category.includes("tank") ||
            category.includes("crop") ||
            category.includes("tshirt") ||
            category.includes("dress")
          );
        }
      );
    }

    // COLD WEATHER

    else if (data?.weather === "Cold") {

      filteredProducts = filteredProducts.filter(
        (p) => {

          const category =
            p?.category?.toLowerCase() || "";

          return (
            category.includes("hoodie") ||
            category.includes("jacket") ||
            category.includes("sweater")
          );
        }
      );
    }

    // PARTY MOOD

    if (data?.mood === "Party") {

      filteredProducts = filteredProducts.filter(
        (p) => {

          const style =
            p?.style?.toLowerCase() || "";

          return (
            style.includes("ethnic") ||
            style.includes("streetwear") ||
            style.includes("party")
          );
        }
      );
    }

    // GYM MOOD

    if (data?.mood === "Gym") {

      filteredProducts = filteredProducts.filter(
        (p) => {

          const style =
            p?.style?.toLowerCase() || "";

          return (
            style.includes("sportswear") ||
            style.includes("sports")
          );
        }
      );
    }

    // FALLBACK

    if (filteredProducts.length === 0) {

      filteredProducts = products.slice(0, 8);

    }

    setRecommended(filteredProducts);
  };

  // ================= AI OUTFIT GENERATOR =================

  const generateOutfit = () => {

    if (products.length === 0) {

      alert("Products not loaded yet");

      return;
    }

    // TOPS

    const tops = products.filter((p) => {

      const category =
        p?.category?.toLowerCase() || "";

      return (
        category.includes("top") ||
        category.includes("tank") ||
        category.includes("shirt") ||
        category.includes("tshirt") ||
        category.includes("hoodie") ||
        category.includes("jacket") ||
        category.includes("dress")
      );
    });

    // BOTTOMS

    const bottoms = products.filter((p) => {

      const category =
        p?.category?.toLowerCase() || "";

      return (
        category.includes("jeans") ||
        category.includes("pants") ||
        category.includes("cargo") ||
        category.includes("shorts") ||
        category.includes("skirt")
      );
    });

    // RANDOM TOP

    const randomTop =
      tops[
        Math.floor(
          Math.random() * tops.length
        )
      ];

    // RANDOM BOTTOM

    const randomBottom =
      bottoms[
        Math.floor(
          Math.random() * bottoms.length
        )
      ];

    // FINAL OUTFIT

    const finalOutfit = [
      randomTop,
      randomBottom
    ].filter(Boolean);

    console.log(finalOutfit);

    // FALLBACK

    if (finalOutfit.length === 0) {

      setRecommended(products.slice(0, 6));

      return;
    }

    setRecommended(finalOutfit);
  };

  // ================= WEATHER RECOMMEND =================

  const handleWeather = (weather) => {

    setWeatherData(weather);

    const temp = weather?.main?.temp;

    let weatherProducts = [...products];

    // HOT

    if (temp >= 30) {

      weatherProducts = weatherProducts.filter(
        (p) => {

          const category =
            p?.category?.toLowerCase() || "";

          return (
            category.includes("top") ||
            category.includes("tank") ||
            category.includes("dress") ||
            category.includes("crop")
          );
        }
      );
    }

    // COLD

    else if (temp <= 20) {

      weatherProducts = weatherProducts.filter(
        (p) => {

          const category =
            p?.category?.toLowerCase() || "";

          return (
            category.includes("hoodie") ||
            category.includes("jacket")
          );
        }
      );
    }

    // NORMAL

    else {

      weatherProducts = weatherProducts.slice(0, 10);

    }

    if (weatherProducts.length === 0) {

      weatherProducts = products.slice(0, 8);

    }

    setRecommended(weatherProducts);
  };

  // ================= SEARCH FILTER =================

  const filtered = products.filter((item) =>

    item?.category
      ?.toLowerCase()
      .includes(search.toLowerCase())

  );

  // ================= UI =================

  return (

    <div>

      {/* NAVBAR */}

      <div className="navbar">

        <div className="logo">
          🛍 ClosetIQ
        </div>

        <div className="nav-icons">

          <FaHeart />

          <div
            style={{
              position: "relative"
            }}
          >

            <FaShoppingCart
              style={{
                cursor: "pointer"
              }}
              onClick={() =>
                setShowCart(!showCart)
              }
            />

            <span
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 7px",
                fontSize: "12px"
              }}
            >
              {cart.length}
            </span>

          </div>

        </div>

      </div>

      {/* MAIN */}

      <div style={{ padding: "30px" }}>

        {/* SEARCH */}

        <input
          className="search-bar"
          placeholder="Search fashion..."
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* WEATHER */}

        {
          weatherData && (

            <h3
              style={{
                color: "white",
                marginTop: "20px"
              }}
            >
              🌡 Current Temp:
              {weatherData?.main?.temp}°C
            </h3>

          )
        }

        <WeatherBox
          onWeather={handleWeather}
        />

        {/* RECOMMEND FORM */}

        <RecommendationForm
          onRecommend={handleRecommend}
        />

        {/* AI BUTTON */}

        <button
          className="ai-btn"
          onClick={generateOutfit}
          style={{
            marginTop: "20px",
            marginBottom: "20px"
          }}
        >
          🧠 Generate AI Outfit
        </button>

        {/* PRODUCTS */}

        <div className="products-grid">

          {(recommended.length > 0
            ? recommended
            : filtered
          )
            .filter(Boolean)
            .map((item, index) => (

              <motion.div
                className="product-card"

                key={index}

                whileHover={{
                  scale: 1.05
                }}

                initial={{
                  opacity: 0,
                  y: 30
                }}

                animate={{
                  opacity: 1,
                  y: 0
                }}

                transition={{
                  duration: 0.4
                }}

                onClick={() =>
                  navigate("/product", {
                    state: item
                  })
                }
              >

                {/* BADGE */}

                <div className="badge">
                  SALE
                </div>

                {/* HEART */}

                <div
                  className="heart"
                  onClick={(e) => {

                    e.stopPropagation();

                    toggleWishlist(item);

                  }}
                >

                  {
                    wishlist.find(
                      (w) =>
                        w?.product_id === item?.product_id
                    )
                      ? "❤️"
                      : "🤍"
                  }

                </div>

                {/* IMAGE */}

                <img
                  className="product-image"
                  src={
                    item?.image_url ||
                    "https://via.placeholder.com/300"
                  }
                  alt=""
                />

                {/* INFO */}

                <div className="product-info">

                  <div className="product-title">
                    {item?.category}
                  </div>

                  <div className="price">
                    ₹{item?.final_price}
                  </div>

                  <div
                    style={{
                      marginBottom: "10px"
                    }}
                  >
                    {item?.brand}
                  </div>

                  <div className="rating">

                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />

                    <span
                      style={{
                        marginLeft: "8px"
                      }}
                    >
                      ({item?.rating || 4.5})
                    </span>

                  </div>

                  <button
                    className="btn cart-btn"
                    onClick={(e) => {

                      e.stopPropagation();

                      addToCart(item);

                    }}
                  >
                    Add To Cart
                  </button>

                </div>

              </motion.div>

            ))}

        </div>

      </div>

      {/* CART DRAWER */}

      {showCart && (

        <div className="cart-drawer">

          <h2>🛒 Cart</h2>

          {
            cart.length === 0 &&
            <p>Cart is empty</p>
          }

          {cart.map((item, index) => (

            <div
              className="cart-item"
              key={index}
            >

              <div>
                {item?.category}
              </div>

              <div>
                ₹{item?.final_price}
              </div>

              <button
                onClick={() =>
                  removeCart(item?.product_id)
                }
              >
                ❌
              </button>

            </div>

          ))}

          <button
            className="btn checkout-btn"
            onClick={handlePayment}
          >
            Checkout
          </button>

        </div>

      )}

    </div>

  );
}