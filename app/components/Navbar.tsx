import { Link } from "react-router"

const Navbar: () => Element = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-semibold text-gradient">RESUNODE</p>
            </Link>
            <Link to="/upload">
                <p className="primary-button w-fit">Upload resume</p>
            </Link>
        </nav>
    )
}

export default Navbar