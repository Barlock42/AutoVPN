import React, { useState } from 'react';
import './styles/SignupForm.css'

import XLSX from "xlsx";

function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

    //     if (formData.name && formData.surname && formData.email) {
    //       // Do something with the form data, e.g. submit it to a server
    //       console.log("Form submitted!");
    //     } else {
    //       alert("Please fill in all fields!");
    //     }

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Send HTTP request to create new user account
    // using the formData object
    const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
    };
    console.log(formData);

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
          <button type="submit">Sign Up</button>
        </form>
      );
  };

export default SignupForm;
