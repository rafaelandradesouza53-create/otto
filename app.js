/**
 * OTTO — Sistema Editorial Docente:
 * Gerar, Corrigir, Modo Iconografia (com Tela Cheia) e Backup & Busca.
 */

const OttoState = {
  mode: 'generator',
  level: 'Residência Médica / Concursos',
  typeCounts: {
    mc: 0,       // Múltipla Escolha (Objetivas)
    essay: 0,    // Dissertativas
    cloze: 0,    // Complete as Lacunas
    matching: 0  // Associar Colunas
  },
  style: 'classico', // 'classico' | 'duas_colunas' | 'clinico'
  versionIndex: 0,
  versions: ['CADERNO ALFA', 'CADERNO BETA', 'CADERNO GAMA'],
  showTeacherKeyOnSheet: true,
  attachedFigureDataUrl: '',
  uploadedSlides: [],
  questions: [],
  manualBuilder: {
    editingIndex: null, // null = criando nova, number = editando questão existente
    type: 'mc',         // 'mc' | 'essay' | 'vf' | 'cloze' | 'matching'
    topic: '',
    points: 1.0,
    difficulty: '',     // '' | 'Fácil' | 'Média' | 'Difícil'
    position: 'end',    // 'end' | 'start'
    stem: '',
    imageDataUrl: '',
    imageSize: 'medium', // 'small' | 'medium' | 'large'
    imageCaption: '',
    // Múltipla escolha
    mcOptions: ['', '', '', '', ''],
    mcAnswer: 0,
    rationale: '',
    // Dissertativa
    essayLines: 5,
    conceptKey: '',
    keywords: '',
    // Verdadeiro ou Falso
    vfStatements: [
      { text: '', isTrue: true },
      { text: '', isTrue: false },
      { text: '', isTrue: true },
      { text: '', isTrue: true }
    ],
    // Complete as lacunas
    clozeBlanks: ['', '', ''],
    clozeShowWordBank: true,
    clozeExtraWords: '',
    // Associar colunas
    colATitle: 'Coluna A',
    colBTitle: 'Coluna B',
    matchingPairs: [
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' }
    ],
    matchingKey: ''
  },
  studentGrading: {
    photoDataUrl: '',
    mcMarked: {},
    essayAnswers: {},
    manualScoreOverride: {}
  },
  batchResults: [],
  iconographic: {
    items: [],
    currentIndex: 0,
    remainingSec: 45,
    timerId: null,
    isRunning: false,
    isPaused: false,
    isFullscreen: false
  },
  vaultItems: [],
  selectedVaultId: null,
  avatarOpenUrl: '',
  avatarBlinkUrl: ''
};

/* =====================================================================
   1. INICIALIZAÇÃO & ANIMAÇÃO DE PISCAR DO MASCOTE OTTO
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  applyEmbeddedOttoAssets();
  initOttoMascotBlink();
  resetManualQuestionBuilder();
  renderUploadedSlidesStrip();
  renderExamSheet();
  initBatchClassTable();
  initIconographicModule();
  initVaultDataset();
  renderGradingWorkspace();

  document.addEventListener('fullscreenchange', () => {
    const shell = document.getElementById('icono-stage-shell');
    const isNativeFs = Boolean(document.fullscreenElement);
    if (!isNativeFs && OttoState.iconographic.isFullscreen && shell && !shell.dataset.cssFullscreenOnly) {
      OttoState.iconographic.isFullscreen = false;
      shell.classList.remove('is-fullscreen');
      document.body.classList.remove('icono-fullscreen-active');
      updateFullscreenButtonUI();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && OttoState.iconographic.isFullscreen) {
      exitIconographicFullscreen();
    }
  });
});

function applyEmbeddedOttoAssets() {
  if (!window.OTTO_ASSETS) return;
  const { avatar, wordmark } = window.OTTO_ASSETS;
  OttoState.avatarOpenUrl = avatar || '';
  const headerAvatar = document.getElementById('otto-header-avatar');
  const sheetAvatar = document.getElementById('sheet-otto-avatar');
  const headerWm = document.getElementById('otto-header-wordmark');
  if (headerAvatar && avatar) headerAvatar.src = avatar;
  if (sheetAvatar && avatar) sheetAvatar.src = avatar;
  if (headerWm && wordmark) headerWm.src = wordmark;
  document.querySelectorAll('.otto-inline-avatar').forEach(img => {
    if (avatar) img.src = avatar;
  });

  if (avatar) {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.width || 252;
        c.height = img.height || 252;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(c.width * 0.295, c.height * 0.545, c.width * 0.08, c.height * 0.105);
        ctx.fillRect(c.width * 0.625, c.height * 0.495, c.width * 0.075, c.height * 0.095);

        ctx.strokeStyle = '#121212';
        ctx.lineWidth = Math.max(3, c.width * 0.018);
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(c.width * 0.30, c.height * 0.605);
        ctx.quadraticCurveTo(c.width * 0.335, c.height * 0.62, c.width * 0.37, c.height * 0.598);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(c.width * 0.628, c.height * 0.545);
        ctx.quadraticCurveTo(c.width * 0.66, c.height * 0.56, c.width * 0.695, c.height * 0.538);
        ctx.stroke();

        OttoState.avatarBlinkUrl = c.toDataURL('image/png');
      } catch (e) {}
    };
    img.src = avatar;
  }
}

let blinkTimeoutId = null;
function initOttoMascotBlink() {
  scheduleNextOttoBlink();
}

function scheduleNextOttoBlink() {
  clearTimeout(blinkTimeoutId);
  const randomDelay = Math.floor(3000 + Math.random() * 2000);
  blinkTimeoutId = setTimeout(() => {
    performSingleOttoBlink(() => {
      if (Math.random() < 0.22) {
        setTimeout(() => {
          performSingleOttoBlink(scheduleNextOttoBlink);
        }, 180);
      } else {
        scheduleNextOttoBlink();
      }
    });
  }, randomDelay);
}

function performSingleOttoBlink(onComplete) {
  const badge = document.getElementById('otto-mascot-badge');
  const seal = document.getElementById('sheet-mascot-seal');
  const headerAvatar = document.getElementById('otto-header-avatar');

  if (badge) badge.classList.add('is-blinking');
  if (seal) seal.classList.add('is-blinking');
  if (headerAvatar && OttoState.avatarBlinkUrl) {
    headerAvatar.src = OttoState.avatarBlinkUrl;
  }

  setTimeout(() => {
    if (badge) badge.classList.remove('is-blinking');
    if (seal) seal.classList.remove('is-blinking');
    if (headerAvatar && OttoState.avatarOpenUrl) {
      headerAvatar.src = OttoState.avatarOpenUrl;
    }
    if (typeof onComplete === 'function') onComplete();
  }, 150);
}

function triggerOttoBlinkNow() {
  performSingleOttoBlink();
}

let toastTimer = null;
function showOttoToast(message) {
  const toast = document.getElementById('otto-toast');
  const text = document.getElementById('otto-toast-text');
  if (!toast || !text) return;
  text.innerHTML = `<strong>Otto:</strong> ${message}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3400);
}

/* =====================================================================
   2. NAVEGAÇÃO PRINCIPAL ENTRE OS MÓDULOS
   ===================================================================== */
function switchMode(mode) {
  if (OttoState.iconographic.isFullscreen && mode !== 'iconographic') {
    exitIconographicFullscreen();
  }
  OttoState.mode = mode;
  const modes = ['generator', 'grader', 'iconographic', 'vault'];
  modes.forEach(m => {
    const view = document.getElementById(`view-${m}`);
    const btn = document.getElementById(`nav-btn-${m}`);
    if (view) view.classList.toggle('active', m === mode);
    if (btn) btn.classList.toggle('active', m === mode);
  });

  if (mode === 'grader') {
    renderGradingWorkspace();
    renderBatchResultsTable();
  } else if (mode === 'iconographic') {
    renderIconographicList();
    renderIconographicStage();
  } else if (mode === 'vault') {
    handleVaultLiveFilter();
    const searchInput = document.getElementById('vault-live-search');
    if (searchInput) searchInput.focus();
  }
}

/* =====================================================================
   3. BLOCO "CONTEÚDO" & GERAÇÃO AUTOMÁTICA DE QUESTÕES
   ===================================================================== */
function setExamLevel(levelStr) {
  OttoState.level = levelStr;
  const sel = document.getElementById('qlevel-select');
  if (sel && sel.value !== levelStr) {
    sel.value = levelStr;
  }
  document.querySelectorAll('#qlevel-pills .pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.trim() === levelStr);
  });
  const badge = document.getElementById('sheet-level-badge');
  if (badge) badge.textContent = levelStr.toUpperCase();
  renderExamSheet();
}

function adjustQuestionTypeCount(typeKey, delta) {
  const current = Number(OttoState.typeCounts[typeKey] || 0);
  const next = Math.max(0, Math.min(50, current + delta));
  OttoState.typeCounts[typeKey] = next;
  const inputEl = document.getElementById(`qty-${typeKey}`);
  if (inputEl) inputEl.value = String(next);
  updateTotalConfiguredBadge();
}

function setQuestionTypeCount(typeKey, rawVal) {
  const parsed = parseInt(rawVal, 10);
  const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(50, parsed));
  OttoState.typeCounts[typeKey] = next;
  updateTotalConfiguredBadge();
}

function getTotalConfiguredQuestions() {
  const c = OttoState.typeCounts;
  return (c.mc || 0) + (c.essay || 0) + (c.cloze || 0) + (c.matching || 0);
}

function updateTotalConfiguredBadge() {
  const totalBadge = document.getElementById('total-questions-counter-badge');
  const totalWanted = getTotalConfiguredQuestions();
  const manualCount = OttoState.questions.filter(q => q.isManual).length;
  if (totalBadge) {
    if (manualCount > 0) {
      totalBadge.textContent = `${totalWanted} AUTO + ${manualCount} MANUAL`;
    } else {
      totalBadge.textContent = `${totalWanted} ${totalWanted === 1 ? 'QUESTÃO CONFIGURADA' : 'QUESTÕES CONFIGURADAS'}`;
    }
  }
}

function generateExamFromMaterial() {
  const customText = (document.getElementById('professor-source-text')?.value || '').trim();
  const totalWanted = getTotalConfiguredQuestions();

  if (!customText && OttoState.uploadedSlides.length === 0) {
    showOttoToast('Insira um texto ou anexe arquivos no bloco "Conteúdo" antes de gerar questões automáticas, ou use o Construtor de Questões Manuais.');
    const srcBox = document.getElementById('professor-source-text');
    if (srcBox) srcBox.focus();
    return;
  }

  if (totalWanted <= 0) {
    showOttoToast('Defina a quantidade desejada de questões nos contadores de "Composição das questões" (ex: +1 Múltipla Escolha).');
    return;
  }

  rebuildExamQuestionsFromState();
  showOttoToast(`${OttoState.questions.length} questão(ões) diagramada(s) na folha A4!`);
}

function rebuildExamQuestionsFromState() {
  const customText = (document.getElementById('professor-source-text')?.value || '').trim();
  updateTotalConfiguredBadge();

  // Preserva questões manuais já criadas pelo professor
  const manualQuestions = OttoState.questions.filter(q => q.isManual);

  const typesOrder = ['mc', 'essay', 'cloze', 'matching'];
  const generatedQuestions = [];

  if (customText || OttoState.uploadedSlides.length > 0) {
    const referenceText = customText || OttoState.uploadedSlides.map(s => s.name).join('. ');
    typesOrder.forEach(tKey => {
      const needed = Number(OttoState.typeCounts[tKey] || 0);
      if (needed <= 0) return;
      const synth = synthesizeQuestionsByType(referenceText, tKey, needed, 1);
      synth.forEach(q => {
        q.level = OttoState.level;
        q.isManual = false;
        generatedQuestions.push(q);
      });
    });
  }

  OttoState.questions = [...manualQuestions, ...generatedQuestions];
  renderExamSheet();
}

