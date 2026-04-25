import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { changePassword, getLeaderboardMatches, getUserMatches, getToken, removeToken, isAuthenticated } from '../../api/apiClient';
import style from './Profile.module.css';

// Kulonbozo adatformatumokbol egyseges korpontot szamolunk.
const getRoundScore = (round) => {
  if (!round) {
    return 0;
  }

  if (typeof round.round_score === 'number') {
    return Number.isFinite(round.round_score) ? round.round_score : 0;
  }

  if (Array.isArray(round)) {
    const sum = round.reduce((acc, throwItem) => acc + Number(throwItem?.total || 0), 0);
    return Number.isFinite(sum) ? sum : 0;
  }

  if (round.throws && typeof round.throws === 'object') {
    const sum = Number(round.throws.throw1 || 0) + Number(round.throws.throw2 || 0) + Number(round.throws.throw3 || 0);
    return Number.isFinite(sum) ? sum : 0;
  }

  return 0;
};

// Meccsekbol jatekosonkenti leaderboard statisztika
const buildLeaderboard = (matchList) => {
  const playerStats = new Map();

  matchList.forEach((match) => {
    if (!Array.isArray(match.players)) {
      return;
    }

    match.players.forEach((player) => {
      if (!player?.name) {
        return;
      }

      const key = player.name.trim().toLowerCase();
      const rounds = Array.isArray(player.rounds) ? player.rounds : [];
      const roundScoreTotal = rounds.reduce((sum, round) => sum + getRoundScore(round), 0);

      if (!playerStats.has(key)) {
        playerStats.set(key, {
          name: player.name.trim(),
          totalScore: 0,
          totalRounds: 0,
          matchesPlayed: 0,
          wins: 0,
        });
      }

      const entry = playerStats.get(key);
      entry.totalScore += roundScoreTotal;
      entry.totalRounds += rounds.length;
      entry.matchesPlayed += 1;
      if (player.is_winner) {
        entry.wins += 1;
      }
    });
  });

  return Array.from(playerStats.values())
    .map((entry) => ({
      ...entry,
      average: entry.totalRounds > 0 ? entry.totalScore / entry.totalRounds : 0,
      winRate: entry.matchesPlayed > 0 ? (entry.wins / entry.matchesPlayed) * 100 : 0,
    }))
    .sort((a, b) => {
      if (b.average !== a.average) {
        return b.average - a.average;
      }

      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }

      return a.name.localeCompare(b.name, 'hu');
    });
};

