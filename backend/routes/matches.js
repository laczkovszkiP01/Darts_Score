import express from 'express';
import Match from '../models/Match.js';
import sequelize from '../db/database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Új mérkőzés mentése
router.post('/save', verifyToken, async (req, res) => {
  try {
    const { gameMode, outMode, firstTo, players, championshipName } = req.body;
    const parsedFirstTo = Number(firstTo ?? 1);

    if (!gameMode || !outMode || !players || players.length < 2 || !Number.isInteger(parsedFirstTo) || parsedFirstTo < 1) {
      return res.status(400).json({ message: 'Hibás mérkőzés adat' });
    }

    const match = await Match.create({
      created_by: req.userId,
      game_mode: gameMode,
      out_mode: outMode,
      first_to: parsedFirstTo,
      players: players,
      championship_name: championshipName || null,
      status: 'finished',
      finished_at: new Date()
    });

    res.status(201).json({
      message: 'Mérkőzés mentve',
      match
    });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a mentés során', error: error.message });
  }
});

// Felhasználó összes mérkőzésének lekérése
router.get('/user-matches', verifyToken, async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: { created_by: req.userId },
      order: [['created_at', 'DESC']]
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Hiba az adatok lekérésekor', error: error.message });
  }
});

// Leaderboardhoz az összes mentett mérkőzés lekérése
router.get('/leaderboard-matches', verifyToken, async (req, res) => {
  try {
    const matches = await Match.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(matches);
  } catch (error) {
    try {
      
      const [rows] = await sequelize.query(`
        SELECT id, created_by, game_mode, out_mode, first_to, players, status, created_at, finished_at, championship_name
        FROM matches
        ORDER BY created_at DESC
      `);

      const normalized = rows.map((row) => {
        let normalizedPlayers = row.players;

        if (typeof normalizedPlayers === 'string') {
          try {
            normalizedPlayers = JSON.parse(normalizedPlayers);
          } catch (parseError) {
            normalizedPlayers = [];
          }
        }

        return {
          ...row,
          players: Array.isArray(normalizedPlayers) ? normalizedPlayers : []
        };
      });

      res.json(normalized);
    } catch (fallbackError) {
      res.status(500).json({ message: 'Hiba az adatok lekérésekor', error: fallbackError.message });
    }
  }
});

// Egy mérkőzés lekérése
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Mérkőzés nem található' });
    }

    if (match.created_by !== req.userId) {
      return res.status(403).json({ message: 'Nincs hozzáférés' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Hiba', error: error.message });
  }
});

export default router;
