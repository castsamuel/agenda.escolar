import { Router } from 'express';
import db from '../database/index.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router(); router.use(requireAuth);
const user = req => req.session.userId;
const activityStatus = item => item.status === 'concluido' ? 'concluido' : (item.due_date < new Date().toISOString().slice(0,10) ? 'atrasado' : item.status);

router.get('/bootstrap', (req,res) => {
  const uid=user(req); const school=db.prepare('SELECT * FROM schools WHERE user_id=? ORDER BY is_selected DESC,id DESC LIMIT 1').get(uid);
  const subjects=db.prepare('SELECT * FROM subjects WHERE user_id=? ORDER BY name').all(uid);
  const activities=db.prepare(`SELECT a.*, s.name subject_name, s.color subject_color FROM activities a LEFT JOIN subjects s ON s.id=a.subject_id WHERE a.user_id=? ORDER BY a.due_date,a.due_time`).all(uid).map(x=>({...x,status:activityStatus(x)}));
  res.json({school,subjects,activities});
});
router.post('/schools', (req,res)=> { const b=req.body; if(!b.name?.trim()) return res.status(400).json({error:'Informe o nome da escola.'}); const uid=user(req); db.prepare('UPDATE schools SET is_selected=0 WHERE user_id=?').run(uid); const r=db.prepare('INSERT INTO schools(user_id,name,school_year,grade,class_name,shift,is_selected) VALUES(?,?,?,?,?,?,1)').run(uid,b.name.trim(),b.school_year||'',b.grade||'',b.class_name||'',b.shift||''); res.status(201).json(db.prepare('SELECT * FROM schools WHERE id=?').get(r.lastInsertRowid)); });
router.post('/subjects',(req,res)=> { const b=req.body; if(!b.name?.trim()) return res.status(400).json({error:'Informe o nome da matÃ©ria.'}); const school=db.prepare('SELECT id FROM schools WHERE user_id=? AND is_selected=1').get(user(req)); const r=db.prepare('INSERT INTO subjects(user_id,school_id,name,teacher,description,color) VALUES(?,?,?,?,?,?)').run(user(req),school?.id||null,b.name.trim(),b.teacher||'',b.description||'',b.color||'#6D5CE7'); res.status(201).json(db.prepare('SELECT * FROM subjects WHERE id=?').get(r.lastInsertRowid)); });
router.post('/activities',(req,res)=> { const b=req.body; if(!b.title?.trim()||!b.type||!b.due_date) return res.status(400).json({error:'TÃ­tulo, tipo e data sÃ£o obrigatÃ³rios.'}); const school=db.prepare('SELECT id FROM schools WHERE user_id=? AND is_selected=1').get(user(req)); const r=db.prepare('INSERT INTO activities(user_id,school_id,subject_id,title,type,description,due_date,due_time,priority,status) VALUES(?,?,?,?,?,?,?,?,?,?)').run(user(req),school?.id||null,b.subject_id||null,b.title.trim(),b.type,b.description||'',b.due_date,b.due_time||null,b.priority||'media',b.status||'pendente'); res.status(201).json({id:r.lastInsertRowid}); });
router.put('/activities/:id',(req,res)=> { const b=req.body; const r=db.prepare('UPDATE activities SET subject_id=?,title=?,type=?,description=?,due_date=?,due_time=?,priority=?,status=? WHERE id=? AND user_id=?').run(b.subject_id||null,b.title,b.type,b.description||'',b.due_date,b.due_time||null,b.priority||'media',b.status||'pendente',req.params.id,user(req)); if(!r.changes)return res.status(404).json({error:'Atividade nÃ£o encontrada.'}); res.status(204).end(); });
router.delete('/activities/:id',(req,res)=> { const r=db.prepare('DELETE FROM activities WHERE id=? AND user_id=?').run(req.params.id,user(req)); if(!r.changes)return res.status(404).json({error:'Atividade nÃ£o encontrada.'}); res.status(204).end(); });
router.patch('/theme',(req,res)=> { const theme=req.body.theme==='dark'?'dark':'light'; db.prepare('UPDATE users SET theme=? WHERE id=?').run(theme,user(req)); res.json({theme}); });
export default router;

