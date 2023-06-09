import React, { useState } from "react";
import "../styles/SignupForm.css";
import { User } from "../types";

function SignupForm() {
  const [formData, setFormData] = useState<User>({
    email: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:4000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const result = await response.json();
    // console.log(result.message);
    // After submitting the form, redirect to the result page
    window.location.href = `/result?variable=${JSON.stringify(result.message)}`;
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default SignupForm;
