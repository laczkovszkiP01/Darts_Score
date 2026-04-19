import { Link } from 'react-router-dom';
import { isAuthenticated, isAdmin, removeToken } from '../../api/apiClient';
import style from './Navbar.module.css';
import { useState, useEffect } from 'react';

function Navbar() {
    const [authenticated, setAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        setAuthenticated(isAuthenticated());
        setAdmin(isAdmin());
    }, []);

    const handleLogout = () => {
        removeToken();
        setAuthenticated(false);
        setAdmin(false);
        window.location.href = '/';
    };

    return (
        <nav className={style.navbar}>
            <div className={style.navBrand}>
                <h2>🎯 Darts Score</h2>
            </div>
            <ul className={style.navLinks}>
                <li><Link to="/">Kezdőlap</Link></li>
                <li><Link to="/gameMenu">Játék</Link></li>
                {authenticated && <li><Link to="/profile">Profil</Link></li>}
                {authenticated && admin && <li><Link to="/admin">Admin</Link></li>}
                {authenticated ? (
                    <li><button onClick={handleLogout} className={style.logoutBtn}>Kijelentkezés</button></li>
                ) : (
                    <>
                        <li><Link to="/login">Bejelentkezés</Link></li>
                        <li><Link to="/register">Regisztráció</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;