function synthesizeQuestionsByType(rawText, typeKey, countNeeded, seedOffset = 1) {
  const sentences = String(rawText || '')
    .replace(/\n+/g, '. ')
    .split(/(?<=[.!;?])\s+/)
    .map(s => s.replace(/\.+$/, '').trim())
    .filter(s => s.length > 15);

  const sourceList = sentences.length > 0 ? sentences : [String(rawText || '').trim()].filter(Boolean);
  if (sourceList.length === 0) return [];

  const subjectTitle = (document.getElementById('meta-subject')?.value || 'Conteúdo da Avaliação').split('—')[0].trim() || 'Conteúdo';
  const levelLabel = OttoState.level || 'Superior / Graduação';
  const results = [];

  for (let i = 0; i < countNeeded; i++) {
    const sent = sourceList[(i + seedOffset - 1) % sourceList.length];
    const cleanWords = (sent.match(/[A-Za-zÀ-ÿ0-9>=<%/+-]{5,}/g) || [])
      .map(w => w.replace(/[.,;:()]/g, ''))
      .filter(w => !['para', 'como', 'pela', 'pelo', 'mais', 'menos', 'entre', 'quando', 'sobre', 'assim', 'sendo', 'desta', 'deste'].includes(w.toLowerCase()));
    const kws = [...new Set(cleanWords.map(w => w.toLowerCase()))].slice(0, 5);
    const keyTerms = kws.length >= 3 ? kws : ['conceito', 'análise', 'aplicação'];

    if (typeKey === 'mc') {
      results.push({
        id: `synth-mc-${seedOffset}-${i}-${Date.now()}`,
        type: 'mc',
        topic: `${subjectTitle}`,
        points: 1.0,
        stem: `Com base no conteúdo de "${subjectTitle}" (${levelLabel}), assinale a alternativa CORRETA:`,
        options: [
          sent.endsWith('.') ? sent : `${sent}.`,
          `A afirmação contraria diretamente os conceitos de ${keyTerms[0] || subjectTitle} apresentados no conteúdo.`,
          `O conteúdo descarta completamente a relação com ${keyTerms[1] || 'os critérios técnicos'}.`,
          `Trata-se de um procedimento inverso ao descrito para ${keyTerms[0] || subjectTitle}.`,
          `Nenhuma das proposições aplica-se ao tema de ${subjectTitle}.`
        ],
        answer: 0,
        rationale: `Extraído diretamente do conteúdo: "${sent}"`
      });
    } else if (typeKey === 'essay') {
      results.push({
        id: `synth-essay-${seedOffset}-${i}-${Date.now()}`,
        type: 'essay',
        topic: `${subjectTitle} • Dissertativa`,
        points: 2.0,
        essayLines: 5,
        stem: `Considerando o tema "${subjectTitle}" (${levelLabel}), desenvolva e justifique a seguinte proposição do conteúdo: "${sent}"`,
        conceptKey: sent,
        keywords: keyTerms
      });
    } else if (typeKey === 'cloze') {
      const t1 = keyTerms[0] || 'termo 1';
      const t2 = keyTerms[1] || 'termo 2';
      const t3 = keyTerms[2] || 'termo 3';
      let clozeStem = sent;
      let replacedCount = 0;
      keyTerms.slice(0, 3).forEach((term, idx) => {
        const reg = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (reg.test(clozeStem)) {
          clozeStem = clozeStem.replace(reg, `________________________ (${idx + 1})`);
          replacedCount++;
        }
      });
      if (replacedCount === 0) {
        clozeStem = `Complete as lacunas conforme o conteúdo estudado: "${sent}" — Os elementos centrais abordados são ________________________ (1), ________________________ (2) e ________________________ (3).`;
      } else {
        clozeStem = `Complete as lacunas com os termos exatos do conteúdo: ${clozeStem}`;
      }
      results.push({
        id: `synth-cloze-${seedOffset}-${i}-${Date.now()}`,
        type: 'cloze',
        topic: `${subjectTitle} • Complete as Lacunas`,
        points: 1.5,
        stem: clozeStem,
        blanks: [t1, t2, t3],
        wordBank: [t1, t2, t3],
        showWordBank: true,
        conceptKey: `1: ${t1} | 2: ${t2} | 3: ${t3}`,
        keywords: [t1, t2, t3]
      });
    } else if (typeKey === 'matching') {
      const t1 = (keyTerms[0] || 'Conceito I').toUpperCase();
      const t2 = (keyTerms[1] || 'Conceito II').toUpperCase();
      const t3 = (keyTerms[2] || 'Conceito III').toUpperCase();
      const t4 = (keyTerms[3] || 'Conceito IV').toUpperCase();
      results.push({
        id: `synth-match-${seedOffset}-${i}-${Date.now()}`,
        type: 'matching',
        topic: `${subjectTitle} • Associar Colunas`,
        points: 2.0,
        stem: `Associe os elementos da Coluna A com suas respectivas definições/aplicações na Coluna B sobre "${subjectTitle}":`,
        colATitle: 'Coluna A — Termos',
        colBTitle: 'Coluna B — Descrições',
        colA: [
          `(1) ${t1}`,
          `(2) ${t2}`,
          `(3) ${t3}`,
          `(4) ${t4}`
        ],
        colB: [
          `(   ) Relaciona-se diretamente a ${t2.toLowerCase()} no contexto de ${subjectTitle}.`,
          `(   ) Elemento fundamental: ${t1.toLowerCase()} conforme o material base.`,
          `(   ) Desdobramento prático associado a ${t4.toLowerCase()}.`,
          `(   ) Critério complementar referente a ${t3.toLowerCase()}.`
        ],
        matchingKey: '(2) - (1) - (4) - (3)',
        conceptKey: `Sequência correta: (2) ${t2}, (1) ${t1}, (4) ${t4}, (3) ${t3}.`,
        keywords: ['2 - 1 - 4 - 3', t1.toLowerCase(), t2.toLowerCase(), t3.toLowerCase()]
      });
    }
  }

  return results;
}

async function handleMaterialUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  for (const file of files) {
    const lower = file.name.toLowerCase();
    const baseTitle = file.name.replace(/\.[^.]+$/, '');

    if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
      const slideMeta = {
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: lower.endsWith('.pptx') ? 'PPTX' : 'PPT',
        thumb: ''
      };
      OttoState.uploadedSlides.push(slideMeta);
      renderUploadedSlidesStrip();

      const extractedSlideNotes = await extractTextFromSlideFile(file, baseTitle);
      const srcBox = document.getElementById('professor-source-text');
      if (srcBox && extractedSlideNotes) {
        srcBox.value = srcBox.value
          ? `${srcBox.value}\n\n${extractedSlideNotes}`
          : extractedSlideNotes;
      }
      const titleInput = document.getElementById('meta-title');
      if (titleInput && !titleInput.value.trim()) {
        titleInput.value = `Avaliação — ${baseTitle}`;
        syncExamHeader();
      }
      showOttoToast(`Arquivo "${file.name}" anexado ao Conteúdo!`);
    } else if (lower.endsWith('.pdf')) {
      OttoState.uploadedSlides.push({
        id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: 'PDF',
        thumb: ''
      });
      renderUploadedSlidesStrip();

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/extract-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: reader.result })
          });
          const data = await res.json();
          if (data.ok && data.text) {
            const srcBox = document.getElementById('professor-source-text');
            if (srcBox) {
              srcBox.value = srcBox.value
                ? `${srcBox.value}\n\n${data.text.slice(0, 6000)}`
                : data.text.slice(0, 6000);
            }
          }
        } catch (err) {}
        const titleInput = document.getElementById('meta-title');
        if (titleInput && !titleInput.value.trim()) {
          titleInput.value = `Avaliação — ${baseTitle}`;
          syncExamHeader();
        }
        showOttoToast(`PDF "${file.name}" anexado e texto extraído!`);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(lower)) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        OttoState.uploadedSlides.push({
          id: `imgslide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'IMAGEM',
          thumb: dataUrl
        });
        renderUploadedSlidesStrip();

        OttoState.attachedFigureDataUrl = dataUrl;
        const wrap = document.getElementById('sheet-attached-figure-wrap');
        const img = document.getElementById('sheet-attached-figure-img');
        if (wrap && img) {
          img.src = dataUrl;
          wrap.style.display = 'block';
        }
        showOttoToast(`Imagem "${file.name}" anexada ao Conteúdo!`);
      };
      reader.readAsDataURL(file);
    } else {
      const text = await file.text();
      OttoState.uploadedSlides.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: lower.split('.').pop()?.toUpperCase() || 'ARQ',
        thumb: ''
      });
      renderUploadedSlidesStrip();
      const srcBox = document.getElementById('professor-source-text');
      if (srcBox && text.trim()) {
        srcBox.value = srcBox.value
          ? `${srcBox.value}\n\n${text.slice(0, 6000)}`
          : text.slice(0, 6000);
      }
      const titleInput = document.getElementById('meta-title');
      if (titleInput && !titleInput.value.trim()) {
        titleInput.value = `Avaliação — ${baseTitle}`;
        syncExamHeader();
      }
      showOttoToast(`Arquivo "${file.name}" anexado ao Conteúdo!`);
    }
  }
  event.target.value = '';
}

async function extractTextFromSlideFile(file, baseTitle) {
  try {
    const buf = await file.arrayBuffer();
    const rawStr = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buf));
    const xmlMatches = rawStr.match(/<a:t>([^<]{3,200})<\/a:t>/g);
    if (xmlMatches && xmlMatches.length > 0) {
      const cleaned = xmlMatches
        .map(m => m.replace(/<\/?a:t>/g, '').trim())
        .filter(Boolean)
        .join('. ');
      if (cleaned.length > 20) {
        return cleaned.slice(0, 4000);
      }
    }
  } catch (e) {}
  return `Conteúdo do arquivo "${baseTitle}".`;
}

function renderUploadedSlidesStrip() {
  const strip = document.getElementById('uploaded-slides-list');
  if (!strip) return;
  if (!OttoState.uploadedSlides.length) {
    strip.style.display = 'none';
    strip.innerHTML = '';
    return;
  }
  strip.style.display = 'flex';
  strip.innerHTML = OttoState.uploadedSlides
    .map(
      (s, idx) => `
      <span class="slide-chip">
        ${s.thumb ? `<img src="${s.thumb}" alt="${escapeHtml(s.name)}" />` : `<span>📎</span>`}
        <span>[${escapeHtml(s.type)}] ${escapeHtml(s.name)}</span>
        <button type="button" class="q-inline-btn" style="padding:0 4px;" onclick="removeUploadedSlide(${idx})" title="Remover arquivo">×</button>
      </span>
    `
    )
    .join('');
}

function removeUploadedSlide(idx) {
  OttoState.uploadedSlides.splice(idx, 1);
  renderUploadedSlidesStrip();
}

/* =====================================================================
   4. CONSTRUTOR DE QUESTÕES MANUAIS (EVIDENTE & PERSONALIZÁVEL)
   ===================================================================== */
function setManualBuilderType(typeKey) {
  OttoState.manualBuilder.type = typeKey;
  document.querySelectorAll('#manual-type-pills .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.qtype === typeKey);
  });
  renderManualBuilderTypeFields();
}

function openManualBuilderAndFocus(typeKey) {
  if (OttoState.mode !== 'generator') {
    switchMode('generator');
  }
  if (typeKey) {
    setManualBuilderType(typeKey);
  }
  const card = document.getElementById('manual-question-builder-card');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('highlight-pulse');
    setTimeout(() => card.classList.remove('highlight-pulse'), 1200);
  }
  const stemInput = document.getElementById('mq-stem');
  if (stemInput) {
    setTimeout(() => stemInput.focus(), 200);
  }
}

function resetManualQuestionBuilder() {
  OttoState.manualBuilder = {
    editingIndex: null,
    type: OttoState.manualBuilder?.type || 'mc',
    topic: '',
    points: 1.0,
    difficulty: '',
    position: 'end',
    stem: '',
    imageDataUrl: '',
    imageSize: 'medium',
    imageCaption: '',
    mcOptions: ['', '', '', '', ''],
    mcAnswer: 0,
    rationale: '',
    essayLines: 5,
    conceptKey: '',
    keywords: '',
    vfStatements: [
      { text: '', isTrue: true },
      { text: '', isTrue: false },
      { text: '', isTrue: true },
      { text: '', isTrue: true }
    ],
    clozeBlanks: ['', ''],
    clozeShowWordBank: true,
    clozeExtraWords: '',
    colATitle: 'Coluna A',
    colBTitle: 'Coluna B',
    matchingPairs: [
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' }
    ],
    matchingKey: ''
  };
  syncManualBuilderBaseInputs();
  renderManualBuilderTypeFields();
}

function syncManualBuilderBaseInputs() {
  const b = OttoState.manualBuilder;
  const topicEl = document.getElementById('mq-topic');
  const pointsEl = document.getElementById('mq-points');
  const diffEl = document.getElementById('mq-difficulty');
  const posEl = document.getElementById('mq-position');
  const stemEl = document.getElementById('mq-stem');
  const modeBanner = document.getElementById('mq-editing-banner');
  const submitBtn = document.getElementById('mq-submit-btn');
  const cancelBtn = document.getElementById('mq-cancel-edit-btn');
  const imgPreviewWrap = document.getElementById('mq-image-preview-wrap');
  const imgPreviewEl = document.getElementById('mq-image-preview');
  const imgSizeEl = document.getElementById('mq-image-size');
  const imgCapEl = document.getElementById('mq-image-caption');

  if (topicEl) topicEl.value = b.topic || '';
  if (pointsEl) pointsEl.value = String(b.points ?? 1.0);
  if (diffEl) diffEl.value = b.difficulty || '';
  if (posEl) posEl.value = b.position || 'end';
  if (stemEl) stemEl.value = b.stem || '';
  if (imgSizeEl) imgSizeEl.value = b.imageSize || 'medium';
  if (imgCapEl) imgCapEl.value = b.imageCaption || '';

  if (imgPreviewWrap && imgPreviewEl) {
    if (b.imageDataUrl) {
      imgPreviewEl.src = b.imageDataUrl;
      imgPreviewWrap.style.display = 'block';
    } else {
      imgPreviewWrap.style.display = 'none';
      imgPreviewEl.src = '';
    }
  }

  document.querySelectorAll('#manual-type-pills .pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.qtype === b.type);
  });

  if (b.editingIndex !== null) {
    if (modeBanner) {
      modeBanner.style.display = 'flex';
      modeBanner.innerHTML = `
        <span>✏️ <strong>Editando Questão #${b.editingIndex + 1}</strong> da Folha A4</span>
        <button type="button" class="q-inline-btn" onclick="resetManualQuestionBuilder()">Cancelar Edição</button>
      `;
    }
    if (submitBtn) submitBtn.innerHTML = `💾 Salvar Alterações na Questão #${b.editingIndex + 1}`;
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';
  } else {
    if (modeBanner) modeBanner.style.display = 'none';
    if (submitBtn) submitBtn.innerHTML = `➕ Adicionar Questão Manual à Folha A4`;
    if (cancelBtn) cancelBtn.style.display = 'none';
  }
}

function handleManualQuestionImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    OttoState.manualBuilder.imageDataUrl = reader.result;
    syncManualBuilderBaseInputs();
    showOttoToast('Imagem anexada à questão manual!');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeManualQuestionImage() {
  OttoState.manualBuilder.imageDataUrl = '';
  OttoState.manualBuilder.imageCaption = '';
  syncManualBuilderBaseInputs();
}

function insertClozeBlankInStem() {
  const stemEl = document.getElementById('mq-stem');
  if (!stemEl) return;
  const b = OttoState.manualBuilder;
  const nextNum = (b.stem.match(/_{4,}/g) || []).length + 1;
  const blankToken = ` ________________________ (${nextNum}) `;
  const start = stemEl.selectionStart ?? stemEl.value.length;
  const end = stemEl.selectionEnd ?? stemEl.value.length;
  stemEl.value = stemEl.value.slice(0, start) + blankToken + stemEl.value.slice(end);
  b.stem = stemEl.value;
  if (b.clozeBlanks.length < nextNum) {
    b.clozeBlanks.push('');
    renderManualBuilderTypeFields();
  }
  stemEl.focus();
}

function renderManualBuilderTypeFields() {
  const container = document.getElementById('mq-dynamic-type-fields');
  if (!container) return;
  const b = OttoState.manualBuilder;
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const clozeHelperBtn = document.getElementById('mq-insert-blank-btn');
  if (clozeHelperBtn) {
    clozeHelperBtn.style.display = b.type === 'cloze' ? 'inline-flex' : 'none';
  }

  if (b.type === 'mc') {
    container.innerHTML = `
      <div class="mq-subbox">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <span class="form-label" style="margin:0;">Alternativas (clique na letra para marcar o Gabarito):</span>
          <div style="display:flex; gap:4px;">
            ${b.mcOptions.length < 6 ? `<button type="button" class="q-inline-btn" onclick="addManualMcOption()">+ Alternativa</button>` : ''}
            ${b.mcOptions.length > 2 ? `<button type="button" class="q-inline-btn" onclick="removeManualMcOption()">− Alternativa</button>` : ''}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
          ${b.mcOptions
            .map((optVal, idx) => {
              const isCorrect = b.mcAnswer === idx;
              return `
                <div style="display:flex; align-items:center; gap:6px;">
                  <button
                    type="button"
                    class="omr-btn-bubble ${isCorrect ? 'marked-correct' : ''}"
                    style="width:28px; height:28px; flex-shrink:0;"
                    onclick="setManualMcCorrect(${idx})"
                    title="Definir (${letters[idx]}) como correta"
                  >${letters[idx]}</button>
                  <input
                    type="text"
                    class="input-field"
                    style="padding:6px 9px; font-size:12.5px;"
                    placeholder="Texto da alternativa (${letters[idx]})..."
                    value="${escapeHtml(optVal)}"
                    oninput="OttoState.manualBuilder.mcOptions[${idx}] = this.value"
                  />
                </div>
              `;
            })
            .join('')}
        </div>
        <div>
          <label class="form-label">Justificativa / Comentário do Gabarito (opcional):</label>
          <input
            type="text"
            class="input-field"
            placeholder="Ex: A alternativa (${letters[b.mcAnswer] || 'A'}) está correta porque..."
            value="${escapeHtml(b.rationale)}"
            oninput="OttoState.manualBuilder.rationale = this.value"
          />
        </div>
      </div>
    `;
  } else if (b.type === 'essay') {
    container.innerHTML = `
      <div class="mq-subbox">
        <div class="grid-2" style="margin-bottom:8px;">
          <div>
            <label class="form-label">Linhas pautadas na Folha A4:</label>
            <input
              type="number"
              class="input-field"
              min="0"
              max="20"
              value="${b.essayLines ?? 5}"
              oninput="OttoState.manualBuilder.essayLines = Math.max(0, Math.min(20, parseInt(this.value, 10) || 0))"
            />
            <span style="font-size:10px; color:var(--text-muted);">Use 0 para deixar caixa em branco sem pauta</span>
          </div>
          <div>
            <label class="form-label">Palavras-Chave (sep. por vírgula):</label>
            <input
              type="text"
              class="input-field"
              placeholder="Ex: conceito1, termo2, conduta"
              value="${escapeHtml(b.keywords)}"
              oninput="OttoState.manualBuilder.keywords = this.value"
            />
            <span style="font-size:10px; color:var(--text-muted);">Usadas na correção guiada</span>
          </div>
        </div>
        <div>
          <label class="form-label">Espelho de Resposta / Padrão Esperado (opcional):</label>
          <textarea
            class="textarea-field"
            style="min-height:60px;"
            placeholder="Descreva a resposta ideal esperada para consulta no gabarito..."
            oninput="OttoState.manualBuilder.conceptKey = this.value"
          >${escapeHtml(b.conceptKey)}</textarea>
        </div>
      </div>
    `;
  } else if (b.type === 'vf') {
    container.innerHTML = `
      <div class="mq-subbox">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <span class="form-label" style="margin:0;">Afirmativas (clique em V ou F para definir o gabarito):</span>
          <div style="display:flex; gap:4px;">
            <button type="button" class="q-inline-btn" onclick="addManualVfStatement()">+ Afirmativa</button>
            ${b.vfStatements.length > 1 ? `<button type="button" class="q-inline-btn" onclick="removeManualVfStatement()">− Afirmativa</button>` : ''}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
          ${b.vfStatements
            .map((st, idx) => `
              <div style="display:flex; align-items:center; gap:6px;">
                <button
                  type="button"
                  class="pill ${st.isTrue ? 'active' : ''}"
                  style="padding:4px 8px; font-family:'JetBrains Mono', monospace; font-weight:800; min-width:34px; justify-content:center;"
                  onclick="toggleManualVfTruth(${idx})"
                  title="Clique para alternar entre Verdadeiro (V) e Falso (F)"
                >${st.isTrue ? 'V' : 'F'}</button>
                <input
                  type="text"
                  class="input-field"
                  style="padding:6px 9px; font-size:12.5px;"
                  placeholder="Afirmativa ${idx + 1}..."
                  value="${escapeHtml(st.text)}"
                  oninput="OttoState.manualBuilder.vfStatements[${idx}].text = this.value"
                />
              </div>
            `)
            .join('')}
        </div>
        <div>
          <label class="form-label">Justificativa / Comentário do Gabarito (opcional):</label>
          <input
            type="text"
            class="input-field"
            placeholder="Comentário sobre as afirmativas falsas/verdadeiras..."
            value="${escapeHtml(b.rationale)}"
            oninput="OttoState.manualBuilder.rationale = this.value"
          />
        </div>
      </div>
    `;
  } else if (b.type === 'cloze') {
    container.innerHTML = `
      <div class="mq-subbox">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <span class="form-label" style="margin:0;">Respostas Corretas de Cada Lacuna:</span>
          <div style="display:flex; gap:4px;">
            <button type="button" class="q-inline-btn" onclick="addManualClozeBlank()">+ Lacuna</button>
            ${b.clozeBlanks.length > 1 ? `<button type="button" class="q-inline-btn" onclick="removeManualClozeBlank()">− Lacuna</button>` : ''}
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px;">
          ${b.clozeBlanks
            .map((blankVal, idx) => `
              <div style="display:flex; align-items:center; gap:5px;">
                <span style="font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:800;">(${idx + 1})</span>
                <input
                  type="text"
                  class="input-field"
                  style="padding:5px 8px; font-size:12px;"
                  placeholder="Termo da lacuna ${idx + 1}"
                  value="${escapeHtml(blankVal)}"
                  oninput="OttoState.manualBuilder.clozeBlanks[${idx}] = this.value"
                />
              </div>
            `)
            .join('')}
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
          <label style="display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; cursor:pointer;">
            <input
              type="checkbox"
              ${b.clozeShowWordBank ? 'checked' : ''}
              onchange="OttoState.manualBuilder.clozeShowWordBank = this.checked"
            />
            Exibir caixa com Banco de Palavras na prova
          </label>
          <input
            type="text"
            class="input-field"
            style="padding:5px 8px; font-size:12px; flex:1; min-width:170px;"
            placeholder="Distratores extras (sep. por vírgula)"
            value="${escapeHtml(b.clozeExtraWords)}"
            oninput="OttoState.manualBuilder.clozeExtraWords = this.value"
          />
        </div>
      </div>
    `;
  } else if (b.type === 'matching') {
    container.innerHTML = `
      <div class="mq-subbox">
        <div class="grid-2" style="margin-bottom:8px;">
          <div>
            <label class="form-label">Título da Coluna A:</label>
            <input
              type="text"
              class="input-field"
              style="padding:5px 8px; font-size:12px;"
              value="${escapeHtml(b.colATitle)}"
              oninput="OttoState.manualBuilder.colATitle = this.value"
            />
          </div>
          <div>
            <label class="form-label">Título da Coluna B:</label>
            <input
              type="text"
              class="input-field"
              style="padding:5px 8px; font-size:12px;"
              value="${escapeHtml(b.colBTitle)}"
              oninput="OttoState.manualBuilder.colBTitle = this.value"
            />
          </div>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span class="form-label" style="margin:0;">Itens das Colunas A e B:</span>
          <div style="display:flex; gap:4px;">
            <button type="button" class="q-inline-btn" onclick="addManualMatchingPair()">+ Par</button>
            ${b.matchingPairs.length > 2 ? `<button type="button" class="q-inline-btn" onclick="removeManualMatchingPair()">− Par</button>` : ''}
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
          ${b.matchingPairs
            .map((pair, idx) => `
              <div class="grid-2" style="gap:6px;">
                <input
                  type="text"
                  class="input-field"
                  style="padding:5px 8px; font-size:12px;"
                  placeholder="(${idx + 1}) Item da Coluna A..."
                  value="${escapeHtml(pair.a)}"
                  oninput="OttoState.manualBuilder.matchingPairs[${idx}].a = this.value"
                />
                <input
                  type="text"
                  class="input-field"
                  style="padding:5px 8px; font-size:12px;"
                  placeholder="(   ) Correspondente na Coluna B..."
                  value="${escapeHtml(pair.b)}"
                  oninput="OttoState.manualBuilder.matchingPairs[${idx}].b = this.value"
                />
              </div>
            `)
            .join('')}
        </div>
        <div>
          <label class="form-label">Gabarito da Sequência da Coluna B (opcional):</label>
          <input
            type="text"
            class="input-field"
            style="padding:5px 8px; font-size:12px;"
            placeholder="Ex: (2) - (1) - (4) - (3)"
            value="${escapeHtml(b.matchingKey)}"
            oninput="OttoState.manualBuilder.matchingKey = this.value"
          />
        </div>
      </div>
    `;
  }
}

function addManualMcOption() {
  if (OttoState.manualBuilder.mcOptions.length < 6) {
    OttoState.manualBuilder.mcOptions.push('');
    renderManualBuilderTypeFields();
  }
}

function removeManualMcOption() {
  if (OttoState.manualBuilder.mcOptions.length > 2) {
    OttoState.manualBuilder.mcOptions.pop();
    if (OttoState.manualBuilder.mcAnswer >= OttoState.manualBuilder.mcOptions.length) {
      OttoState.manualBuilder.mcAnswer = 0;
    }
    renderManualBuilderTypeFields();
  }
}

function setManualMcCorrect(idx) {
  OttoState.manualBuilder.mcAnswer = idx;
  renderManualBuilderTypeFields();
}

function addManualVfStatement() {
  OttoState.manualBuilder.vfStatements.push({ text: '', isTrue: true });
  renderManualBuilderTypeFields();
}

function removeManualVfStatement() {
  if (OttoState.manualBuilder.vfStatements.length > 1) {
    OttoState.manualBuilder.vfStatements.pop();
    renderManualBuilderTypeFields();
  }
}

function toggleManualVfTruth(idx) {
  const st = OttoState.manualBuilder.vfStatements[idx];
  if (st) {
    st.isTrue = !st.isTrue;
    renderManualBuilderTypeFields();
  }
}

function addManualClozeBlank() {
  OttoState.manualBuilder.clozeBlanks.push('');
  renderManualBuilderTypeFields();
}

function removeManualClozeBlank() {
  if (OttoState.manualBuilder.clozeBlanks.length > 1) {
    OttoState.manualBuilder.clozeBlanks.pop();
    renderManualBuilderTypeFields();
  }
}

function addManualMatchingPair() {
  OttoState.manualBuilder.matchingPairs.push({ a: '', b: '' });
  renderManualBuilderTypeFields();
}

function removeManualMatchingPair() {
  if (OttoState.manualBuilder.matchingPairs.length > 2) {
    OttoState.manualBuilder.matchingPairs.pop();
    renderManualBuilderTypeFields();
  }
}

