import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { loginUser, setToken, setCurrentUser } from '../../api/apiClient';
import style from './Login.module.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(email, password);
      

      if (response?.token) {
        setToken(response.token);
        setCurrentUser(response.user);
        alert('✅ Sikeres bejelentkezés!');
        navigate('/');
      } else {
        setError(response.message || 'Bejelentkezési hiba');
      }
    } catch (err) {
      setError('Hiba a kapcsolódás során. Kérlek próbáld újra!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className={style.loginContainer}>
        <div className={style.loginBox}>
          <h1>Bejelentkezés</h1>
          
          {error && <div className={style.error}>{error}</div>}
          
          <form onSubmit={handleLogin} className={style.loginForm}>
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

            <button 
              type="submit" 
              className={style.submitBtn}
              disabled={loading}
            >
              {loading ? 'Betöltés...' : 'Bejelentkezés'}
            </button>
          </form>

          <div className={style.link}>
            Még nincs fiókod? <Link to="/register">Regisztráció</Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;