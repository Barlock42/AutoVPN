import React, { useState } from "react";
import "./styles/SignupForm.css";
import { User } from "./types";

function SignupForm() {
  const [formData, setFormData] = useState<User>({
    name: "",
    surname: "",
    email: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("http://localhost:4001/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    console.log(data);
  };

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Имя:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </label>
      <label>
        Фамилия:
        <input
          type="text"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
        />
      </label>
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