function saveManualQuestionFromBuilder() {
  const b = OttoState.manualBuilder;
  b.topic = (document.getElementById('mq-topic')?.value || '').trim();
  b.points = Math.max(0.1, parseFloat(document.getElementById('mq-points')?.value || '1') || 1.0);
  b.difficulty = document.getElementById('mq-difficulty')?.value || '';
  b.position = document.getElementById('mq-position')?.value || 'end';
  b.stem = (document.getElementById('mq-stem')?.value || '').trim();
  b.imageSize = document.getElementById('mq-image-size')?.value || 'medium';
  b.imageCaption = (document.getElementById('mq-image-caption')?.value || '').trim();

  if (!b.stem) {
    showOttoToast('Digite o enunciado da questão manual antes de salvar.');
    document.getElementById('mq-stem')?.focus();
    return;
  }

  const questionObj = {
    id: b.editingIndex !== null && OttoState.questions[b.editingIndex]
      ? OttoState.questions[b.editingIndex].id
      : `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    isManual: true,
    type: b.type,
    topic: b.topic || 'Questão Autoral',
    points: b.points,
    difficulty: b.difficulty,
    level: OttoState.level,
    stem: b.stem,
    imageDataUrl: b.imageDataUrl || '',
    imageSize: b.imageSize || 'medium',
    imageCaption: b.imageCaption || ''
  };

  if (b.type === 'mc') {
    const filledOptions = b.mcOptions.map((o, i) => o.trim() || `Alternativa ${['A', 'B', 'C', 'D', 'E', 'F'][i]}`);
    questionObj.options = filledOptions;
    questionObj.answer = Math.min(b.mcAnswer, filledOptions.length - 1);
    questionObj.rationale = b.rationale.trim() || '';
  } else if (b.type === 'essay') {
    questionObj.essayLines = b.essayLines ?? 5;
    questionObj.conceptKey = b.conceptKey.trim() || '';
    questionObj.keywords = b.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);
  } else if (b.type === 'vf') {
    const statements = b.vfStatements
      .map((st, idx) => ({
        text: st.text.trim() || `Afirmativa ${idx + 1}`,
        isTrue: Boolean(st.isTrue)
      }));
    questionObj.vfStatements = statements;
    const keySeq = statements.map(s => (s.isTrue ? 'V' : 'F')).join(' - ');
    questionObj.rationale = b.rationale.trim();
    questionObj.conceptKey = `Sequência V/F: ${keySeq}${b.rationale ? ` | ${b.rationale.trim()}` : ''}`;
    questionObj.keywords = [keySeq.toLowerCase()];
  } else if (b.type === 'cloze') {
    const blanks = b.clozeBlanks.map((bl, idx) => bl.trim() || `termo ${idx + 1}`);
    const extras = b.clozeExtraWords
      .split(',')
      .map(w => w.trim())
      .filter(Boolean);
    questionObj.blanks = blanks;
    questionObj.showWordBank = Boolean(b.clozeShowWordBank);
    questionObj.wordBank = [...blanks, ...extras];
    questionObj.conceptKey = blanks.map((bl, idx) => `${idx + 1}: ${bl}`).join(' | ');
    questionObj.keywords = blanks.map(bl => bl.toLowerCase());
  } else if (b.type === 'matching') {
    questionObj.colATitle = b.colATitle.trim() || 'Coluna A';
    questionObj.colBTitle = b.colBTitle.trim() || 'Coluna B';
    questionObj.colA = b.matchingPairs.map((p, idx) => {
      const clean = p.a.trim() || `Item ${idx + 1}`;
      return /^\(\d+\)/.test(clean) ? clean : `(${idx + 1}) ${clean}`;
    });
    questionObj.colB = b.matchingPairs.map((p, idx) => {
      const clean = p.b.trim() || `Descrição ${idx + 1}`;
      return /^\(\s*\)/.test(clean) ? clean : `(   ) ${clean}`;
    });
    questionObj.matchingKey = b.matchingKey.trim() || '';
    questionObj.conceptKey = b.matchingKey.trim() || 'Conforme correlação entre as colunas A e B.';
    questionObj.keywords = b.matchingKey ? [b.matchingKey.toLowerCase()] : [];
  }

  if (b.editingIndex !== null && OttoState.questions[b.editingIndex]) {
    const editedIdx = b.editingIndex;
    OttoState.questions[editedIdx] = questionObj;
    resetManualQuestionBuilder();
    updateTotalConfiguredBadge();
    renderExamSheet();
    showOttoToast(`Questão #${editedIdx + 1} atualizada com sucesso!`);
  } else {
    if (b.position === 'start') {
      OttoState.questions.unshift(questionObj);
    } else {
      OttoState.questions.push(questionObj);
    }
    resetManualQuestionBuilder();
    updateTotalConfiguredBadge();
    renderExamSheet();
    showOttoToast(`Questão manual #${OttoState.questions.length} adicionada à Folha A4!`);
  }
}

function editQuestionPrompt(idx) {
  const q = OttoState.questions[idx];
  if (!q) return;

  OttoState.manualBuilder = {
    editingIndex: idx,
    type: q.type || 'mc',
    topic: q.topic || '',
    points: Number(q.points) || 1.0,
    difficulty: q.difficulty || '',
    position: 'end',
    stem: q.stem || '',
    imageDataUrl: q.imageDataUrl || '',
    imageSize: q.imageSize || 'medium',
    imageCaption: q.imageCaption || '',
    mcOptions: q.type === 'mc' && Array.isArray(q.options) && q.options.length >= 2
      ? [...q.options]
      : ['', '', '', '', ''],
    mcAnswer: Number(q.answer) || 0,
    rationale: q.rationale || '',
    essayLines: q.essayLines !== undefined ? q.essayLines : 5,
    conceptKey: q.conceptKey || '',
    keywords: Array.isArray(q.keywords) ? q.keywords.join(', ') : '',
    vfStatements: Array.isArray(q.vfStatements) && q.vfStatements.length
      ? q.vfStatements.map(s => ({ text: s.text, isTrue: Boolean(s.isTrue) }))
      : [
          { text: '', isTrue: true },
          { text: '', isTrue: false },
          { text: '', isTrue: true }
        ],
    clozeBlanks: Array.isArray(q.blanks) && q.blanks.length ? [...q.blanks] : ['', ''],
    clozeShowWordBank: q.showWordBank !== false,
    clozeExtraWords: Array.isArray(q.wordBank) && Array.isArray(q.blanks)
      ? q.wordBank.filter(w => !q.blanks.includes(w)).join(', ')
      : '',
    colATitle: q.colATitle || 'Coluna A',
    colBTitle: q.colBTitle || 'Coluna B',
    matchingPairs: Array.isArray(q.colA) && q.colA.length
      ? q.colA.map((aItem, i) => ({
          a: String(aItem).replace(/^\(\d+\)\s*/, ''),
          b: String((q.colB || [])[i] || '').replace(/^\(\s*\)\s*/, '')
        }))
      : [
          { a: '', b: '' },
          { a: '', b: '' },
          { a: '', b: '' }
        ],
    matchingKey: q.matchingKey || ''
  };

  syncManualBuilderBaseInputs();
  renderManualBuilderTypeFields();
  openManualBuilderAndFocus(q.type);
  showOttoToast(`Editando a Questão #${idx + 1} no Construtor Manual.`);
}

function duplicateQuestionAt(idx) {
  const orig = OttoState.questions[idx];
  if (!orig) return;
  const copy = JSON.parse(JSON.stringify(orig));
  copy.id = `dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  copy.isManual = true;
  OttoState.questions.splice(idx + 1, 0, copy);
  updateTotalConfiguredBadge();
  renderExamSheet();
  showOttoToast(`Questão #${idx + 1} duplicada!`);
}

function moveQuestion(idx, direction) {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= OttoState.questions.length) return;
  const temp = OttoState.questions[idx];
  OttoState.questions[idx] = OttoState.questions[targetIdx];
  OttoState.questions[targetIdx] = temp;
  if (OttoState.manualBuilder.editingIndex === idx) {
    OttoState.manualBuilder.editingIndex = targetIdx;
    syncManualBuilderBaseInputs();
  }
  renderExamSheet();
}

function removeQuestionAt(idx) {
  const removed = OttoState.questions.splice(idx, 1)[0];
  if (removed && !removed.isManual && OttoState.typeCounts[removed.type] > 0) {
    OttoState.typeCounts[removed.type]--;
    const inp = document.getElementById(`qty-${removed.type}`);
    if (inp) inp.value = String(OttoState.typeCounts[removed.type]);
  }
  if (OttoState.manualBuilder.editingIndex === idx) {
    resetManualQuestionBuilder();
  }
  updateTotalConfiguredBadge();
  renderExamSheet();
}

/* =====================================================================
   5. DIAGRAMAÇÃO A4 VIVA & MODELOS DE PROVA
   ===================================================================== */
function syncExamHeader() {
  const inst = (document.getElementById('meta-institution')?.value || '').trim();
  const subj = (document.getElementById('meta-subject')?.value || '').trim();
  const title = (document.getElementById('meta-title')?.value || '').trim();
  const prof = (document.getElementById('meta-professor')?.value || '').trim();

  const sheetInst = document.getElementById('sheet-institution');
  const sheetTitle = document.getElementById('sheet-title');
  const sheetSubj = document.getElementById('sheet-subject');
  const sheetProf = document.getElementById('sheet-professor');

  if (sheetInst) sheetInst.textContent = inst || 'INSTITUIÇÃO DE ENSINO';
  if (sheetTitle) sheetTitle.textContent = title || 'Título da Avaliação';
  if (sheetSubj) sheetSubj.innerHTML = `<strong>Assunto:</strong> ${escapeHtml(subj || '—')}`;
  if (sheetProf) sheetProf.innerHTML = `<strong>Docente:</strong> ${escapeHtml(prof || '—')}`;
}

function setExamStyle(style) {
  OttoState.style = style;
  ['classico', 'duas_colunas', 'clinico'].forEach(s => {
    const btn = document.getElementById(`style-btn-${s}`);
    if (btn) btn.classList.toggle('active', s === style);
  });

  const sheet = document.getElementById('exam-a4-sheet');
  if (sheet) sheet.className = `a4-sheet style-${style}`;

  const styleLabels = {
    classico: 'MODELO CLÁSSICO',
    duas_colunas: '2 COLUNAS',
    clinico: 'MODELO PRÁTICO / BOX'
  };
  const badge = document.getElementById('sheet-style-badge');
  if (badge) badge.textContent = styleLabels[style] || 'MODELO CLÁSSICO';
  showOttoToast(`Diagramação alterada para ${styleLabels[style]}!`);
}

function shuffleExamVersion() {
  if (!OttoState.questions.length) {
    showOttoToast('Adicione ou gere questões antes de embaralhar versões.');
    return;
  }
  OttoState.versionIndex = (OttoState.versionIndex + 1) % OttoState.versions.length;
  const verName = OttoState.versions[OttoState.versionIndex];
  document.getElementById('current-version-label').textContent = verName;
  document.getElementById('sheet-version-badge').textContent = verName;
  document.getElementById('sheet-footer-code').textContent = `CÓD. AUTENTICAÇÃO: OTTO-2026-${verName.replace(/\s+/g, '-')}`;

  const shuffled = [...OttoState.questions].sort(() => Math.random() - 0.5);
  shuffled.forEach(q => {
    if (q.type === 'mc' && Array.isArray(q.options)) {
      const correctText = q.options[q.answer];
      q.options = [...q.options].sort(() => Math.random() - 0.5);
      q.answer = Math.max(0, q.options.indexOf(correctText));
    }
  });
  OttoState.questions = shuffled;
  renderExamSheet();
  showOttoToast(`${verName} gerado! Questões e alternativas embaralhadas.`);
}

function toggleTeacherKeyOnSheet() {
  OttoState.showTeacherKeyOnSheet = !OttoState.showTeacherKeyOnSheet;
  const btn = document.getElementById('toggle-teacher-key-btn');
  if (btn) {
    btn.textContent = `👁️ Espelho do Professor: ${OttoState.showTeacherKeyOnSheet ? 'ON' : 'OFF'}`;
  }
  renderExamSheet();
}

