import { useState } from "react";

export default function RecommendationForm({ onRecommend }) {

  const [form, setForm] = useState({
    mood: "",
    occasion: "",
    weather: "",
    gender: ""
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  return (

    <div className="recommend-box">

      <h2>✨ Smart Outfit Recommendation</h2>

      <select
        name="mood"
        onChange={handleChange}
      >
        <option value="">Select Mood</option>
        <option>Happy</option>
        <option>Casual</option>
        <option>Party</option>
        <option>Gym</option>
        <option>Romantic</option>
      </select>

      <select
        name="occasion"
        onChange={handleChange}
      >
        <option value="">Occasion</option>
        <option>College</option>
        <option>Office</option>
        <option>Wedding</option>
        <option>Travel</option>
      </select>

      <select
        name="weather"
        onChange={handleChange}
      >
        <option value="">Weather</option>
        <option>Hot</option>
        <option>Cold</option>
        <option>Rainy</option>
      </select>

      <select
        name="gender"
        onChange={handleChange}
      >
        <option value="">Gender</option>
        <option>Men</option>
        <option>Women</option>
      </select>

      <button
        className="btn"
        onClick={() => onRecommend(form)}
      >
        Recommend Outfit
      </button>

    </div>

  );
}