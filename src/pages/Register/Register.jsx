import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import style from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  return (
    <>
      <Navbar />
      <main className={style.registerContainer}>
        <div className={style.registerBox}>
          <h1>Regisztráció</h1>
          
          {error && <div className={style.error}>{error}</div>}
          
          <form onSubmit={handleRegister} className={style.registerForm}>
            <div className={style.formGroup}>
              <label htmlFor="username">Felhasználónév:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="felhasználóneved"
                required
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="password">Jelszó:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="**********"
                required
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="confirmPassword">Jelszó megerősítés:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="**********"
                required
              />
            </div>

            <button 
              type="submit" 
              className={style.submitBtn}
              disabled={loading}
            >
              {loading ? 'Betöltés...' : 'Regisztráció'}
            </button>
          </form>

          <div className={style.link}>
            Már van fiókod? <Link to="/login">Bejelentkezés</Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Register;