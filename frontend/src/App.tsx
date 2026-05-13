import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogPage from "./pages/BlogPage";
import SingleBlogPage from "./pages/SingleBlogPage";
import Header from "@/components/Header.tsx";

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<BlogPage />} />
                <Route path="/blog" element={<SingleBlogPage />} />
            </Routes>
        </Router>
    );
}

export default App;