function Profile() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [onlineMatches, setOnlineMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlineError, setOnlineError] = useState('');
  const [leaderboardMode, setLeaderboardMode] = useState('local');
  const [leaderboardChampionship, setLeaderboardChampionship] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Szuresek engedélyezésére vonatkozó flagek
  const [enableMatchFilters, setEnableMatchFilters] = useState(false);
  const [enableChampionshipFilter, setEnableChampionshipFilter] = useState(false);

  const [filterGameMode, setFilterGameMode] = useState('');
  const [filterOutMode, setFilterOutMode] = useState('');
  const [filterPlayerName, setFilterPlayerName] = useState('');
  const [filterChampionship, setFilterChampionship] = useState('');
  const [filterCreatedDate, setFilterCreatedDate] = useState('');


  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchMatches = async () => {
      const token = getToken();

      try {
        const localData = await getUserMatches(token);
        setMatches(Array.isArray(localData) ? localData : []);
      } catch (err) {
        setError('Hiba az adatok lekérésekor');
        console.error(err);
      }

      try {
        const allData = await getLeaderboardMatches(token);
        if (Array.isArray(allData)) {
          setOnlineMatches(allData);
          setOnlineError('');
        } else {
          setOnlineMatches([]);
          setOnlineError(allData?.message || 'Az online leaderboard most nem elérhető.');
        }
      } catch (err) {
        setOnlineMatches([]);
        setOnlineError('Az online leaderboard most nem elérhető.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    alert('✅ Sikeres kijelentkezés!');
    navigate('/');
  };

  // Jelszocsere inputok valtozaskezeloje.
  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handlePasswordChangeSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Az új jelszónak legalább 6 karakterből kell állnia');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Az új jelszó és a megerősítés nem egyezik');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = getToken();
      const response = await changePassword(
        token,
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      if (response?.message === 'Jelszó sikeresen módosítva') {
        setPasswordSuccess(response.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        return;
      }

      setPasswordError(response?.message || 'Nem sikerült módosítani a jelszót');
    } catch (err) {
      setPasswordError('Hiba történt a jelszó módosítása közben');
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  // A valasztott mod alapjan epitjuk a top5 leaderboardot.
  // Szures csak a helyi leaderboard-hoz, bajnoksag alapjan
  const filteredLeaderboardMatches = matches.filter((match) => {
    if (leaderboardMode === 'local-championship' && leaderboardChampionship) {
      const championshipLower = leaderboardChampionship.trim().toLowerCase();
      const matchChampionship = (match.championship_name || '').toLowerCase();
      if (!matchChampionship.includes(championshipLower)) {
        return false;
      }
    }
    return true;
  });

  const leaderboardSource = leaderboardMode === 'online' ? onlineMatches : (leaderboardMode === 'local-championship' ? filteredLeaderboardMatches : matches);
  const leaderboard = buildLeaderboard(leaderboardSource).slice(0, 5);

  // A meccslista szuresei csak a sajat mentett meccsekre vonatkoznak.
  const filteredMatches = matches.filter((match) => {
    // Ha nincsenek engedélyezve a szűrések, mutassa az összes meccset
    if (!enableMatchFilters) {
      return true;
    }

    // Meccs hossza szerinti szures.
    if (filterGameMode && match.game_mode !== filterGameMode) {
      return false;
    }

    // Kiszallo mod szerinti szures.
    if (filterOutMode && match.out_mode !== filterOutMode) {
      return false;
    }

    // Jatekosnevre kereses.
    if (filterPlayerName.trim()) {
      const playerNameLower = filterPlayerName.trim().toLowerCase();
      const hasPlayer = match.players?.some((player) =>
        player?.name?.toLowerCase().includes(playerNameLower)
      );
      if (!hasPlayer) {
        return false;
      }
    }

    // Bajnoksag szures logikaja - csak ha engedélyezve van
    if (enableChampionshipFilter && filterChampionship) {
      // Konkret bajnoksag neve szerinti szures
      const championshipLower = filterChampionship.trim().toLowerCase();
      const matchChampionship = (match.championship_name || '').toLowerCase();
      if (!matchChampionship.includes(championshipLower)) {
        return false;
      }
    }

    // Letrehozasi datum szerinti szures.
    if (filterCreatedDate && match.created_at) {
      try {
        let matchDate;
        // Ha már YYYY-MM-DD formátumú, akkor használd közvetlenül
        if (match.created_at.includes('T')) {
          // ISO formátum (2024-01-01T10:00:00Z)
          matchDate = new Date(match.created_at).toISOString().split('T')[0];
        } else {
          // Már szöveges formátum (2024-01-01)
          matchDate = match.created_at.split(' ')[0]; // Vesz az első részt, ha van space
        }
        if (matchDate !== filterCreatedDate) {
          return false;
        }
      } catch (e) {
        console.error('Dátum konverzió hiba:', match.created_at, e);
        return false; // Ha nem tudjuk konvertálni, szűrjük ki
      }
    }

    return true;
  });

  const uniqueGameModes = [...new Set(matches.map(m => m.game_mode))].filter(Boolean);
  const uniqueOutModes = [...new Set(matches.map(m => m.out_mode))].filter(Boolean);
  // Valós bajnokságok
  const realChampionships = [...new Set(matches.map(m => m.championship_name).filter(Boolean))].sort();
  // Bajnokság és nem bajnokság opciók + valós bajnokságok
  const hasChampionshipMatches = matches.some(m => m.championship_name);
  const hasNonChampionshipMatches = matches.some(m => !m.championship_name);
  const uniqueChampionships = [];
  if (hasChampionshipMatches) uniqueChampionships.push('championship');
  if (hasNonChampionshipMatches) uniqueChampionships.push('no-championship');
  uniqueChampionships.push(...realChampionships);

  // Kezdeti betoltes kozben csak egy egyszeru varakozo nezetet mutatunk.
  if (loading) {
    return (
      <>
        <Navbar />
        <main className={style.profileContainer}>
          <div className={style.loadingBox}>
            <h2>Betöltés...</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={style.profileContainer}>
        <div className={style.profileBox}>
          <div className={style.profileHeader}>
            <h1>Profilom</h1>
            <button onClick={handleLogout} className={style.logoutBtn}>
              Kijelentkezés
            </button>
          </div>

          {error && <div className={style.error}>{error}</div>}

          {/* Jelszocsere blokk */}
          <section className={style.passwordSection}>
            <div className={style.sectionHeader}>
              <h2>Jelszó módosítása</h2>
              <span className={style.sectionHint}>Bejelentkezett felhasználóként itt tudod frissíteni a jelszavadat</span>
            </div>

            {passwordError && <div className={style.error}>{passwordError}</div>}
            {passwordSuccess && <div className={style.success}>{passwordSuccess}</div>}

            <form className={style.passwordForm} onSubmit={handlePasswordChangeSubmit}>
              <div className={style.fieldGroup}>
                <label htmlFor="currentPassword">Jelenlegi jelszó</label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>

              <div className={style.fieldGroup}>
                <label htmlFor="newPassword">Új jelszó</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  minLength={6}
                  required
                />
              </div>

              <div className={style.fieldGroup}>
                <label htmlFor="confirmPassword">Új jelszó megerősítése</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  minLength={6}
                  required
                />
              </div>

              <button type="submit" className={style.changePasswordBtn} disabled={passwordLoading}>
                {passwordLoading ? 'Mentés...' : 'Jelszó módosítása'}
              </button>
            </form>
          </section>

          {/* Helyi/Online leaderboard blokk */}
          <section className={style.leaderboardSection}>
            <div className={style.sectionHeader}>
              <h2>All-time leaderboard</h2>
              <span className={style.sectionHint}>
                {leaderboardMode === 'online'
                  ? '3 nyilas átlag az összes mentett mérkőzésből'
                  : '3 nyilas átlag a saját mérkőzéseidből'}
              </span>
            </div>

            <div className={style.leaderboardToggle}>
              <button
                type="button"
                onClick={() => setLeaderboardMode('local')}
                className={`${style.toggleBtn} ${leaderboardMode === 'local' ? style.activeToggle : ''}`}
              >
                Helyi
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardMode('online')}
                className={`${style.toggleBtn} ${leaderboardMode === 'online' ? style.activeToggle : ''}`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardMode('local-championship')}
                className={`${style.toggleBtn} ${leaderboardMode === 'local-championship' ? style.activeToggle : ''}`}
              >
                Helyi bajnokság
              </button>
            </div>

            {leaderboardMode === 'online' && onlineError && (
              <div className={style.error}>{onlineError}</div>
            )}

            {leaderboardMode === 'local-championship' && (
              <div className={style.leaderboardFilterControls}>
                <div className={style.filterGroup}>
                  <label htmlFor="leaderboardChampionshipSelect">Bajnokság:</label>
                  <select
                    id="leaderboardChampionshipSelect"
                    value={leaderboardChampionship}
                    onChange={(e) => setLeaderboardChampionship(e.target.value)}
                    className={style.filterSelect}
                  >
                    <option value="">Válassz bajnokságot</option>
                    {realChampionships.map((championship) => (
                      <option key={championship} value={championship}>
                        {championship}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className={style.resetBtn}
                  onClick={() => {
                    setLeaderboardChampionship('');
                  }}
                >
                  Szűrés törlése
                </button>
              </div>
            )}

            {leaderboard.length === 0 ? (
              <div className={style.leaderboardEmpty}>
                Még nincs elég adat a rangsorhoz.
              </div>
            ) : (
              <div className={style.leaderboardList}>
                {leaderboard.map((player, index) => (
                  <div key={`${player.name}-${index}`} className={style.leaderboardRow}>
                    <div className={style.rankBadge}>#{index + 1}</div>
                    <div className={style.leaderboardNameBlock}>
                      <div className={style.leaderboardName}>{player.name}</div>
                      <div className={style.leaderboardMeta}>
                        {player.matchesPlayed} meccs · {player.wins} győzelem · {player.winRate.toFixed(1)}% win
                      </div>
                    </div>
                    <div className={style.leaderboardAverage}>{player.average.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Meccslista szuresek */}
          <section className={style.filterSection}>
            <div className={style.sectionHeader}>
              <h2>Meccsek szűrése</h2>
              <div className={style.checkboxGroup}>
                <input
                  id="enableMatchFilters"
                  type="checkbox"
                  checked={enableMatchFilters}
                  onChange={(e) => setEnableMatchFilters(e.target.checked)}
                  className={style.filterCheckbox}
                />
                <label htmlFor="enableMatchFilters" className={style.checkboxLabel}>
                  Szűrések engedélyezése
                </label>
              </div>
            </div>
            
            <div className={style.filterControls} style={{ opacity: enableMatchFilters ? 1 : 0.5, pointerEvents: enableMatchFilters ? 'auto' : 'none' }}>
              <div className={style.filterGroup}>
                <label htmlFor="filterGameMode">Meccs hossz:</label>
                <select
                  id="filterGameMode"
                  value={filterGameMode}
                  onChange={(e) => setFilterGameMode(e.target.value)}
                  className={style.filterSelect}
                >
                  <option value="">Összes</option>
                  {uniqueGameModes.sort().map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div className={style.filterGroup}>
                <label htmlFor="filterOutMode">Kiszálló:</label>
                <select
                  id="filterOutMode"
                  value={filterOutMode}
                  onChange={(e) => setFilterOutMode(e.target.value)}
                  className={style.filterSelect}
                >
                  <option value="">Összes</option>
                  <option value="single_out">Egyenes Out</option>
                  <option value="double_out">Dupla Out</option>
                </select>
              </div>

              <div className={style.filterGroup}>
                <label htmlFor="filterPlayerName">Játékos neve:</label>
                <input
                  id="filterPlayerName"
                  type="text"
                  placeholder="Játékos keresése..."
                  value={filterPlayerName}
                  onChange={(e) => setFilterPlayerName(e.target.value)}
                  className={style.filterInput}
                />
              </div>

              <div className={style.filterGroup}>
                <div className={style.checkboxGroup}>
                  <input
                    id="enableChampionshipFilter"
                    type="checkbox"
                    checked={enableChampionshipFilter}
                    onChange={(e) => setEnableChampionshipFilter(e.target.checked)}
                    className={style.filterCheckbox}
                  />
                  <label htmlFor="enableChampionshipFilter" className={style.checkboxLabel}>
                    Bajnokság szűrés
                  </label>
                </div>
                {enableChampionshipFilter && (
                  <select
                    id="filterChampionship"
                    value={filterChampionship}
                    onChange={(e) => setFilterChampionship(e.target.value)}
                    className={style.filterSelect}
                  >
                    <option value="">-- Válassz opciót --</option>
                    {realChampionships.map((championship) => (
                      <option key={championship} value={championship}>
                        {championship}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className={style.filterGroup}>
                <label htmlFor="filterCreatedDate">Létrehozás dátuma:</label>
                <input
                  id="filterCreatedDate"
                  type="date"
                  value={filterCreatedDate}
                  onChange={(e) => setFilterCreatedDate(e.target.value)}
                  className={style.filterInput}
                />
              </div>

              <button
                type="button"
                className={style.resetBtn}
                onClick={() => {
                  setFilterGameMode('');
                  setFilterOutMode('');
                  setFilterPlayerName('');
                  setEnableChampionshipFilter(false);
                  setFilterChampionship('');
                  setFilterCreatedDate('');
                }}
              >
                Szűrések törlése
              </button>
            </div>
          </section>

          {/* Sajat mentett meccsek listaja */}
          <section className={style.matchesSection}>
            <h2>Saját Mérkőzések ({filteredMatches.length})</h2>
            
            {filteredMatches.length === 0 ? (
              <div className={style.noMatches}>
                <p>Még nincsenek mentett mérkőzéseid.</p>
                <button 
                  onClick={() => navigate('/gameMenu')}
                  className={style.createBtn}
                >
                  🎮 Új mérkőzés
                </button>
              </div>
            ) : (
              <div className={style.matchesList}>
                {filteredMatches.map((match) => (
                  <div key={match.id} className={style.matchCard}>
                    <div className={style.matchHeader}>
                      <div className={style.matchInfo}>
                        <h3>{match.game_mode} - {match.out_mode === 'double_out' ? 'Dupla' : 'Egyenes'}</h3>
                        {match.championship_name && (
                          <p className={style.championshipName}>🏆 {match.championship_name}</p>
                        )}
                      </div>
                      <span className={style.matchDate}>
                        {new Date(match.created_at).toLocaleDateString('hu-HU')}
                      </span>
                    </div>
                    
                    <div className={style.playersInfo}>
                      {match.players.map((player) => (
                        <div 
                          key={player.id}
                          className={`${style.playerResult} ${player.is_winner ? style.winner : ''}`}
                        >
                          <span className={style.playerName}>{player.name}</span>
                          <span className={style.playerScore}>{player.final_score}</span>
                          {player.is_winner && <span className={style.badge}>🏆</span>}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => navigate(`/match/${match.id}`)}
                      className={style.detailBtn}
                    >
                      Részletek →
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

export default Profile;