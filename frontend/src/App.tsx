import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BlogPage from "./pages/BlogPage";

function App() {
    return (
        <Router>
            <Header />

            <Routes>
                <Route path="/" element={<BlogPage />} />
                <Route path="/login" element={<div>Login</div>} />
                <Route path="/register" element={<div>Register</div>} />
            </Routes>
        </Router>
    );
}

export default App;