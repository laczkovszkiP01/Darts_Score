import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Regisztráció
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Összes mező kitöltése szükséges' });
    }

    if (password.length < 6) {
  return res.status(400).json({ message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie' });
}

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Felhasználó vagy email már létezik' });
    }

    const user = await User.create({
      username,
      email,
      password_hash: password
    });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Sikeres regisztráció',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Szerver hiba', error: error.message });
  }
});

// Bejelentkezés
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email és jelszó szükséges' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Hibás email vagy jelszó' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Hibás email vagy jelszó' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Sikeres bejelentkezés',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Szerver hiba', error: error.message });
  }
});

// Jelszó módosítása
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Minden jelszó mező kitöltése kötelező' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Az új jelszónak legalább 6 karakterből kell állnia' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Az új jelszó és a megerősítés nem egyezik' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Felhasználó nem található' });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'A jelenlegi jelszó hibás' });
    }

    user.password_hash = newPassword;
    await user.save();

    return res.json({ message: 'Jelszó sikeresen módosítva' });
  } catch (error) {
    return res.status(500).json({ message: 'Szerver hiba', error: error.message });
  }
});

export default router;
