import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db/database.js';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import adminRoutes from './routes/admin.js';

// Modellek importálása a kapcsolatok létrehozásához
import User from './models/User.js';
import Match from './models/Match.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@darts.local';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

  const existingAdmin = await User.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await User.create({
      username: adminUsername,
      email: adminEmail,
      password_hash: adminPassword,
      role: 'admin'
    });

    console.log(`✅ Admin felhasználó létrehozva: ${adminEmail}`);
    return;
  }

  if (existingAdmin.role !== 'admin') {
    existingAdmin.role = 'admin';
    await existingAdmin.save();
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL csatlakozva');

    
    await sequelize.sync({ alter: true });
    console.log('✅ Adatbázis táblák szinkronizálva');

    await ensureAdminUser();

    app.listen(PORT, () => {
      console.log(`🎯 Server fut a ${PORT}-es porton`);
    });
  } catch (err) {
    console.error('❌ PostgreSQL hiba:', err);

    if (err?.name === 'SequelizeConnectionRefusedError' || err?.original?.code === 'ECONNREFUSED') {
      console.error('ℹ️  A PostgreSQL nem érhető el. Ellenőrizd, hogy fut-e a szolgáltatás és helyesek-e a DB_* értékek a .env-ben.');
    }

    process.exit(1);
  }
};

startServer();
