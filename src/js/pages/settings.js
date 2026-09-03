import db from '../db.js';
import filesdb from '../filesdb.js';
import notifications from '../notifications.js';
import { toast, confirmDialog } from '../utils.js';

export function render(root) {
  const d = db.getData();
  const permission = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  const permLabel = { granted: '🟢 Ativadas', denied: '🔴 Bloqueadas pelo navegador', default: '🟡 Não ativadas', unsupported: '— Não suportadas neste navegador' }[permission];

  root.innerHTML = `
    <div class="page-head"><h1>Configurações</h1><p class="page-sub">Ajustes gerais da agenda e backup dos seus dados.</p></div>

    <section class="panel">
      <h2>Critério de aprovação</h2>
      <label class="field field--inline">
        <span>Nota mínima para aprovação</span>
        <input type="number" id="min-grade" min="0" max="10" step="0.1" value="${d.settings.minGrade}" style="max-width:120px" />
      </label>
      <p class="field-hint">Usada para calcular a situação acadêmica (🟢 Aprovado / 🟡 Recuperação / 🔴 Reprovado) em Notas e Desempenho.</p>
    </section>

    <section class="panel">
      <h2>Notificações de prazo</h2>
      <p class="field-hint">Avisa 1 dia antes de um dever ou trabalho vencer, enquanto o app estiver aberto (ou tiver sido aberto recentemente). Status atual: <strong>${permLabel}</strong></p>
      <button class="btn btn--primary" id="btn-notif" ${permission === 'granted' || permission === 'unsupported' ? 'disabled' : ''}>🔔 Ativar notificações</button>
      ${permission === 'denied' ? '<p class="field-hint">Seu navegador bloqueou as notificações para este site. Para reativar, abra as permissões do site nas configurações do navegador.</p>' : ''}
    </section>

    <section class="panel">
      <h2>Backup dos dados</h2>
      <p class="field-hint">Como a agenda funciona 100% no seu navegador, faça backups regulares para não perder informações ao trocar de computador ou navegador. O backup inclui escolas, notas, deveres, trabalhos <strong>e os registros e anexos do Diário</strong>.</p>
      <div class="btn-row">
        <button class="btn btn--primary" id="btn-export">⬇ Exportar backup completo (.json)</button>
        <label class="btn btn--ghost file-btn">⬆ Importar backup (.json)
          <input type="file" id="file-import" accept="application/json" hidden />
        </label>
      </div>
    </section>

    <section class="panel panel--danger">
      <h2>Zona de risco</h2>
      <p class="field-hint">Isso apaga permanentemente todas as escolas, séries, matérias, notas, deveres, trabalhos e registros do diário (com anexos) deste navegador.</p>
      <button class="btn btn--danger" id="btn-reset">Apagar todos os dados</button>
    </section>
  `;

  root.querySelector('#min-grade').addEventListener('change', (e) => {
    const v = Number(e.target.value);
    if (Number.isNaN(v) || v < 0 || v > 10) { toast('A nota mínima deve estar entre 0 e 10.', 'error'); render(root); return; }
    db.setSetting('minGrade', v);
    toast('Nota mínima atualizada.');
  });

  root.querySelector('#btn-notif').addEventListener('click', async () => {
    const result = await notifications.requestPermission();
    if (result === 'granted') { toast('Notificações ativadas.'); notifications.checkUpcomingDeadlines(); }
    else if (result === 'denied') toast('Permissão negada pelo navegador.', 'error');
    render(root);
  });

  root.querySelector('#btn-export').addEventListener('click', async () => {
    try {
      const appData = JSON.parse(db.exportJSON());
      const files = {};
      for (const entry of appData.diary || []) {
        for (const att of entry.attachments || []) {
          const blob = await filesdb.getFile(att.id).catch(() => null);
          if (blob) files[att.id] = { name: att.name, type: att.type, dataBase64: await blobToBase64(blob) };
        }
      }
      const bundle = { formato: 'agenda-escolar-backup', versao: 2, app: appData, files };
      const blob = new Blob([JSON.stringify(bundle)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agenda-escolar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Backup exportado.');
    } catch (err) {
      toast('Falha ao gerar backup: ' + err.message, 'error');
    }
  });

  root.querySelector('#file-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!(await confirmDialog('Importar este arquivo substituirá todos os dados atuais (incluindo o Diário). Continuar?'))) { e.target.value = ''; return; }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed && parsed.formato === 'agenda-escolar-backup') {
        db.importJSON(JSON.stringify(parsed.app));
        for (const [id, f] of Object.entries(parsed.files || {})) {
          const blob = base64ToBlob(f.dataBase64, f.type);
          await filesdb.saveFile(id, blob);
        }
      } else {
        db.importJSON(text); // backup antigo, sem anexos
      }
      toast('Dados importados com sucesso.');
      document.dispatchEvent(new CustomEvent('agenda:selection-changed'));
    } catch (err) {
      toast('Não foi possível importar: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  root.querySelector('#btn-reset').addEventListener('click', async () => {
    if (await confirmDialog('Tem certeza? Esta ação não pode ser desfeita.')) {
      const ids = await filesdb.getAllIds().catch(() => []);
      for (const id of ids) await filesdb.deleteFile(id).catch(() => {});
      db.resetAll();
      toast('Todos os dados foram apagados.');
      document.dispatchEvent(new CustomEvent('agenda:selection-changed'));
      location.hash = '#/dashboard';
    }
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64, type) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: type || 'application/octet-stream' });
}
