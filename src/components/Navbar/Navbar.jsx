import { Link } from 'react-router-dom';
import style from './Navbar.module.css';
import { useState, useEffect } from 'react';

function Navbar() {
    const [authenticated, setAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(false);


    return (
        <nav className={style.navbar}>
            <div className={style.navBrand}>
                <h2>🎯 Darts Score</h2>
            </div>
            <ul className={style.navLinks}>
                <li><Link to="/">Home</Link></li>
                {authenticated && <li><Link to="/gameMenu">Game</Link></li>}
                {authenticated && <li><Link to="/profile">Profile</Link></li>}
                {authenticated && admin && <li><Link to="/admin">Admin</Link></li>}
                {authenticated ? (
                    <li><button onClick={handleLogout} className={style.logoutBtn}>Logout</button></li>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;