import db from '../db.js';
import filesdb from '../filesdb.js';
import { openModal } from '../components/modal.js';
import { toast, confirmDialog, escapeHTML, fmtDate, todayISO } from '../utils.js';

const CONSEQUENCES = ['Nenhuma', 'Ida à coordenação', 'Ocorrência', 'Advertência', 'Suspensão', 'Outro'];
const CONSEQUENCE_TONE = { 'Nenhuma': 'neutral', 'Ida à coordenação': 'warning', 'Ocorrência': 'warning', 'Advertência': 'danger', 'Suspensão': 'danger', 'Outro': 'neutral' };

let filterTipo = '';

export function render(root) {
  const d = db.getData();
  let entries = [...d.diary].sort((a, b) => b.date.localeCompare(a.date));
  if (filterTipo) entries = entries.filter((e) => e.consequenceType === filterTipo);

  root.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Diário pessoal</h1>
        <p class="page-sub">Seus registros ficam só neste dispositivo — nada é enviado pra fora. Use pra guardar sua versão dos fatos, com data e anexos.</p>
      </div>
      <button class="btn btn--primary" id="btn-add">+ Novo registro</button>
    </div>

    <div class="toolbar">
      <select id="f-tipo">
        <option value="">Todos os tipos</option>
        ${CONSEQUENCES.map((c) => `<option value="${c}" ${filterTipo === c ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>

    <div class="diary-list">
      ${entries.length ? entries.map(entryCard).join('') : '<div class="empty-state empty-state--block">Nenhum registro ainda. Use "+ Novo registro" para começar.</div>'}
    </div>
  `;

  root.querySelector('#btn-add').addEventListener('click', () => entryForm());
  root.querySelector('#f-tipo').addEventListener('change', (e) => { filterTipo = e.target.value; render(root); });

  root.querySelectorAll('[data-act="edit"]').forEach((el) => el.addEventListener('click', () => {
    entryForm(d.diary.find((x) => x.id === el.dataset.id));
  }));
  root.querySelectorAll('[data-act="del"]').forEach((el) => el.addEventListener('click', async () => {
    if (await confirmDialog('Excluir este registro e seus anexos? Esta ação não pode ser desfeita.')) {
      const entry = d.diary.find((x) => x.id === el.dataset.id);
      for (const att of (entry?.attachments || [])) await filesdb.deleteFile(att.id).catch(() => {});
      db.deleteDiaryEntry(el.dataset.id);
      toast('Registro excluído.');
      render(root);
    }
  }));
  root.querySelectorAll('[data-act="open-file"]').forEach((el) => el.addEventListener('click', async () => {
    const blob = await filesdb.getFile(el.dataset.id).catch(() => null);
    if (!blob) { toast('Não foi possível abrir o anexo.', 'error'); return; }
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }));
}

function entryCard(e) {
  const tone = CONSEQUENCE_TONE[e.consequenceType] || 'neutral';
  return `<article class="panel diary-card">
    <div class="diary-card__head">
      <div>
        <h3>${escapeHTML(e.title)}</h3>
        <span class="page-sub">${fmtDate(e.date)}</span>
      </div>
      <div class="diary-card__actions">
        <span class="badge badge--${tone}">${escapeHTML(e.consequenceType)}</span>
        <button class="icon-btn" data-act="edit" data-id="${e.id}" title="Editar">✎</button>
        <button class="icon-btn icon-btn--danger" data-act="del" data-id="${e.id}" title="Excluir">🗑</button>
      </div>
    </div>
    <p class="diary-card__desc">${escapeHTML(e.description || '').replace(/\n/g, '<br>')}</p>
    ${e.attachments && e.attachments.length ? `
      <div class="diary-card__attachments">
        ${e.attachments.map((a) => `<button class="attachment-chip" data-act="open-file" data-id="${a.id}">📎 ${escapeHTML(a.name)}</button>`).join('')}
      </div>` : ''}
  </article>`;
}

function entryForm(existing) {
  let pendingFiles = []; // { name, type, size, file } aguardando salvar
  let keptAttachments = existing ? [...existing.attachments] : []; // metadados já salvos, menos os removidos nesta edição

  const { overlay } = openModal({
    title: existing ? 'Editar registro' : 'Novo registro',
    submitLabel: existing ? 'Salvar alterações' : 'Criar registro',
    bodyHTML: `
      <label class="field"><span>Título</span>
        <input name="title" required maxlength="100" value="${existing ? escapeHTML(existing.title) : ''}" placeholder="Ex: Discussão no intervalo" />
      </label>
      <div class="field-row">
        <label class="field"><span>Data</span>
          <input type="date" name="date" required value="${existing?.date || todayISO()}" />
        </label>
        <label class="field"><span>Consequência</span>
          <select name="consequenceType">${CONSEQUENCES.map((c) => `<option ${(existing?.consequenceType || 'Nenhuma') === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        </label>
      </div>
      <label class="field"><span>Sua versão dos fatos</span>
        <textarea name="description" rows="5" maxlength="4000" placeholder="Descreva o que aconteceu, do seu ponto de vista...">${existing ? escapeHTML(existing.description || '') : ''}</textarea>
      </label>
      <label class="field"><span>Anexos (fotos, documentos, prints)</span>
        <input type="file" name="files" multiple />
      </label>
      <div class="field" id="attachment-preview"></div>
    `,
    onMount: (ov) => {
      const preview = ov.querySelector('#attachment-preview');
      const fileInput = ov.querySelector('input[name="files"]');
      renderPreview();

      function renderPreview() {
        preview.innerHTML = [
          ...keptAttachments.map((a, i) => `<span class="attachment-chip">📎 ${escapeHTML(a.name)} <button type="button" data-kept="${i}">✕</button></span>`),
          ...pendingFiles.map((f, i) => `<span class="attachment-chip attachment-chip--pending">📎 ${escapeHTML(f.name)} (novo) <button type="button" data-pending="${i}">✕</button></span>`),
        ].join(' ');
        preview.querySelectorAll('[data-kept]').forEach((btn) => btn.addEventListener('click', () => {
          keptAttachments.splice(Number(btn.dataset.kept), 1);
          renderPreview();
        }));
        preview.querySelectorAll('[data-pending]').forEach((btn) => btn.addEventListener('click', () => {
          pendingFiles.splice(Number(btn.dataset.pending), 1);
          renderPreview();
        }));
      }

      fileInput.addEventListener('change', () => {
        Array.from(fileInput.files || []).forEach((file) => {
          if (file.size > 15 * 1024 * 1024) { toast(`"${file.name}" é maior que 15MB e não foi adicionado.`, 'error'); return; }
          pendingFiles.push(file);
        });
        fileInput.value = '';
        renderPreview();
      });
    },
    onSubmit: (data) => {
      if (!data.title.trim()) { toast('O título é obrigatório.', 'error'); return false; }
      if (!data.date) { toast('Informe uma data válida.', 'error'); return false; }

      saveEntryAsync(data, existing, keptAttachments, pendingFiles);
      return true;
    },
  });
}

async function saveEntryAsync(data, existing, keptAttachments, pendingFiles) {
  try {
    const newAttachments = [];
    for (const file of pendingFiles) {
      const id = db.uid();
      await filesdb.saveFile(id, file);
      newAttachments.push({ id, name: file.name, type: file.type || 'application/octet-stream', size: file.size });
    }
    const attachments = [...keptAttachments, ...newAttachments];

    if (existing) {
      const removed = existing.attachments.filter((a) => !attachments.some((k) => k.id === a.id));
      for (const r of removed) await filesdb.deleteFile(r.id).catch(() => {});
      db.updateDiaryEntry(existing.id, { title: data.title, date: data.date, consequenceType: data.consequenceType, description: data.description, attachments });
      toast('Registro atualizado.');
    } else {
      db.addDiaryEntry({ title: data.title, date: data.date, consequenceType: data.consequenceType, description: data.description, attachments });
      toast('Registro criado.');
    }
    const root = document.getElementById('view-root');
    if (root && location.hash === '#/diario') render(root);
  } catch (err) {
    toast('Não foi possível salvar um dos anexos: ' + err.message, 'error');
  }
}
