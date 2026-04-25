import express from 'express';
import sequelize from '../db/database.js';
import User from '../models/User.js';
import Match from '../models/Match.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

// Összes felhasználó listázása admin számára
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['id', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Hiba a felhasználók lekérésekor', error: error.message });
  }
});

// Összes mérkőzés listázása admin számára
router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Hiba a mérkőzések lekérésekor', error: error.message });
  }
});

// Felhasználó törlése admin által (a meccseivel együtt)
router.delete('/users/:id', async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    return res.status(400).json({ message: 'Érvénytelen felhasználó azonosító' });
  }

  if (userId === req.userId) {
    return res.status(400).json({ message: 'Saját admin felhasználó nem törölhető' });
  }

  const transaction = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId, { transaction });

    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    await Match.destroy({ where: { created_by: userId }, transaction });
    await User.destroy({ where: { id: userId }, transaction });

    await transaction.commit();

    res.json({ message: 'Felhasználó és mérkőzései törölve' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Hiba a törlés során', error: error.message });
  }
});

// Egy mérkőzés törlése admin által
router.delete('/matches/:id', async (req, res) => {
  const matchId = Number(req.params.id);

  if (!Number.isInteger(matchId)) {
    return res.status(400).json({ message: 'Érvénytelen mérkőzés azonosító' });
  }

  try {
    const deletedCount = await Match.destroy({ where: { id: matchId } });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Mérkőzés nem található' });
    }

    res.json({ message: 'Mérkőzés törölve' });
  } catch (error) {
    res.status(500).json({ message: 'Hiba a törlés során', error: error.message });
  }
});

export default router;
