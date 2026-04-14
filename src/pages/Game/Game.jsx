import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import style from "./Game.module.css";
import { saveMatch, getToken } from "../../api/apiClient";
import { evaluateRound } from "./gameLogic";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();

  
  const [gameData, setGameData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentThrows, setCurrentThrows] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [winner, setWinner] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  
  useEffect(() => {
    if (location.state) {
      setGameData({
        matchId: location.state.matchId,
        players: location.state.players,
        gameMode: location.state.gameMode,
        outMode: location.state.outMode,
      });
    }
  }, [location.state]);


  useEffect(() => {
    if (!gameData) return;

    
    const randomIndex = Math.floor(Math.random() * gameData.players.length);
    setCurrentPlayerIndex(randomIndex);
    const startingScore = parseInt(gameData.gameMode);
    const initialPlayers = gameData.players.map((p) => ({
      ...p,
      score: startingScore,
      rounds: [],
    }));
    setPlayers(initialPlayers);

    setIsInitialized(true);
  }, [gameData]);


  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isInitialized) return;
      if (winner) return;
      e.preventDefault();
      e.returnValue = "A játék állapota elveszhet, biztosan frissíteni akarod?";
      return e.returnValue;
    };

    const handlePopState = (e) => {
      if (!isInitialized) return;
      if (winner) return;
      const leave = window.confirm(
        "A játék állapota elveszhet, biztosan el akarod hagyni az oldalt?"
      );
      if (!leave) {
  
        try {
          window.history.pushState({ dartsGuard: true }, document.title, window.location.href);
        } catch (err) {
        }
      }
    };

    try {
      window.history.pushState({ dartsGuard: true }, document.title, window.location.href);
    } catch (err) {
  
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isInitialized, winner]);

  const currentPlayer = players[currentPlayerIndex];

  
  const handleThrow = (value) => {
    if (winner) return;
    if (currentThrows.length >= 3) return;

    if (multiplier === 3 && value === 25) return;

    const finalValue = value * multiplier;
    const newThrows = [...currentThrows, { value, multiplier, total: finalValue }];

    setCurrentThrows(newThrows);
    
  };

  
  const undoThrow = () => {
    if (winner) return;
    setCurrentThrows((prev) => prev.slice(0, -1));
  };

  
  const switchPlayer = () => {
    const newIndex = (currentPlayerIndex + 1) % players.length;
    
    if (newIndex === 0) {
      setRoundNumber((prev) => prev + 1);
    }
    setCurrentPlayerIndex(newIndex);
    setCurrentThrows([]);
  };

  //Kör beküldés
  const submitRound = () => {
    if (winner) return;
    if (currentThrows.length !== 3) return;

    const result = evaluateRound({
      initialScore: currentPlayer.score,
      throwsList: currentThrows,
      outMode: gameData.outMode,
    });

    if (result.bust) {
      alert("Bust! A kör vége.");

      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].rounds.push([{ value: 0, multiplier: 1, total: 0 }]);
      setPlayers(updatedPlayers);
      switchPlayer();
      return;
    }

    if (result.win) {
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex].score = 0;
      updatedPlayers[currentPlayerIndex].rounds.push(currentThrows);
      setPlayers(updatedPlayers);
      setWinner(currentPlayer.name);
      return;
    }

    
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].score = result.remaining;
    updatedPlayers[currentPlayerIndex].rounds.push(currentThrows);
    setPlayers(updatedPlayers);
    switchPlayer();
  };

  const handleSaveMatch = async () => {
    const token = getToken();
    if (!token) {
      alert("Bejelentkezés szükséges a mérkőzés mentéséhez");
      navigate("/login");
      return;
    }

    setIsSaving(true);

    try {
      const matchData = {
        players: players.map(p => ({
          id: p.id,
          name: p.name,
          starting_score: parseInt(gameData.gameMode),
          final_score: p.score,
          is_winner: p.name === winner,
          rounds: p.rounds.map((round, index) => {
            
            const throw1 = round[0] ? round[0].total : 0;
            const throw2 = round[1] ? round[1].total : 0;
            const throw3 = round[2] ? round[2].total : 0;
            const roundScore = throw1 + throw2 + throw3;
            
            return {
              round_number: index + 1,
              throws: {
                throw1,
                throw2,
                throw3
              },
              round_score: roundScore
            };
          })
        }))
      };

      await saveMatch(token, gameData.gameMode, gameData.outMode, matchData.players);
      alert("✅ Mérkőzés sikeresen mentve!");
      navigate("/gameMenu");
    } catch (error) {
      console.error("Mentési hiba:", error);
      alert("❌ Hiba a mentés során. Kérlek próbáld újra!");
    } finally {
      setIsSaving(false);
    }
  };

  const resetGame = () => {
    navigate("/gameMenu");
  };

  
  if (!gameData) {
    return (
      <>
        <Navbar />
        <div className={style.container}>
          <h2>Nincs játék adat. Térj vissza a menübe!</h2>
          <button onClick={() => navigate("/gameMenu")}>Vissza a menübe</button>
        </div>
      </>
    );
  }

  if (!isInitialized) {
    return (
      <>
        <Navbar />
        <div className={style.container}>
          <h2>Betöltés...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={style.gameContainer}>
        {winner && (
          <div className={style.winnerOverlay}>
            <div className={style.winnerBox}>
              <h2>🏆 {winner} nyert! 🏆</h2>
              <div className={style.winnerActions}>
                <button 
                  onClick={handleSaveMatch} 
                  className={style.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? "Mentés..." : "💾 Mentés"}
                </button>
                <button onClick={resetGame} className={style.restartBtn}>
                  📋 Új mérkőzés
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={style.gameBoard}>
          {/* Játékosok display */}
          <div className={style.players}>
            {players.map((p, index) => {
                const throwsSum =
                  index === currentPlayerIndex
                    ? currentThrows.reduce((a, b) => a + (b.total || 0), 0)
                    : 0;
                const previewScore = p.score - throwsSum;

              return (
                <div
                  key={p.id}
                  className={`${style.player} ${
                    index === currentPlayerIndex ? style.active : ""
                  }`}
                >
                  <div className={style.playerHeader}>
                    <h2 className={style.playerName}>{p.name}</h2>
                    {index === currentPlayerIndex && (
                      <span className={style.activeBadge}>→</span>
                    )}
                  </div>
                  <div className={style.score}>{p.score}</div>
                  {index === currentPlayerIndex && currentThrows.length > 0 && (
                    <div className={style.preview}>
                      Következő: {previewScore}
                    </div>
                  )}
                  {index === currentPlayerIndex && (
                    <div className={style.currentThrows}>
                      {currentThrows.map((t, i) => (
                        <span key={i} className={style.throwValue}>
                          {t.value === 25
                            ? (t.multiplier === 2 ? `D25` : t.multiplier === 3 ? `T25` : `25`)
                            : (t.multiplier === 1 ? `${t.value}` : (t.multiplier === 2 ? `D${t.value}` : `T${t.value}`))}
                        </span>
                      ))}
                      {currentThrows.length > 0 && (
                        <span className={style.throwSum}>
                          Σ: {throwsSum}
                        </span>
                      )}
                    </div>
                  )}
                  {p.rounds.length > 0 && (
                    <div className={`${style.averageThrows} ${index === currentPlayerIndex ? style.active : ''}`}>
                      Átlag: <strong>
                        {(p.rounds.reduce((sum, round) => sum + round.reduce((a, b) => a + (b.total || 0), 0), 0) / p.rounds.length).toFixed(1)}
                      </strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Multiplier */}
          <div className={style.section}>
            <h3>🎯 Szorzó</h3>
            <div className={style.multiplierInfo}>
              Jelenlegi: <strong>{multiplier === 1 ? 'Single' : multiplier === 2 ? 'Double (×2)' : 'Triple (×3)'}</strong>
            </div>
            <div className={style.multiplier}>
              <button
                className={multiplier === 1 ? style.active : ""}
                onClick={() => setMultiplier(1)}
                title="1x szorzó"
              >
                1x
              </button>
              <button
                className={multiplier === 2 ? style.active : ""}
                onClick={() => setMultiplier(2)}
                title="2x szorzó (Dupla)"
              >
                2x
              </button>
              <button
                className={multiplier === 3 ? style.active : ""}
                onClick={() => setMultiplier(3)}
                title="3x szorzó (Tripla)"
              >
                3x
              </button>
            </div>
          </div>

          {/* NumberPad */}
          <div className={style.section}>
            <h3>Pont választó</h3>
            <div className={style.numberpad}>
              <button
                key={0}
                onClick={() => handleThrow(0)}
                className={style.missBtn}
                title="Miss - 0 pont"
              >
                0
              </button>
              {[...Array(20)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleThrow(i + 1)}
                  className={style.numberBtn}
                >
                  {i + 1}
                </button>
              ))}
              <button
                key={25}
                onClick={() => handleThrow(25)}
                disabled={multiplier === 3}
                className={style.numberBtn}
              >
                25
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className={style.controls}>
            <button onClick={undoThrow} className={style.controlBtn}>
              ↶ Visszavonás
            </button>
            <button onClick={submitRound} className={style.submitBtn}>
              ✓ Kör beküldése
            </button>
          </div>

          {/* Round info */}
          <div className={style.roundInfo}>
            <p>Kör: {roundNumber}</p>
          </div>
        </div>
      </div>
    </>
  );
}
