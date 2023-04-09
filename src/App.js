import "./App.css";
import SignupForm from "./pages/SignupForm.tsx";
import SignResultForm from "./pages/SignResultForm.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Import BrowserRouter, Routes, and Route

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SignupForm />} />
            <Route path="/result" element={<SignResultForm />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
};

export default App;
