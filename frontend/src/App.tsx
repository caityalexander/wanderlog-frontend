import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogPage from "./pages/BlogPage";
import SingleBlogPage from "./pages/SingleBlogPage"
import RegisterPage from "./pages/RegisterPage.tsx"
import LoginPage from "./pages/LoginPage"
import AddBlogPage from "./pages/AddBlogPage"
import Header from "@/components/Header.tsx";
import EditBlogPage from "@/pages/EditBlogPage.tsx";
import MyBlogsPage from "@/pages/MyBlogsPage.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";
import EditProfilePage from "@/pages/EditProfilePage.tsx";


function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<BlogPage />} />
                <Route path="/blog" element={<SingleBlogPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create" element={<AddBlogPage />}/>
                <Route path="/edit/:id" element={<EditBlogPage />} />
                <Route path="/me" element={<MyBlogsPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/profile-edit/:id" element={<EditProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;