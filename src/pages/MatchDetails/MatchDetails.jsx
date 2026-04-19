import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { getMatch, getToken, isAuthenticated } from '../../api/apiClient';
import style from './MatchDetails.module.css';

function MatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Statisztikák számolása
  const calculateStats = (player) => {
    if (!player.rounds || player.rounds.length === 0) {
      return {
        average: 0,
        count100Plus: 0,
        count180: 0
      };
    }

    const scores = player.rounds.map(r => r.round_score || 0);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const count100Plus = scores.filter(s => s >= 100).length;
    const count180 = scores.filter(s => s === 180).length;

    return {
      average: average.toFixed(2),
      count100Plus,
      count180
    };
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchMatch = async () => {
      try {
        const token = getToken();
        const data = await getMatch(token, id);
        
        if (data.message) {
          setError(data.message);
        } else {
          setMatch(data);
        }
      } catch (err) {
        setError('Hiba a meccs betöltésekor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={style.container}>
          <div className={style.loadingBox}>
            <h2>Betöltés...</h2>
          </div>
        </main>
      </>
    );
  }

  if (error || !match) {
    return (
      <>
        <Navbar />
        <main className={style.container}>
          <div className={style.errorBox}>
            <h2>❌ {error || 'Mérkőzés nem található'}</h2>
            <button onClick={() => navigate('/profile')} className={style.backBtn}>
              ← Vissza a profilhoz
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={style.container}>
        <div className={style.matchBox}>
          {/* Header */}
          <div className={style.header}>
            <button onClick={() => navigate('/profile')} className={style.backBtn}>
              ← Vissza
            </button>
            <h1>🎯 Mérkőzés Részletei</h1>
          </div>

          {/* Match Info */}
          <div className={style.matchInfo}>
            <div className={style.infoItem}>
              <span className={style.label}>Játék mód:</span>
              <span className={style.value}>{match.game_mode}</span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Kilépés:</span>
              <span className={style.value}>
                {match.out_mode === 'double_out' ? 'Dupla Out' : 'Egyenes Out'}
              </span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>First to:</span>
              <span className={style.value}>{match.first_to || 1}</span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Dátum:</span>
              <span className={style.value}>
                {new Date(match.created_at).toLocaleString('hu-HU')}
              </span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Státusz:</span>
              <span className={`${style.value} ${style.statusBadge}`}>
                {match.status === 'finished' ? '✅ Befejezett' : '⏳ Folyamatban'}
              </span>
            </div>
          </div>

          {/* Players Results */}
          <div className={style.playersResults}>
            <h2>Végeredmény és Statisztikák</h2>
            <div className={style.playerCards}>
              {match.players.map((player, index) => {
                const stats = calculateStats(player);
                return (
                  <div 
                    key={player.id || index} 
                    className={`${style.playerCard} ${player.is_winner ? style.winnerCard : ''}`}
                  >
                    <div className={style.playerHeader}>
                      <h3>{player.name}</h3>
                      {player.is_winner && <span className={style.trophy}>🏆</span>}
                    </div>
                    <div className={style.playerStats}>
                      <div className={style.stat}>
                        <span className={style.statLabel}>Kezdő pont:</span>
                        <span className={style.statValue}>{player.starting_score}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>Végső pont:</span>
                        <span className={style.statValue}>{player.final_score}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>Körök száma:</span>
                        <span className={style.statValue}>{player.rounds?.length || 0}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>Nyert legek:</span>
                        <span className={style.statValue}>{player.legs_won || 0}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>3 nyíl átlag:</span>
                        <span className={style.statValue}>{stats.average}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>100+ körök:</span>
                        <span className={style.statValue}>{stats.count100Plus}</span>
                      </div>
                      <div className={style.stat}>
                        <span className={style.statLabel}>180-as körök:</span>
                        <span className={style.statValue}>{stats.count180}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rounds Details */}
          <div className={style.roundsSection}>
            <h2>Körök Részletei</h2>
            
            {match.players.map((player, playerIndex) => (
              <div key={player.id || playerIndex} className={style.playerRounds}>
                <h3 className={style.playerName}>
                  {player.name} {player.is_winner && '🏆'}
                </h3>
                
                {player.rounds && player.rounds.length > 0 ? (
                  <div className={style.roundsTable}>
                    <div className={style.tableHeader}>
                      <div>Kör</div>
                      <div>1. dobás</div>
                      <div>2. dobás</div>
                      <div>3. dobás</div>
                      <div>Összeg</div>
                    </div>
                    
                    {player.rounds.map((round, roundIndex) => (
                      <div key={roundIndex} className={style.tableRow}>
                        <div className={style.roundNumber}>#{round.round_number || roundIndex + 1}</div>
                        <div className={style.throwValue}>{round.throws?.throw1 ?? '-'}</div>
                        <div className={style.throwValue}>{round.throws?.throw2 ?? '-'}</div>
                        <div className={style.throwValue}>{round.throws?.throw3 ?? '-'}</div>
                        <div className={style.roundScore}>{round.round_score || 0}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={style.noRounds}>Nincsenek rögzített körök</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export default MatchDetails;
