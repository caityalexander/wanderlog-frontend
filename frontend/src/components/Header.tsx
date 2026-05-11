import { Link } from "react-router-dom";


function Header() {
    return (
        <header className="header">
            <h2 className="header-title">WanderLog</h2>

            <nav className="header-nav">
                <Link to="/" className="header-link">
                    Home
                </Link>

                <Link to="/login" className="header-link">
                    Login
                </Link>

                <Link to="/register" className="header-link">
                    Register
                </Link>
            </nav>
        </header>
    );
}

export default Header;