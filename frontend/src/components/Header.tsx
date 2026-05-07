import { Link } from "react-router-dom";

function Header() {
    return (
        <header
            style={{
                background: "#1e293b",
                color: "white",
                padding: "15px 30px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <h2 style={{ margin: 0 }}>WanderLog</h2>

            <nav style={{ display: "flex", gap: "20px" }}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                    Home
                </Link>
                <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
                    Login
                </Link>
                <Link to="/register" style={{ color: "white", textDecoration: "none" }}>
                    Register
                </Link>
            </nav>
        </header>
    );
}

export default Header;