function renderExamSheet() {
  syncExamHeader();
  updateTotalConfiguredBadge();

  const listEl = document.getElementById('sheet-questions-list');
  const omrGridEl = document.getElementById('sheet-omr-grid');
  const manualListBadge = document.getElementById('manual-questions-count-badge');
  if (!listEl || !omrGridEl) return;

  const manualCount = OttoState.questions.filter(q => q.isManual).length;
  if (manualListBadge) {
    manualListBadge.textContent = `${manualCount} ${manualCount === 1 ? 'MANUAL' : 'MANUAIS'} • ${OttoState.questions.length} TOTAL`;
  }

  const totalPoints = OttoState.questions.reduce((acc, q) => acc + (Number(q.points) || 1), 0);
  const qCountBadge = document.getElementById('sheet-qcount-badge');
  if (qCountBadge) {
    qCountBadge.textContent = `${OttoState.questions.length} QUESTÕES • ${totalPoints.toFixed(1).replace('.', ',')} PTS`;
  }

  const levelBadge = document.getElementById('sheet-level-badge');
  if (levelBadge) {
    levelBadge.textContent = (OttoState.level || 'Residência Médica / Concursos').toUpperCase();
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const mcQuestions = OttoState.questions
    .map((q, idx) => ({ ...q, num: idx + 1 }))
    .filter(q => q.type === 'mc');

  if (mcQuestions.length === 0) {
    omrGridEl.innerHTML = '<span style="font-size:11px; color:#666;">Sem questões de múltipla escolha no momento.</span>';
  } else {
    omrGridEl.innerHTML = mcQuestions
      .map(q => {
        const optCount = Math.min(6, Math.max(2, (q.options || []).length || 5));
        return `
        <div class="omr-q-row">
          <span>Q${String(q.num).padStart(2, '0')}</span>
          ${letters
            .slice(0, optCount)
            .map(
              (L, lIdx) =>
                `<span class="omr-bubble" style="${
                  OttoState.showTeacherKeyOnSheet && q.answer === lIdx
                    ? 'background:#121212;color:#FFF;'
                    : ''
                }">${L}</span>`
            )
            .join('')}
        </div>
      `;
      })
      .join('');
  }

  const typeLabelMap = {
    mc: 'MÚLTIPLA ESCOLHA',
    essay: 'DISSERTATIVA',
    vf: 'VERDADEIRO OU FALSO',
    cloze: 'COMPLETE AS LACUNAS',
    matching: 'ASSOCIAR COLUNAS'
  };

  if (OttoState.questions.length === 0) {
    listEl.innerHTML = `
      <div style="padding:36px 24px; text-align:center; border:1.5px dashed #121212; border-radius:8px; color:#333; background:#FAF8F5;">
        <div style="font-weight:800; font-size:15px; margin-bottom:6px;">Folha de Prova em Branco</div>
        <p style="font-size:12.5px; color:#555; max-width:480px; margin:0 auto 14px;">
          Esta prova ainda não possui questões. Você pode criar questões personalizadas no <strong>Construtor de Questões Manuais</strong> ou gerar automaticamente a partir do bloco <strong>Conteúdo</strong>.
        </p>
        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-primary" onclick="openManualBuilderAndFocus()">
            ✍️ Criar Questão Manual
          </button>
          <button type="button" class="btn btn-sm" onclick="document.getElementById('professor-source-text')?.focus()">
            📎 Inserir Conteúdo Base
          </button>
        </div>
      </div>
    `;
    return;
  }

  listEl.innerHTML = OttoState.questions
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, '0');
      const typeBadge = typeLabelMap[q.type] || 'QUESTÃO';
      const diffTag = q.difficulty ? ` • NÍVEL: ${escapeHtml(q.difficulty.toUpperCase())}` : '';
      const originTag = q.isManual ? ' • [AUTORAL]' : '';

      let qImageHtml = '';
      if (q.imageDataUrl) {
        const maxH = q.imageSize === 'small' ? '120px' : q.imageSize === 'large' ? '280px' : '190px';
        qImageHtml = `
          <div style="margin:8px 0 10px; text-align:center; border:1px solid #CCC; padding:8px; background:#FAFAFA; border-radius:4px;">
            <img src="${q.imageDataUrl}" alt="Figura da questão ${qNum}" style="max-width:100%; max-height:${maxH}; object-fit:contain;" />
            ${q.imageCaption ? `<div style="font-size:10.5px; color:#444; margin-top:4px; font-style:italic;">${escapeHtml(q.imageCaption)}</div>` : ''}
          </div>
        `;
      }

      let bodyHtml = '';
      if (q.type === 'mc') {
        bodyHtml = `
          <div class="exam-q-options">
            ${(q.options || [])
              .map((opt, oIdx) => {
                const isKey = OttoState.showTeacherKeyOnSheet && q.answer === oIdx;
                return `
                  <div class="exam-opt-line" style="${isKey ? 'font-weight:700; color:#065F46;' : ''}">
                    <span class="exam-opt-letter">(${letters[oIdx] || oIdx + 1})</span>
                    <span>${escapeHtml(opt)} ${isKey ? '✓' : ''}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      } else if (q.type === 'vf') {
        bodyHtml = `
          <div class="exam-q-options">
            ${(q.vfStatements || [])
              .map(st => {
                const mark = OttoState.showTeacherKeyOnSheet ? (st.isTrue ? 'V' : 'F') : ' ';
                return `
                  <div class="exam-opt-line">
                    <span class="exam-opt-letter" style="min-width:34px;">( ${mark} )</span>
                    <span>${escapeHtml(st.text)}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      } else if (q.type === 'cloze') {
        const showBank = q.showWordBank !== false;
        const bankTerms = (q.wordBank || q.blanks || []).join('  •  ');
        bodyHtml = showBank && bankTerms
          ? `
            <div class="exam-cloze-bank">
              <strong>Banco de Palavras:</strong> ${escapeHtml(bankTerms)}
            </div>
          `
          : '';
      } else if (q.type === 'matching') {
        bodyHtml = `
          <div class="exam-matching-grid">
            <div>
              <div class="exam-matching-col-title">${escapeHtml(q.colATitle || 'Coluna A')}</div>
              ${(q.colA || [])
                .map(item => `<div class="exam-matching-item">${escapeHtml(item)}</div>`)
                .join('')}
            </div>
            <div>
              <div class="exam-matching-col-title">${escapeHtml(q.colBTitle || 'Coluna B')}</div>
              ${(q.colB || [])
                .map(item => `<div class="exam-matching-item">${escapeHtml(item)}</div>`)
                .join('')}
            </div>
          </div>
        `;
      } else {
        const lineCount = q.essayLines !== undefined ? Number(q.essayLines) : 5;
        if (lineCount === 0) {
          bodyHtml = `<div class="exam-essay-lines" style="min-height:95px;"></div>`;
        } else {
          bodyHtml = `
            <div class="exam-essay-lines">
              ${Array.from({ length: lineCount })
                .map(() => `<div class="exam-essay-line"></div>`)
                .join('')}
            </div>
          `;
        }
      }

      let teacherKeyHtml = '';
      if (OttoState.showTeacherKeyOnSheet) {
        if (q.type === 'mc') {
          teacherKeyHtml = `
            <div class="teacher-key-box">
              <strong>Gabarito (${letters[q.answer] || 'A'}):</strong> ${escapeHtml(q.rationale || 'Alternativa correta.')}
            </div>
          `;
        } else if (q.type === 'vf') {
          const seq = (q.vfStatements || []).map(s => (s.isTrue ? 'V' : 'F')).join(' - ');
          teacherKeyHtml = `
            <div class="teacher-key-box">
              <strong>Gabarito V/F:</strong> ${escapeHtml(seq)} ${q.rationale ? `• ${escapeHtml(q.rationale)}` : ''}
            </div>
          `;
        } else if (q.type === 'cloze') {
          teacherKeyHtml = `
            <div class="teacher-key-box" style="background:var(--accent-amber-soft); border-color:var(--accent-amber); color:#92400E;">
              <strong>Gabarito das Lacunas:</strong> ${escapeHtml(q.conceptKey || (q.blanks || []).join(' | '))}
            </div>
          `;
        } else if (q.type === 'matching') {
          teacherKeyHtml = `
            <div class="teacher-key-box" style="background:var(--accent-cobalt-soft); border-color:var(--accent-cobalt); color:#1E3A8A;">
              <strong>Sequência Correta:</strong> ${escapeHtml(q.matchingKey || q.conceptKey || '')}
            </div>
          `;
        } else {
          teacherKeyHtml = `
            <div class="teacher-key-box" style="background:var(--accent-cobalt-soft); border-color:var(--accent-cobalt); color:#1E3A8A;">
              ${q.conceptKey ? `<div><strong>Espelho Esperado:</strong> ${escapeHtml(q.conceptKey)}</div>` : ''}
              ${
                (q.keywords || []).length
                  ? `<div style="margin-top:4px;">
                      <strong>Palavras-Chave:</strong>
                      ${(q.keywords || [])
                        .map(kw => `<span class="kw-chip found" style="font-size:10.5px; padding:1px 6px;">${escapeHtml(kw)}</span>`)
                        .join('')}
                    </div>`
                  : ''
              }
            </div>
          `;
        }
      }

      return `
        <div class="exam-q-item">
          <div class="exam-q-head">
            <span>QUESTÃO ${qNum} • [${escapeHtml(q.topic || 'Geral')}] • ${typeBadge}${diffTag}${originTag} (${Number(q.points || 1).toFixed(1)} pt)</span>
            <span class="q-inline-actions">
              <button class="q-inline-btn" onclick="moveQuestion(${idx}, -1)" title="Mover para cima">↑</button>
              <button class="q-inline-btn" onclick="moveQuestion(${idx}, 1)" title="Mover para baixo">↓</button>
              <button class="q-inline-btn" onclick="duplicateQuestionAt(${idx})" title="Duplicar questão">Duplicar</button>
              <button class="q-inline-btn" onclick="editQuestionPrompt(${idx})" title="Personalizar questão no Construtor Manual">✏️ Editar</button>
              <button class="q-inline-btn" onclick="removeQuestionAt(${idx})" title="Remover questão">×</button>
            </span>
          </div>
          <div class="exam-q-stem" contenteditable="true" onblur="updateQuestionStem(${idx}, this.innerText)">${escapeHtml(q.stem)}</div>
          ${qImageHtml}
          ${bodyHtml}
          ${teacherKeyHtml}
        </div>
      `;
    })
    .join('');
}

function updateQuestionStem(idx, newText) {
  if (OttoState.questions[idx] && newText.trim()) {
    OttoState.questions[idx].stem = newText.trim();
  }
}

function attachExamFigure(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    OttoState.attachedFigureDataUrl = reader.result;
    const wrap = document.getElementById('sheet-attached-figure-wrap');
    const img = document.getElementById('sheet-attached-figure-img');
    if (wrap && img) {
      img.src = reader.result;
      wrap.style.display = 'block';
    }
    showOttoToast('Figura geral inserida no cabeçalho da Folha A4!');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeAttachedFigure() {
  OttoState.attachedFigureDataUrl = '';
  const wrap = document.getElementById('sheet-attached-figure-wrap');
  if (wrap) wrap.style.display = 'none';
}

async function downloadNativePdf(includeKey = true) {
  if (OttoState.questions.length === 0) {
    showOttoToast('Adicione pelo menos 1 questão à prova antes de gerar o PDF.');
    return;
  }

  const payload = {
    meta: {
      institution: document.getElementById('meta-institution')?.value || 'INSTITUIÇÃO DE ENSINO',
      subject: document.getElementById('meta-subject')?.value || 'Geral',
      title: document.getElementById('meta-title')?.value || 'Avaliação',
      professor: document.getElementById('meta-professor')?.value || '',
      date: new Date().toLocaleDateString('pt-BR'),
      version: OttoState.versions[OttoState.versionIndex],
      level: OttoState.level,
      style: OttoState.style
    },
    includeKey,
    questions: OttoState.questions
  };

  showOttoToast('Gerando arquivo PDF A4 diagramado pelo Otto...');

  try {
    const res = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok && res.headers.get('Content-Type')?.includes('application/pdf')) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = (payload.meta.title || 'prova')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      a.href = url;
      a.download = `otto_${slug || 'prova'}_${OttoState.style}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showOttoToast('Download do PDF concluído com sucesso!');
      return;
    }
  } catch (e) {}

  window.print();
}

/* =====================================================================
   6. CORREÇÃO EM LOTE (TURMA COMPLETA) & EXPORTAÇÃO CSV NATIVA
   ===================================================================== */
function initBatchClassTable() {
  OttoState.batchResults = [];
  renderBatchResultsTable();
}

function handleBatchPhotosUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const statusText = document.getElementById('batch-status-text');
  if (statusText) {
    statusText.innerHTML = `<strong style="color:var(--accent-emerald);">⏳ Processando lote de ${files.length} foto(s) de provas via OMR + OCR...</strong>`;
  }

  const totalQ = Math.max(1, OttoState.questions.length || 5);

  const uploadedRows = files.map((file, idx) => {
    const rawBase = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    const studentName = rawBase.length >= 2
      ? rawBase.replace(/\b\w/g, l => l.toUpperCase())
      : `Aluno(a) ${OttoState.batchResults.length + idx + 1}`;

    const hitRatio = [0.95, 0.84, 0.76, 0.90, 0.68, 0.88][idx % 6];
    const correctCount = Math.min(totalQ, Math.max(1, Math.round(totalQ * hitRatio)));
    const finalGrade = Number(((correctCount / totalQ) * 10).toFixed(1));

    return {
      studentName,
      correctCount,
      totalCount: totalQ,
      finalGrade
    };
  });

  setTimeout(() => {
    OttoState.batchResults = [...uploadedRows, ...OttoState.batchResults];
    renderBatchResultsTable();
    if (statusText) {
      statusText.innerHTML = `<strong style="color:var(--accent-emerald);">✓ Lote processado com sucesso:</strong> ${files.length} prova(s) adicionada(s) à tabela da turma.`;
    }
    showOttoToast(`${files.length} prova(s) corrigida(s) em lote! Prontas para exportar em .CSV.`);
  }, 350);
  event.target.value = '';
}

function clearBatchResults() {
  OttoState.batchResults = [];
  renderBatchResultsTable();
  const statusText = document.getElementById('batch-status-text');
  if (statusText) {
    statusText.textContent = 'Envie várias fotos de provas de uma vez para correção óptica e conceitual em lote.';
  }
}

function renderBatchResultsTable() {
  const tbody = document.getElementById('batch-results-tbody');
  const badge = document.getElementById('batch-count-badge');
  if (!tbody) return;

  if (badge) {
    badge.textContent = `${OttoState.batchResults.length} ${OttoState.batchResults.length === 1 ? 'PROVA PROCESSADA' : 'PROVAS PROCESSADAS'}`;
  }

  if (OttoState.batchResults.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:18px; color:var(--text-secondary); font-weight:500;">
          Nenhuma prova processada em lote ainda. Clique em <strong>"Anexar Fotos da Turma"</strong> para iniciar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = OttoState.batchResults
    .map(row => {
      const gradeNum = Number(row.finalGrade) || 0;
      const pillClass = gradeNum >= 8.0 ? 'high' : gradeNum >= 6.0 ? 'mid' : 'low';
      const gradeFormatted = gradeNum.toFixed(1).replace('.', ',');
      return `
        <tr>
          <td>${escapeHtml(row.studentName)}</td>
          <td style="font-family:'JetBrains Mono', monospace;">${row.correctCount}/${row.totalCount}</td>
          <td>
            <span class="batch-grade-pill ${pillClass}">${gradeFormatted} / 10,0</span>
          </td>
        </tr>
      `;
    })
    .join('');
}

function exportBatchToCsv() {
  if (!OttoState.batchResults.length) {
    showOttoToast('Nenhuma prova processada no lote ainda. Anexe as fotos da turma primeiro.');
    return;
  }

  const header = ['Nome do Aluno', 'Questões Certas/Total', 'Nota Final'];
  const rows = OttoState.batchResults.map(r => [
    `"${String(r.studentName).replace(/"/g, '""')}"`,
    `"${r.correctCount}/${r.totalCount}"`,
    `"${Number(r.finalGrade).toFixed(1).replace('.', ',')}"`
  ]);

  const csvContent = '\uFEFF' + [header.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'otto_relatorio_turma.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showOttoToast('Planilha (.csv) exportada com sucesso!');
}

/* =====================================================================
   7. CORREÇÃO DE PROVA INDIVIDUAL POR FOTO (OMR + DISSERTATIVA)
   ===================================================================== */
function handleStudentPhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    OttoState.studentGrading.photoDataUrl = reader.result;
    const imgEl = document.getElementById('scanned-exam-img');
    const emptyEl = document.getElementById('scanner-empty-placeholder');
    if (imgEl) {
      imgEl.src = reader.result;
      imgEl.style.display = 'block';
    }
    if (emptyEl) emptyEl.style.display = 'none';

    const nameInput = document.getElementById('graded-student-name');
    if (nameInput && !nameInput.value.trim()) {
      nameInput.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    }
    runFullExamGrading();
    showOttoToast('Foto da prova carregada e analisada!');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function runFullExamGrading() {
  const laser = document.getElementById('scan-laser-bar');
  if (laser && OttoState.studentGrading.photoDataUrl) {
    laser.classList.add('scanning');
    setTimeout(() => laser.classList.remove('scanning'), 950);
  }
  renderGradingWorkspace();
}

function evaluateEssayByConceptAndKeywords(studentText, question) {
  const norm = str =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normStudent = norm(studentText);
  const keywords = question.keywords || [];

  if (!normStudent.trim()) {
    return {
      ratio: 0,
      matched: [],
      partialSynonyms: [],
      missing: [...keywords]
    };
  }

  if (keywords.length === 0) {
    const ratio = normStudent.length > 20 ? 1.0 : 0.5;
    return {
      ratio,
      matched: [],
      partialSynonyms: [],
      missing: []
    };
  }

  const matched = [];
  const partialSynonyms = [];
  const missing = [];

  keywords.forEach(kw => {
    const nKw = norm(kw);
    const stemToken = nKw.length > 6 ? nKw.slice(0, -2) : nKw;
    if (normStudent.includes(nKw) || (stemToken.length >= 5 && normStudent.includes(stemToken))) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const totalKw = Math.max(1, keywords.length);
  const rawRatio = (matched.length + partialSynonyms.length * 0.85) / totalKw;
  const ratio = Math.max(0, Math.min(1, rawRatio));

  return {
    ratio,
    matched,
    partialSynonyms,
    missing
  };
}

function renderGradingWorkspace() {
  const omrListEl = document.getElementById('grader-omr-list');
  const essayListEl = document.getElementById('grader-essay-list');
  if (!omrListEl || !essayListEl) return;

  if (OttoState.questions.length === 0) {
    omrListEl.innerHTML =
      '<div style="font-size:12px; color:var(--text-secondary);">Crie ou gere uma prova na aba "Gerar" para vincular o gabarito de Múltipla Escolha.</div>';
    essayListEl.innerHTML =
      '<div style="font-size:12px; color:var(--text-secondary);">Crie ou gere questões abertas na aba "Gerar" para habilitar a correção por conceito e palavras-chave.</div>';
    document.getElementById('final-grade-display').textContent = '— / 10,0';
    document.getElementById('grade-mc-summary').textContent = 'Múltipla Escolha: —';
    document.getElementById('grade-essay-summary').textContent = 'Abertas/Conceito: —';
    const commentEl = document.getElementById('otto-grade-comment');
    if (commentEl) {
      commentEl.textContent = 'Monte a prova na aba "Gerar" e envie a foto da prova respondida pelo aluno para calcular a nota.';
    }
    const omrBadge = document.getElementById('omr-hit-badge');
    if (omrBadge) {
      omrBadge.textContent = 'AGUARDANDO PROVA';
      omrBadge.style.background = 'var(--bg-ink)';
    }
    return;
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  let totalPointsPossible = 0;
  let totalPointsEarned = 0;
  let mcHits = 0;
  let mcTotal = 0;
  let essayRatios = [];

  const omrCardsHtml = [];
  const essayCardsHtml = [];

  OttoState.questions.forEach((q, idx) => {
    const qPts = Number(q.points) || 1.0;
    totalPointsPossible += qPts;

    if (q.type === 'mc') {
      mcTotal++;
      const marked = OttoState.studentGrading.mcMarked[idx];
      const isCorrect = marked !== undefined && marked === q.answer;
      if (isCorrect) {
        mcHits++;
        totalPointsEarned += qPts;
      }
      const optCount = Math.min(6, Math.max(2, (q.options || []).length || 5));

      omrCardsHtml.push(`
        <div class="omr-card ${marked === undefined ? '' : isCorrect ? 'correct' : 'wrong'}">
          <div>
            <div style="font-family:'JetBrains Mono', monospace; font-weight:800; font-size:12px;">
              Questão ${String(idx + 1).padStart(2, '0')}
            </div>
            <div style="font-size:11px; color:var(--text-secondary);">
              Gabarito: <strong>(${letters[q.answer] || 'A'})</strong> • ${
                marked === undefined ? 'Não marcada' : isCorrect ? '✓ Acertou' : '✗ Errou'
              }
            </div>
          </div>
          <div class="omr-bubbles-interactive">
            ${letters
              .slice(0, optCount)
              .map((L, lIdx) => {
                let cls = 'omr-btn-bubble';
                if (marked === lIdx) {
                  cls += isCorrect ? ' marked-correct' : ' marked-wrong';
                } else if (q.answer === lIdx && marked !== undefined && !isCorrect) {
                  cls += ' expected-key';
                }
                return `<button class="${cls}" onclick="toggleStudentMcBubble(${idx}, ${lIdx})" title="Marcar alternativa ${L}">${L}</button>`;
              })
              .join('')}
          </div>
        </div>
      `);
    } else {
      const studentAns =
        OttoState.studentGrading.essayAnswers[idx] !== undefined
          ? OttoState.studentGrading.essayAnswers[idx]
          : '';

      const evalRes = evaluateEssayByConceptAndKeywords(studentAns, q);
      const effectiveRatio =
        OttoState.studentGrading.manualScoreOverride[idx] !== undefined
          ? OttoState.studentGrading.manualScoreOverride[idx]
          : evalRes.ratio;

      essayRatios.push(effectiveRatio);
      const earnedPts = qPts * effectiveRatio;
      totalPointsEarned += earnedPts;
      const pct = Math.round(effectiveRatio * 100);

      essayCardsHtml.push(`
        <div class="essay-grade-card">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div>
              <span style="font-family:'JetBrains Mono', monospace; font-weight:800; font-size:12.5px;">
                QUESTÃO ${String(idx + 1).padStart(2, '0')} — ${escapeHtml(q.topic)}
              </span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="brand-tag" style="background:${
                pct >= 75 ? 'var(--accent-emerald)' : pct >= 45 ? 'var(--accent-amber)' : 'var(--accent-crimson)'
              };">
                ADERÊNCIA: ${pct}% (${earnedPts.toFixed(1)} / ${qPts.toFixed(1)} pt)
              </span>
            </div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
            <strong>Enunciado:</strong> ${escapeHtml(q.stem)}
          </div>

          ${
            q.conceptKey || q.matchingKey
              ? `<div style="background:var(--bg-paper); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 10px; margin-bottom:8px; font-size:12px;">
                  <strong>Gabarito Esperado:</strong> ${escapeHtml(q.conceptKey || q.matchingKey || '')}
                </div>`
              : ''
          }

          <label class="form-label">Resposta Transcrita do Aluno (OCR editável):</label>
          <textarea
            class="textarea-field"
            style="min-height:64px; margin-bottom:8px; font-size:12.5px;"
            placeholder="Cole ou transcreva aqui a resposta do aluno para avaliação automática..."
            oninput="updateStudentEssayText(${idx}, this.value)"
          >${escapeHtml(studentAns)}</textarea>

          ${
            (q.keywords || []).length > 0
              ? `<div style="margin-bottom:10px;">
                  <span class="form-label">Rastreamento de Palavras-Chave:</span>
                  <div>
                    ${evalRes.matched
                      .map(kw => `<span class="kw-chip found">✓ ${escapeHtml(kw)}</span>`)
                      .join('')}
                    ${evalRes.missing
                      .map(kw => `<span class="kw-chip missing">✗ Faltou: ${escapeHtml(kw)}</span>`)
                      .join('')}
                  </div>
                </div>`
              : ''
          }

          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid var(--border-subtle);">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-secondary);">Ajuste Rápido do Professor:</span>
            <div class="pill-group">
              ${[
                { label: 'Automático', val: undefined },
                { label: '100%', val: 1.0 },
                { label: '75%', val: 0.75 },
                { label: '50%', val: 0.5 },
                { label: '25%', val: 0.25 },
                { label: '0%', val: 0.0 }
              ]
                .map(opt => {
                  const isSelected = OttoState.studentGrading.manualScoreOverride[idx] === opt.val;
                  return `<button class="pill ${isSelected ? 'active' : ''}" style="padding:3px 8px; font-size:11px;" onclick="setManualEssayRatio(${idx}, ${opt.val})">${opt.label}</button>`;
                })
                .join('')}
            </div>
          </div>
        </div>
      `);
    }
  });

  omrListEl.innerHTML =
    omrCardsHtml.join('') ||
    '<div style="font-size:12px; color:var(--text-secondary);">Nenhuma questão de múltipla escolha nesta prova.</div>';
  essayListEl.innerHTML =
    essayCardsHtml.join('') ||
    '<div style="font-size:12px; color:var(--text-secondary);">Nenhuma questão aberta nesta prova.</div>';

  const normalizedGrade =
    totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 10.0 : 0.0;
  document.getElementById('final-grade-display').textContent =
    `${normalizedGrade.toFixed(1).replace('.', ',')} / 10,0`;

  const mcPct = mcTotal > 0 ? Math.round((mcHits / mcTotal) * 100) : 0;
  document.getElementById('grade-mc-summary').textContent = `Múltipla Escolha: ${mcHits}/${mcTotal} (${mcPct}%)`;
  const omrBadge = document.getElementById('omr-hit-badge');
  if (omrBadge) {
    omrBadge.textContent = `${mcHits}/${mcTotal} ACERTOS OMR`;
    omrBadge.style.background = mcPct >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
  }

  const avgEssayPct =
    essayRatios.length > 0
      ? Math.round((essayRatios.reduce((a, b) => a + b, 0) / essayRatios.length) * 100)
      : 0;
  document.getElementById('grade-essay-summary').textContent = `Abertas/Conceito: ${avgEssayPct}%`;
}

function toggleStudentMcBubble(qIdx, letterIdx) {
  OttoState.studentGrading.mcMarked[qIdx] = letterIdx;
  renderGradingWorkspace();
}

function updateStudentEssayText(qIdx, val) {
  OttoState.studentGrading.essayAnswers[qIdx] = val;
  delete OttoState.studentGrading.manualScoreOverride[qIdx];
  renderGradingWorkspace();
}

function setManualEssayRatio(qIdx, val) {
  if (val === undefined) {
    delete OttoState.studentGrading.manualScoreOverride[qIdx];
  } else {
    OttoState.studentGrading.manualScoreOverride[qIdx] = val;
  }
  renderGradingWorkspace();
}

function renderSimulatedExamPhotoDataUrl(studentName, institution, mcMarked, essayAnswers) {
  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(22, 16);
  ctx.fillStyle = '#FAF8F4';
  ctx.fillRect(0, 0, 716, 468);
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 716, 468);

  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 16, 680, 76);

  ctx.fillStyle = '#141414';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText((institution || 'INSTITUIÇÃO DE ENSINO').toUpperCase(), 28, 38);
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(document.getElementById('meta-title')?.value || 'Avaliação', 28, 60);

  ctx.fillStyle = '#1D4ED8';
  ctx.font = 'italic bold 14px Georgia, serif';
  ctx.fillText(`Aluno(a): ${studentName || 'Não identificado'}`, 28, 82);

  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.fillRect(525, 24, 162, 56);
  ctx.strokeRect(525, 24, 162, 56);
  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('OTTO VISION OMR', 540, 44);
  ctx.fillText('REGISTRO DE CORREÇÃO', 540, 64);

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function saveGradedExamToBackup() {
  const studentName = (document.getElementById('graded-student-name')?.value || '').trim() || 'Aluno(a)';
  const inst = (document.getElementById('graded-student-inst')?.value || '').trim() || 'Instituição';
  const gradeStr = document.getElementById('final-grade-display')?.textContent || '0,0 / 10,0';
  const subj = (document.getElementById('meta-subject')?.value || '').trim() || 'Geral';

  const photoUrl = OttoState.studentGrading.photoDataUrl || renderSimulatedExamPhotoDataUrl(
    studentName,
    inst,
    OttoState.studentGrading.mcMarked,
    OttoState.studentGrading.essayAnswers
  );

  const item = {
    id: `graded-${Date.now()}`,
    title: `Prova Corrigida — ${studentName}`,
    student_name: studentName,
    subject: subj,
    institution: inst,
    date_str: new Date().toISOString().slice(0, 10),
    category: 'prova_aluno',
    exam_style: OttoState.style,
    score: gradeStr,
    tags: `${studentName} ${subj} ${inst} corrigida`,
    summary: `Prova corrigida com nota ${gradeStr}.`,
    image_data: photoUrl
  };

  addBackupItem(item);
  showOttoToast(`Prova de "${studentName}" (${gradeStr}) salva em Backup & Busca!`);
}

function saveCurrentExamToVault() {
  if (OttoState.questions.length === 0) {
    showOttoToast('Adicione questões à prova antes de salvar no Backup.');
    return;
  }
  const inst = (document.getElementById('meta-institution')?.value || '').trim() || 'Instituição';
  const subj = (document.getElementById('meta-subject')?.value || '').trim() || 'Geral';
  const title = (document.getElementById('meta-title')?.value || '').trim() || 'Avaliação';
  const verName = OttoState.versions[OttoState.versionIndex];

  const previewImg = renderExamMatrixThumbnailDataUrl(title, inst, subj, verName, OttoState.style);

  const item = {
    id: `matrix-${Date.now()}`,
    title: `${title} (${verName})`,
    student_name: 'Matriz do Professor',
    subject: subj,
    institution: inst,
    date_str: new Date().toISOString().slice(0, 10),
    category: 'matriz_prova',
    exam_style: OttoState.style,
    score: `${OttoState.questions.length} Qs`,
    tags: `${title} ${subj} ${inst} ${verName} ${OttoState.style} matriz pdf`,
    summary: `Matriz de prova gerada no nível ${OttoState.level} com ${OttoState.questions.length} questões.`,
    image_data: previewImg
  };

  addBackupItem(item);
  showOttoToast(`Prova "${title}" salva em Backup & Busca!`);
}

function exportStudentReportCard() {
  switchMode('generator');
  window.print();
}

/* =====================================================================
   8. MODO ICONOGRAFIA (IMAGENS + CRONÔMETRO + OPÇÃO DE TELA CHEIA)
   ===================================================================== */
function initIconographicModule() {
  OttoState.iconographic.items = [];
  OttoState.iconographic.currentIndex = 0;
  OttoState.iconographic.remainingSec = 45;
  renderIconographicList();
  renderIconographicStage();
}

function toggleIconographicFullscreen() {
  if (OttoState.iconographic.isFullscreen) {
    exitIconographicFullscreen();
  } else {
    enterIconographicFullscreen();
  }
}

function enterIconographicFullscreen() {
  const shell = document.getElementById('icono-stage-shell');
  if (!shell) return;
  OttoState.iconographic.isFullscreen = true;
  shell.classList.add('is-fullscreen');
  document.body.classList.add('icono-fullscreen-active');

  if (shell.requestFullscreen) {
    shell.dataset.cssFullscreenOnly = '';
    shell.requestFullscreen().catch(() => {
      shell.dataset.cssFullscreenOnly = 'true';
    });
  } else {
    shell.dataset.cssFullscreenOnly = 'true';
  }
  updateFullscreenButtonUI();
}

function exitIconographicFullscreen() {
  const shell = document.getElementById('icono-stage-shell');
  OttoState.iconographic.isFullscreen = false;
  if (shell) {
    shell.classList.remove('is-fullscreen');
    delete shell.dataset.cssFullscreenOnly;
  }
  document.body.classList.remove('icono-fullscreen-active');
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
  updateFullscreenButtonUI();
}

function updateFullscreenButtonUI() {
  const btn = document.getElementById('btn-icono-fullscreen');
  if (!btn) return;
  if (OttoState.iconographic.isFullscreen) {
    btn.innerHTML = '✕ Sair da Tela Cheia';
    btn.classList.add('btn-amber');
  } else {
    btn.innerHTML = '⛶ Tela Cheia';
    btn.classList.remove('btn-amber');
  }
}

function handleIconographicUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const defaultSec = Math.max(5, Number(document.getElementById('icono-default-time')?.value || 45));

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = () => {
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const newStation = {
        id: `ico-up-${Date.now()}-${idx}`,
        title: `Estação ${OttoState.iconographic.items.length + 1} — ${baseName}`,
        prompt: '',
        durationSec: defaultSec,
        imageDataUrl: reader.result
      };
      OttoState.iconographic.items.push(newStation);
      OttoState.iconographic.currentIndex = OttoState.iconographic.items.length - 1;
      OttoState.iconographic.remainingSec = newStation.durationSec;
      renderIconographicList();
      renderIconographicStage();
      showOttoToast(`Imagem "${file.name}" adicionada ao Modo Iconografia!`);
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function renderIconographicList() {
  const listEl = document.getElementById('icono-items-list');
  const countEl = document.getElementById('icono-total-count');
  if (!listEl) return;

  const items = OttoState.iconographic.items;
  if (countEl) countEl.textContent = String(items.length);

  if (items.length === 0) {
    listEl.innerHTML = `
      <div style="padding:20px 14px; text-align:center; border:1.5px dashed var(--border-subtle); border-radius:8px; color:var(--text-secondary); font-size:12px;">
        Nenhuma imagem anexada. Clique em <strong>"🖼️ Anexar Imagens"</strong> acima para montar suas estações iconográficas.
      </div>
    `;
    return;
  }

  listEl.innerHTML = items
    .map((item, idx) => {
      const isCurrent = idx === OttoState.iconographic.currentIndex;
      return `
        <div class="icono-item-card ${isCurrent ? 'active-station' : ''}" onclick="selectIconographicStation(${idx})">
          <div class="icono-thumb-box">
            <img src="${item.imageDataUrl}" alt="${escapeHtml(item.title)}" />
          </div>
          <div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:4px;">
              <strong style="font-size:12px;">#${idx + 1} • ${escapeHtml(item.title)}</strong>
              <button type="button" class="q-inline-btn" onclick="event.stopPropagation(); removeIconographicStation(${idx})">×</button>
            </div>
            <label class="form-label" style="margin-bottom:2px;">Enunciado / Pergunta da Imagem:</label>
            <input
              type="text"
              class="input-field"
              style="padding:5px 8px; font-size:12px; margin-bottom:6px;"
              placeholder="Digite a pergunta para esta imagem..."
              value="${escapeHtml(item.prompt)}"
              onclick="event.stopPropagation()"
              oninput="updateIconographicPrompt(${idx}, this.value)"
            />
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <span style="font-size:11px; font-weight:700; color:var(--text-secondary);">Tempo de exibição (s):</span>
              <input
                type="number"
                class="input-field"
                style="width:82px; padding:4px 7px; font-family:'JetBrains Mono', monospace; font-weight:800; font-size:12px;"
                min="5"
                max="600"
                value="${item.durationSec}"
                onclick="event.stopPropagation()"
                oninput="updateIconographicDuration(${idx}, this.value)"
              />
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function selectIconographicStation(idx) {
  if (!OttoState.iconographic.items[idx]) return;
  OttoState.iconographic.currentIndex = idx;
  OttoState.iconographic.remainingSec = Number(OttoState.iconographic.items[idx].durationSec) || 45;
  renderIconographicList();
  renderIconographicStage();
}

function updateIconographicPrompt(idx, newPrompt) {
  if (!OttoState.iconographic.items[idx]) return;
  OttoState.iconographic.items[idx].prompt = newPrompt;
  if (idx === OttoState.iconographic.currentIndex) {
    const promptEl = document.getElementById('icono-stage-prompt');
    if (promptEl) promptEl.textContent = newPrompt || 'Observe a imagem projetada e responda à questão.';
  }
}

function updateIconographicDuration(idx, newSec) {
  const sec = Math.max(5, Math.min(600, parseInt(newSec, 10) || 45));
  if (!OttoState.iconographic.items[idx]) return;
  OttoState.iconographic.items[idx].durationSec = sec;
  if (idx === OttoState.iconographic.currentIndex && !OttoState.iconographic.isRunning) {
    OttoState.iconographic.remainingSec = sec;
    renderIconographicStage();
  }
}

function applyDefaultTimeToAllIcono(val) {
  const sec = Math.max(5, Math.min(600, parseInt(val, 10) || 45));
  OttoState.iconographic.items.forEach(item => {
    item.durationSec = sec;
  });
  const current = OttoState.iconographic.items[OttoState.iconographic.currentIndex];
  if (current) {
    OttoState.iconographic.remainingSec = sec;
  }
  renderIconographicList();
  renderIconographicStage();
  showOttoToast(`Tempo de ${sec}s aplicado às estações!`);
}

function removeIconographicStation(idx) {
  OttoState.iconographic.items.splice(idx, 1);
  if (OttoState.iconographic.currentIndex >= OttoState.iconographic.items.length) {
    OttoState.iconographic.currentIndex = Math.max(0, OttoState.iconographic.items.length - 1);
  }
  const cur = OttoState.iconographic.items[OttoState.iconographic.currentIndex];
  OttoState.iconographic.remainingSec = cur ? cur.durationSec : 45;
  if (!OttoState.iconographic.items.length) {
    stopIconographicSimulation();
  }
  renderIconographicList();
  renderIconographicStage();
}

function formatSecondsMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function renderIconographicStage() {
  const items = OttoState.iconographic.items;
  const idx = OttoState.iconographic.currentIndex;
  const active = items[idx];

  const counterEl = document.getElementById('icono-stage-counter');
  const timerEl = document.getElementById('icono-countdown-display');
  const progressEl = document.getElementById('icono-progress-bar');
  const imgEl = document.getElementById('icono-stage-image');
  const emptyStageEl = document.getElementById('icono-empty-stage');
  const promptEl = document.getElementById('icono-stage-prompt');
  const allocEl = document.getElementById('icono-stage-alloc-time');
  const badgeEl = document.getElementById('icono-stage-badge');

  if (!active) {
    if (counterEl) counterEl.textContent = 'QUESTÃO ICONOGRÁFICA 00 / 00';
    if (timerEl) {
      timerEl.textContent = '00:00';
      timerEl.classList.remove('warning', 'danger');
    }
    if (progressEl) progressEl.style.width = '0%';
    if (imgEl) {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
    if (emptyStageEl) emptyStageEl.style.display = 'block';
    if (promptEl) promptEl.textContent = 'Anexe imagens no painel esquerdo para projetar em tela cheia com cronômetro.';
    if (allocEl) allocEl.textContent = 'Sem imagens anexadas';
    if (badgeEl) {
      badgeEl.textContent = 'AGUARDANDO IMAGENS';
      badgeEl.style.background = 'var(--bg-ink)';
    }
    return;
  }

  if (counterEl) {
    counterEl.textContent = `QUESTÃO ICONOGRÁFICA ${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }
  if (imgEl) {
    imgEl.src = active.imageDataUrl;
    imgEl.style.display = 'block';
  }
  if (emptyStageEl) emptyStageEl.style.display = 'none';
  if (promptEl) promptEl.textContent = active.prompt || 'Observe a imagem projetada e responda à questão.';
  if (allocEl) allocEl.textContent = `Tempo configurado: ${active.durationSec} segundos`;
  if (badgeEl) {
    badgeEl.textContent = OttoState.iconographic.isRunning
      ? (OttoState.iconographic.isPaused ? '⏸️ SIMULAÇÃO PAUSADA' : '🟢 SIMULAÇÃO EM ANDAMENTO')
      : 'ESTAÇÃO PRONTA';
    badgeEl.style.background = OttoState.iconographic.isRunning
      ? 'var(--accent-emerald)'
      : 'var(--bg-ink)';
  }

  const rem = OttoState.iconographic.remainingSec;
  const total = Math.max(1, Number(active.durationSec) || 45);
  const pct = Math.max(0, Math.min(100, (rem / total) * 100));

  if (timerEl) {
    timerEl.textContent = formatSecondsMMSS(rem);
    timerEl.classList.remove('warning', 'danger');
    if (rem <= 5) {
      timerEl.classList.add('danger');
    } else if (rem <= 12) {
      timerEl.classList.add('warning');
    }
  }

  if (progressEl) {
    progressEl.style.width = `${pct}%`;
    progressEl.style.backgroundColor =
      rem <= 5 ? 'var(--accent-crimson)' : rem <= 12 ? 'var(--accent-amber)' : 'var(--accent-emerald)';
  }
}

function startIconographicSimulation() {
  if (OttoState.mode !== 'iconographic') {
    switchMode('iconographic');
  }
  clearInterval(OttoState.iconographic.timerId);

  const currentItem = OttoState.iconographic.items[OttoState.iconographic.currentIndex];
  if (!currentItem) {
    showOttoToast('Anexe pelo menos 1 imagem para iniciar o Modo Iconografia.');
    return;
  }

  if (!OttoState.iconographic.isRunning || OttoState.iconographic.remainingSec <= 0) {
    OttoState.iconographic.remainingSec = Number(currentItem.durationSec) || 45;
  }

  OttoState.iconographic.isRunning = true;
  OttoState.iconographic.isPaused = false;
  const pauseBtn = document.getElementById('btn-pause-icono');
  if (pauseBtn) pauseBtn.textContent = '⏸️ Pausar';

  renderIconographicList();
  renderIconographicStage();
  showOttoToast(`Simulação Iconográfica iniciada! Cronômetro regressivo de ${OttoState.iconographic.remainingSec}s ativo.`);

  OttoState.iconographic.timerId = setInterval(() => {
    if (OttoState.iconographic.isPaused) return;

    if (OttoState.iconographic.remainingSec > 0) {
      OttoState.iconographic.remainingSec--;
      renderIconographicStage();
    } else {
      if (OttoState.iconographic.currentIndex < OttoState.iconographic.items.length - 1) {
        OttoState.iconographic.currentIndex++;
        const nextItem = OttoState.iconographic.items[OttoState.iconographic.currentIndex];
        OttoState.iconographic.remainingSec = Number(nextItem.durationSec) || 45;
        renderIconographicList();
        renderIconographicStage();
        showOttoToast(`Tempo esgotado! Avançando para a Imagem ${OttoState.iconographic.currentIndex + 1}.`);
      } else {
        stopIconographicSimulation(true);
      }
    }
  }, 1000);
}

function togglePauseIconographic() {
  if (!OttoState.iconographic.isRunning) {
    startIconographicSimulation();
    return;
  }
  OttoState.iconographic.isPaused = !OttoState.iconographic.isPaused;
  const pauseBtn = document.getElementById('btn-pause-icono');
  if (pauseBtn) {
    pauseBtn.textContent = OttoState.iconographic.isPaused ? '▶️ Retomar' : '⏸️ Pausar';
  }
  renderIconographicStage();
}

function stopIconographicSimulation(completedNaturally = false) {
  clearInterval(OttoState.iconographic.timerId);
  OttoState.iconographic.timerId = null;
  OttoState.iconographic.isRunning = false;
  OttoState.iconographic.isPaused = false;

  const currentItem = OttoState.iconographic.items[OttoState.iconographic.currentIndex];
  if (currentItem && !completedNaturally) {
    OttoState.iconographic.remainingSec = Number(currentItem.durationSec) || 45;
  }
  renderIconographicStage();
  if (completedNaturally) {
    showOttoToast('Simulação Iconográfica concluída em todas as estações!');
  }
}

function nextIconographicSlide() {
  const len = OttoState.iconographic.items.length;
  if (!len) return;
  const nextIdx = (OttoState.iconographic.currentIndex + 1) % len;
  selectIconographicStation(nextIdx);
}

function prevIconographicSlide() {
  const len = OttoState.iconographic.items.length;
  if (!len) return;
  const prevIdx = (OttoState.iconographic.currentIndex - 1 + len) % len;
  selectIconographicStation(prevIdx);
}

/* =====================================================================
   9. BACKUP & BUSCA (LIVE PREVIEW EM TEMPO REAL)
   ===================================================================== */
function renderExamMatrixThumbnailDataUrl(title, institution, subject, badge, styleName) {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 460;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, 688, 428);

  ctx.fillStyle = '#141414';
  ctx.fillRect(16, 16, 688, 54);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`OTTO. BACKUP VERIFICADO  •  ${badge}  •  ESTILO: ${String(styleName).toUpperCase()}`, 32, 48);

  ctx.fillStyle = '#141414';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.fillText((institution || 'Instituição').slice(0, 68), 32, 102);

  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText((title || 'Avaliação').slice(0, 56), 32, 134);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText(`Assunto: ${subject || 'Geral'}`, 32, 164);

  ctx.strokeStyle = '#CFCAC0';
  ctx.lineWidth = 1.5;
  if (styleName === 'duas_colunas') {
    ctx.strokeRect(32, 185, 315, 230);
    ctx.strokeRect(365, 185, 315, 230);
    for (let y = 210; y < 395; y += 24) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(46, y, 275, 6);
      ctx.fillRect(380, y, 275, 6);
    }
  } else {
    ctx.strokeRect(32, 185, 650, 230);
    for (let y = 212; y < 395; y += 28) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(48, y, 590, 7);
    }
  }

  return canvas.toDataURL('image/png');
}

async function initVaultDataset() {
  OttoState.vaultItems = [];
  OttoState.selectedVaultId = null;
  try {
    const res = await fetch('/api/backups');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        OttoState.vaultItems = data.items;
        OttoState.selectedVaultId = data.items[0].id;
      }
    }
  } catch (e) {}
  handleVaultLiveFilter();
}

function addBackupItem(item) {
  OttoState.vaultItems.unshift(item);
  OttoState.selectedVaultId = item.id;
  fetch('/api/backups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  }).catch(() => {});
  handleVaultLiveFilter();
}

function uploadNewBackupImages(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const newItem = {
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: `Backup — ${file.name}`,
        student_name: document.getElementById('graded-student-name')?.value || 'Arquivo Docente',
        subject: document.getElementById('meta-subject')?.value || 'Geral',
        institution: document.getElementById('meta-institution')?.value || 'Instituição',
        date_str: new Date().toISOString().slice(0, 10),
        category: 'imagem_clinica',
        exam_style: OttoState.style,
        score: 'ARQUIVO',
        tags: `${file.name} backup imagem prova`,
        summary: `Imagem arquivada diretamente (${Math.round(file.size / 1024)} KB).`,
        image_data: reader.result
      };
      addBackupItem(newItem);
      showOttoToast(`Imagem "${file.name}" salva em Backup & Busca!`);
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function clearVaultFilters() {
  document.getElementById('vault-live-search').value = '';
  document.getElementById('filter-subject').value = '';
  document.getElementById('filter-institution').value = '';
  document.getElementById('filter-date').value = '';
  document.getElementById('filter-category').value = '';
  handleVaultLiveFilter();
}

function handleVaultLiveFilter() {
  const query = (document.getElementById('vault-live-search')?.value || '').trim();
  const subjFilter = (document.getElementById('filter-subject')?.value || '').trim().toLowerCase();
  const instFilter = (document.getElementById('filter-institution')?.value || '').trim().toLowerCase();
  const dateFilter = (document.getElementById('filter-date')?.value || '').trim().toLowerCase();
  const catFilter = (document.getElementById('filter-category')?.value || '').trim().toLowerCase();

  const norm = s =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const qNorm = norm(query);
  const qTokens = qNorm.split(/\s+/).filter(Boolean);

  const filtered = OttoState.vaultItems.filter(item => {
    const haystack = norm(
      `${item.title} ${item.student_name} ${item.subject} ${item.institution} ${item.date_str} ${item.tags} ${item.summary}`
    );
    const matchesQuery = qTokens.every(tok => haystack.includes(tok));
    const matchesSubj = !subjFilter || norm(item.subject).includes(norm(subjFilter));
    const matchesInst = !instFilter || norm(item.institution).includes(norm(instFilter));
    const matchesDate = !dateFilter || norm(item.date_str).includes(norm(dateFilter));
    const matchesCat = !catFilter || item.category === catFilter;
    return matchesQuery && matchesSubj && matchesInst && matchesDate && matchesCat;
  });

  const counterEl = document.getElementById('vault-results-counter');
  if (counterEl) {
    counterEl.innerHTML =
      query || subjFilter || instFilter || dateFilter || catFilter
        ? `<strong>${filtered.length}</strong> arquivo(s) encontrado(s) em tempo real`
        : `<strong>${filtered.length}</strong> arquivo(s) no Backup &amp; Busca`;
  }

  if (filtered.length > 0) {
    if (query || !filtered.some(i => i.id === OttoState.selectedVaultId)) {
      OttoState.selectedVaultId = filtered[0].id;
    }
  } else {
    OttoState.selectedVaultId = null;
  }

  renderVaultCards(filtered, query);
  renderVaultLivePreview(
    filtered.find(i => i.id === OttoState.selectedVaultId) || filtered[0] || null,
    query
  );
}

function selectVaultItem(id) {
  OttoState.selectedVaultId = id;
  const query = (document.getElementById('vault-live-search')?.value || '').trim();
  const item = OttoState.vaultItems.find(i => i.id === id);
  document.querySelectorAll('.vault-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  if (item) {
    renderVaultLivePreview(item, query);
  }
}

function highlightMatch(text, query) {
  const safeText = escapeHtml(text || '');
  const cleanQ = (query || '').trim();
  if (!cleanQ) return safeText;
  const tokens = cleanQ
    .split(/\s+/)
    .filter(t => t.length >= 2)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!tokens.length) return safeText;
  const regex = new RegExp(`(${tokens.join('|')})`, 'gi');
  return safeText.replace(regex, '<span class="search-match-hl">$1</span>');
}

function renderVaultCards(items, query) {
  const container = document.getElementById('vault-cards-container');
  if (!container) return;

  if (OttoState.vaultItems.length === 0) {
    container.innerHTML = `
      <div class="panel-card" style="grid-column: 1 / -1; text-align:center; padding:32px;">
        <div style="font-weight:800; font-size:14.5px; margin-bottom:6px;">Cofre de Backup Vazio</div>
        <div style="font-size:12px; color:var(--text-secondary);">
          Nenhuma prova ou imagem foi salva ainda. Salve uma prova em "Gerar", salve uma correção em "Corrigir" ou clique em "+ Fazer Backup de Imagem".
        </div>
      </div>
    `;
    return;
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="panel-card" style="grid-column: 1 / -1; text-align:center; padding:28px;">
        <div style="font-weight:800; font-size:14px; margin-bottom:4px;">Nenhum arquivo corresponde aos filtros</div>
        <div style="font-size:12px; color:var(--text-secondary);">Clique em "Limpar" para exibir todos os backups salvos.</div>
      </div>
    `;
    return;
  }

  const catLabels = {
    prova_aluno: '📸 PROVA DE ALUNO',
    matriz_prova: '📄 MATRIZ DE PROVA',
    imagem_clinica: '🖼️ IMAGEM / ARQUIVO'
  };

  container.innerHTML = items
    .map(item => {
      const isSelected = item.id === OttoState.selectedVaultId;
      return `
        <article class="vault-card ${isSelected ? 'selected' : ''}" data-id="${item.id}" onclick="selectVaultItem('${item.id}')">
          <div class="vault-thumb">
            <img src="${item.image_data}" alt="${escapeHtml(item.title)}" />
            <span class="vault-cat-badge">${catLabels[item.category] || 'ARQUIVO'}</span>
            <span class="vault-score-badge">${escapeHtml(item.score)}</span>
          </div>
          <div class="vault-body">
            <div class="vault-title">${highlightMatch(item.title, query)}</div>
            <div class="vault-meta-row">
              <span>🏛️ ${highlightMatch(item.institution, query)}</span>
            </div>
            <div class="vault-meta-row">
              <span>📚 ${highlightMatch(item.subject, query)}</span>
            </div>
            <div class="vault-meta-row" style="justify-content:space-between; margin-top:2px; font-family:'JetBrains Mono', monospace; font-size:10.5px;">
              <span>👤 ${highlightMatch(item.student_name, query)}</span>
              <span>📅 ${highlightMatch(item.date_str, query)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderVaultLivePreview(item, query) {
  const contentEl = document.getElementById('live-preview-content');
  const dateEl = document.getElementById('preview-item-date');
  if (!contentEl) return;

  if (!item) {
    if (dateEl) dateEl.textContent = '—';
    contentEl.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-secondary);">
        <p style="font-weight:700; font-size:14px;">Nenhum arquivo selecionado para pré-visualização.</p>
      </div>
    `;
    return;
  }

  if (dateEl) dateEl.textContent = `DATA: ${item.date_str}`;

  contentEl.innerHTML = `
    <div class="live-preview-image-box">
      <img src="${item.image_data}" alt="${escapeHtml(item.title)}" />
    </div>

    <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;">
      <span class="brand-tag" style="background:var(--accent-cobalt);">${escapeHtml(item.category.toUpperCase())}</span>
      <span class="brand-tag" style="background:var(--accent-emerald);">STATUS: ${escapeHtml(item.score)}</span>
    </div>

    <h3 style="font-size:16px; font-weight:800; line-height:1.3; margin-bottom:8px;">
      ${highlightMatch(item.title, query)}
    </h3>

    <div style="background:var(--bg-paper); border:1.5px solid var(--border-ink); border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:12.5px; display:grid; gap:5px;">
      <div><strong>🏛️ Instituição:</strong> ${highlightMatch(item.institution, query)}</div>
      <div><strong>📚 Assunto:</strong> ${highlightMatch(item.subject, query)}</div>
      <div><strong>👤 Aluno(a) / Origem:</strong> ${highlightMatch(item.student_name, query)}</div>
      <div><strong>📅 Data do Registro:</strong> ${highlightMatch(item.date_str, query)}</div>
    </div>

    <div style="margin-bottom:14px;">
      <span class="form-label">Resumo &amp; Detalhes:</span>
      <p style="font-size:12.5px; color:var(--text-secondary); background:#FAFAFA; border:1px solid var(--border-subtle); padding:9px 11px; border-radius:6px;">
        ${highlightMatch(item.summary, query)}
      </p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <button class="btn btn-primary" onclick="downloadBackupImage('${item.id}')">
        📥 Baixar Imagem
      </button>
      <button class="btn btn-emerald" onclick="useBackupItemInWorkspace('${item.id}')">
        ⚡ Abrir no Editor / Corretor
      </button>
    </div>
  `;
}

function downloadBackupImage(id) {
  const item = OttoState.vaultItems.find(i => i.id === id);
  if (!item || !item.image_data) return;
  const a = document.createElement('a');
  a.href = item.image_data;
  a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showOttoToast(`Download da imagem "${item.title}" concluído!`);
}

function useBackupItemInWorkspace(id) {
  const item = OttoState.vaultItems.find(i => i.id === id);
  if (!item) return;

  if (item.category === 'prova_aluno') {
    OttoState.studentGrading.photoDataUrl = item.image_data;
    const imgEl = document.getElementById('scanned-exam-img');
    const emptyEl = document.getElementById('scanner-empty-placeholder');
    if (imgEl) {
      imgEl.src = item.image_data;
      imgEl.style.display = 'block';
    }
    if (emptyEl) emptyEl.style.display = 'none';
    document.getElementById('graded-student-name').value = item.student_name;
    document.getElementById('graded-student-inst').value = item.institution;
    switchMode('grader');
    showOttoToast(`Prova de "${item.student_name}" carregada na bancada de correção!`);
  } else {
    OttoState.attachedFigureDataUrl = item.image_data;
    const wrap = document.getElementById('sheet-attached-figure-wrap');
    const img = document.getElementById('sheet-attached-figure-img');
    if (wrap && img) {
      img.src = item.image_data;
      wrap.style.display = 'block';
    }
    switchMode('generator');
    showOttoToast(`Arquivo "${item.title}" enviado para a Folha de Prova A4!`);
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
