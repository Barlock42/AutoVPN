import "./App.css";
import SignupForm from "./pages/SignupForm.tsx";
import SignResultForm from "./pages/SignResultForm";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import BrowserRouter, Routes, and Route

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Router>
          <Routes>
            <Route path="/" element={<SignupForm />} />
            <Route path="/result" element={<SignResultForm />} />
          </Routes>
        </Router>
      </header>
    </div>
  );
};

export default App;
