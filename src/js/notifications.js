// notifications.js — lembretes de prazo usando a Notification API do navegador.
//
// IMPORTANTE (limitação real, não escondida): como o app não tem servidor,
// o aviso só é confiável enquanto o app está aberto (ou foi aberto há
// pouco tempo, com o navegador em segundo plano). Não existe, num site
// puramente estático, como garantir um aviso "às 8h mesmo com o app
// fechado há dias" sem um serviço rodando na nuvem. Por isso: a cada
// abertura do app, e a cada 30 min enquanto ele fica aberto, ele confere
// se algo vence amanhã e ainda não foi avisado.

import db from './db.js';
import { todayISO } from './utils.js';

function tomorrowISO() {
  const d = new Date(todayISO() + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function canNotify() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

async function requestPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'default') {
    try { return await Notification.requestPermission(); } catch { return 'denied'; }
  }
  return Notification.permission;
}

function fire(title, body, tag) {
  const opts = { body, tag, icon: './public/icons/icon-192.png', badge: './public/icons/icon-192.png' };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => {
      try { new Notification(title, opts); } catch { /* silencioso: navegador sem suporte */ }
    });
  } else {
    try { new Notification(title, opts); } catch { /* silencioso */ }
  }
}

function checkUpcomingDeadlines() {
  if (!canNotify()) return;
  const d = db.getData();
  const amanha = tomorrowISO();

  d.homework.forEach((h) => {
    if (h.dueDate === amanha && h.status !== 'Concluído' && h.notifiedForDate !== amanha) {
      fire('📝 Tarefa vence amanhã', `"${h.title}" vence amanhã (${fmtBR(amanha)}).`, `hw-${h.id}`);
      db.markNotified('homework', h.id, amanha);
    }
  });

  d.works.forEach((w) => {
    if (w.dueDate === amanha && w.status !== 'Concluído' && w.notifiedForDate !== amanha) {
      fire('📚 Trabalho vence amanhã', `"${w.title}" vence amanhã (${fmtBR(amanha)}).`, `wk-${w.id}`);
      db.markNotified('works', w.id, amanha);
    }
  });
}

function fmtBR(iso) {
  const [y, m, dd] = iso.split('-');
  return `${dd}/${m}/${y}`;
}

let intervalId = null;
function startWatcher() {
  checkUpcomingDeadlines();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(checkUpcomingDeadlines, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkUpcomingDeadlines();
  });
  document.addEventListener('agenda:changed', checkUpcomingDeadlines);
}

export default { requestPermission, checkUpcomingDeadlines, startWatcher, canNotify };
