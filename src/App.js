import "./App.css";
import SignupForm from "./pages/SignupForm.tsx";
import SignResultForm from "./pages/SignResultForm.tsx";

import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import BrowserRouter, Routes, and Route
import React from "react";

// redux
import { updateVariable } from "./redux/actions";
import { useDispatch } from "react-redux";

const App = () => {
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/", {
      method: "POST",
      body: new FormData(event.target),
    });
    const data = await response.json();
    dispatch(updateVariable(data.variable));
    window.location.href = "/result";
  };

  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignupForm onSubmit={handleSubmit} />} />
            <Route
              path="/result"
              element={<SignResultForm onSubmit={handleSubmit} />}
            />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
};

export default App;
