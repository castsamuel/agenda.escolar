import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/index.js';

const router = Router();
router.get('/status', (req, res) => {
  const configured = !!db.prepare('SELECT id FROM users LIMIT 1').get();
  const user = req.session.userId && db.prepare('SELECT id, username, theme FROM users WHERE id=?').get(req.session.userId);
  res.json({ configured, user: user || null });
});
router.post('/setup', async (req, res) => {
  const { username, password, confirmation } = req.body;
  if (db.prepare('SELECT id FROM users LIMIT 1').get()) return res.status(409).json({ error: 'A conta inicial já foi configurada.' });
  if (!username?.trim()) return res.status(400).json({ error: 'Informe seu nome para continuar.' });
  const result = db.prepare('INSERT INTO users (username,password_hash) VALUES (?,?)').run(username.trim(), await bcrypt.hash('acesso-local-sem-senha', 12));
  req.session.userId = result.lastInsertRowid;
  res.status(201).json({ user: { id: result.lastInsertRowid, username: username.trim(), theme: 'light' } });
});
router.post('/login', async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(req.body.username?.trim());
  if (!user) return res.status(401).json({ error: 'Nome não encontrado.' });
  req.session.userId = user.id; res.json({ user: { id:user.id, username:user.username, theme:user.theme } });
});
router.post('/logout', (req, res) => req.session.destroy(() => res.status(204).end()));
export default router;

