import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import {
  deleteAdminMatch,
  deleteAdminUser,
  getAdminMatches,
  getAdminUsers,
  getToken,
  isAdmin,
  isAuthenticated
} from '../../api/apiClient';
import style from './Admin.module.css';

function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ujratolti a felhasznalo- es meccslistat.
  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const [usersData, matchesData] = await Promise.all([
        getAdminUsers(token),
        getAdminMatches(token)
      ]);

      if (usersData.message) {
        setError(usersData.message);
      } else {
        setUsers(usersData);
      }

      if (matchesData.message) {
        setError(matchesData.message);
      } else {
        setMatches(matchesData);
      }
    } catch (err) {
      setError('Hiba az admin adatok betöltésekor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Vedett oldal: csak bejelentkezett admin latja.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      navigate('/');
      return;
    }

    loadData();
  }, [navigate]);

  // Felhasznalo torlese megerosites utan.
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Biztosan törölni szeretnéd ezt a felhasználót: ${username}?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await deleteAdminUser(token, userId);

      if (response.message && response.message !== 'Felhasználó és mérkőzései törölve') {
        alert(`❌ ${response.message}`);
        return;
      }

      await loadData();
      alert('✅ Felhasználó törölve');
    } catch (err) {
      alert('❌ Hiba a felhasználó törlésekor');
      console.error(err);
    }
  };

  // Meccs torlese megerosites utan.
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) #${matchId} meccset?`)) {
      return;
    }

    try {
      const token = getToken();
      const response = await deleteAdminMatch(token, matchId);

      if (response.message && response.message !== 'Mérkőzés törölve') {
        alert(`❌ ${response.message}`);
        return;
      }

      await loadData();
      alert('✅ Mérkőzés törölve');
    } catch (err) {
      alert('❌ Hiba a mérkőzés törlésekor');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={style.container}>
          <div className={style.box}>
            <h2>Admin felület betöltése...</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={style.container}>
        <div className={style.box}>
          <h1>Admin Felület</h1>
          <p className={style.subtitle}>Felhasználók és mérkőzések kezelése</p>

          {error && <div className={style.error}>{error}</div>}

          {/* Felhasznalok kezelese */}
          <section className={style.section}>
            <h2>Regisztrált felhasználók ({users.length})</h2>
            {users.length === 0 ? (
              <p>Nincs felhasználó.</p>
            ) : (
              <div className={style.list}>
                {users.map((user) => (
                  <div key={user.id} className={style.row}>
                    <div>
                      <strong>{user.username}</strong> ({user.email})
                      <span className={style.role}>[{user.role}]</span>
                    </div>
                    <button
                      className={style.deleteBtn}
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      disabled={user.role === 'admin'}
                      title={user.role === 'admin' ? 'Admin felhasználó nem törölhető' : ''}
                    >
                      Törlés
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mentett meccsek kezelese */}
          <section className={style.section}>
            <h2>Mentett mérkőzések ({matches.length})</h2>
            {matches.length === 0 ? (
              <p>Nincs mentett mérkőzés.</p>
            ) : (
              <div className={style.list}>
                {matches.map((match) => (
                  <div key={match.id} className={style.row}>
                    <div>
                      <strong>#{match.id}</strong> - {match.game_mode} / {match.out_mode}
                      <span className={style.meta}>
                        Létrehozta: {match.creator?.username || 'Ismeretlen'}
                      </span>
                    </div>
                    <button
                      className={style.deleteBtn}
                      onClick={() => handleDeleteMatch(match.id)}
                    >
                      Törlés
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default Admin;
