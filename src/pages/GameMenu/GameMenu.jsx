import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import style from './GameMenu.module.css';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';

const playerModeOptions = [
    { value: '1v1', label: '1v1', playerCount: 2 },
    { value: '1v1v1', label: '1v1v1', playerCount: 3 },
    { value: '1v1v1v1', label: '1v1v1v1', playerCount: 4 },
];

function GameMenu() {
    const navigate = useNavigate();
    const [playerMode, setPlayerMode] = useState('1v1');
    const [playerNames, setPlayerNames] = useState(['', '']);
    const [gameLength, setGameLength] = useState('');
    const [gameType, setGameType] = useState('');
    const [firstTo, setFirstTo] = useState('');

    const playerCount = playerModeOptions.find((option) => option.value === playerMode)?.playerCount ?? 2;

    useEffect(() => {
        setPlayerNames((currentNames) => {
            const nextNames = currentNames.slice(0, playerCount);

            while (nextNames.length < playerCount) {
                nextNames.push('');
            }

            return nextNames;
        });
    }, [playerCount]);

    const handlePlayerNameChange = (index, value) => {
        setPlayerNames((currentNames) => {
            const nextNames = [...currentNames];
            nextNames[index] = value;
            return nextNames;
        });
    };

    
    

    const handleSettings = (e) => {
        e.preventDefault();
        
        if (!playerNames.every((name) => name.trim()) || !gameLength || !gameType || !firstTo) {
            alert('Kérlek töltsd ki az összes mezőt!');
            return;
        }

        const normalizedNames = playerNames.map((name) => name.trim().toLowerCase());

        if (new Set(normalizedNames).size !== normalizedNames.length) {
            alert('A játékosok neve nem lehet azonos!');
            return;
        }

        // Játékosok feldolgozása
        const players = playerNames.map((name, index) => ({
            id: index + 1,
            name: name.trim(),
        }));

        // Outmode konverzió
        const outMode = gameType === 'double' ? 'double_out' : 'single_out';

        // Régi játék adat törlése - új játék kezdése
        localStorage.removeItem('darts_game_state');
        localStorage.removeItem('darts_game_result');

        // Adatok átadása a Game-re
        navigate('/game', {
            state: {
                matchId: Date.now(),
                players,
                gameMode: gameLength,
                outMode,
                firstTo: Number(firstTo),
            },
        });
    };

    return (
        <>
            <Navbar />
            <main className={style.mainContent}>
                <section className={style.settingsSection}>
                    <div className={style.container}>
                        <h1>Darts Mérkőzés Beállítások</h1>
                        <form className={style.settingsForm} onSubmit={handleSettings}>
                            <div className={style.formGroup}>
                                <label htmlFor="playerMode">
                                    Játékosok száma / mód:
                                </label>
                                <select
                                    id="playerMode"
                                    value={playerMode}
                                    onChange={(e) => setPlayerMode(e.target.value)}
                                >
                                    {playerModeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label} - {option.playerCount} játékos
                                        </option>
                                    ))}
                                </select>
                                <p className={style.helperText}>
                                    A kiválasztott módhoz pontosan {playerCount} játékost adj meg.
                                </p>
                            </div>

                            <div className={style.playerFields}>
                                {playerNames.map((playerName, index) => (
                                    <div className={style.formGroup} key={index}>
                                        <label htmlFor={`player-${index}`}>
                                            {index + 1}. játékos neve:
                                        </label>
                                        <input
                                            type="text"
                                            id={`player-${index}`}
                                            value={playerName}
                                            onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                                            placeholder={`pl: ${index === 0 ? 'Máté' : index === 1 ? 'János' : index === 2 ? 'Lilla' : 'Péter'}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className={style.formGroup}>
                                <label htmlFor="gameLength">Játék hossz:</label>
                                <select
                                    id="gameLength"
                                    value={gameLength}
                                    onChange={(e) => setGameLength(e.target.value)}
                                >
                                    <option value="">-- Válassz --</option>
                                    <option value="301">301</option>
                                    <option value="501">501</option>
                                </select>
                            </div>

                            <div className={style.formGroup}>
                                <label htmlFor="gameType">Játék típusa:</label>
                                <select
                                    id="gameType"
                                    value={gameType}
                                    onChange={(e) => setGameType(e.target.value)}
                                >
                                    <option value="">-- Válassz --</option>
                                    <option value="straight">Egyenes kiszálló</option>
                                    <option value="double">Dupla kiszálló</option>
                                </select>
                            </div>

                            <div className={style.formGroup}>
                                <label htmlFor="firstTo">Leg-ek száma (First to):</label>
                                <select
                                    id="firstTo"
                                    value={firstTo}
                                    onChange={(e) => setFirstTo(e.target.value)}
                                >
                                    <option value="">-- Válassz --</option>
                                    <option value="1">First to 1</option>
                                    <option value="2">First to 2</option>
                                    <option value="3">First to 3</option>
                                    <option value="5">First to 5</option>
                                </select>
                            </div>

                            <button type="submit" className={style.submitBtn}>
                                Beállítás
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            <Footer />

            <ScrollToTop />
        </>
    );
}

export default GameMenu;