import { Link } from "react-router-dom";


function Header() {

    async function handleLogout() {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            await fetch(`${import.meta.env.VITE_API_URL}/users/logout`, {
                method: "POST",
                headers: {
                    "X-Authorization": token,
                },
            });
        } catch (err) {
            console.error(err);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("userId");

        window.location.href = "/";
    }
    const isLoggedIn = localStorage.getItem("token") !== null;

    return (
        <header className="header">
            <h2 className="header-title">WanderLog</h2>

            <nav className="header-nav">
                <Link to="/" className="header-link">
                    Home
                </Link>

                {!isLoggedIn && (
                    <>
                        <Link to="/login" className="header-link">Login</Link>
                        <Link to="/register" className="header-link">Register</Link>
                    </>
                )}

                {isLoggedIn && (
                    <>
                    <button onClick={handleLogout} className="header-link">
                        Logout
                    </button>
                    <Link to="/me" className="header-link">My Blogs</Link>
                    </>
                )}

            </nav>
        </header>
    );
}

export default Header;