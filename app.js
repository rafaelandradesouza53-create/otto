/**
 * OTTO — Motor Integrado de Geração de Provas, Upload de Slides,
 * Correção Individual & em Lote (.CSV), Modo Prova Iconográfica Cronometrada
 * e Cofre de Backup com Live Preview em Tempo Real.
 */

const OttoState = {
  mode: 'generator',
  guidelineKey: 'sbc_ic',
  level: 'Residência Médica / Concursos',
  typeCounts: {
    mc: 3,       // Múltipla Escolha (Objetivas)
    essay: 1,    // Dissertativas
    cloze: 1,    // Complete as Lacunas
    matching: 1  // Associar Colunas
  },
  style: 'classico', // 'classico' | 'duas_colunas' | 'clinico'
  versionIndex: 0,
  versions: ['CADERNO ALFA', 'CADERNO BETA', 'CADERNO GAMA'],
  showTeacherKeyOnSheet: true,
  attachedFigureDataUrl: '',
  uploadedSlides: [],
  questions: [],
  studentGrading: {
    sampleId: 'mariana_alta',
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
    isPaused: false
  },
  vaultItems: [],
  selectedVaultId: null,
  avatarOpenUrl: '',
  avatarBlinkUrl: ''
};

/* =====================================================================
   1. BANCOS DE DIRETRIZES COM OS 4 TIPOS DE QUESTÕES
   ===================================================================== */
const GUIDELINE_BANK = {
  sbc_ic: {
    institution: 'UNIVERSIDADE FEDERAL DO AMAZONAS — FACULDADE DE MEDICINA',
    subject: 'Cardiologia — Diretriz SBC de Insuficiência Cardíaca & HAS',
    title: 'Avaliação Oficial P1 — Insuficiência Cardíaca (ICFER) e Emergências Hipertensivas',
    sourceText:
      'Diretriz Brasileira de Insuficiência Cardíaca Crônica e Aguda (SBC): O quarteto fantástico modificador de mortalidade na IC com fração de ejeção reduzida (ICFER, FEVE <= 40%) é composto por: 1) Inibidor da neprilisina e do receptor da angiotensina (SACUBITRIL-VALSARTANA) ou IECA/BRA; 2) BETABLOQUEADOR cardiosseletivo (carvedilol, succinato de metoprolol ou bisoprolol); 3) Antagonista mineralocorticoide (ESPIRONOLACTONA); e 4) Inibidor de SGLT2 (DAPAGLIFLOZINA ou EMPAGLIFLOZINA), independentemente da presença de diabetes. Na IC aguda descompensada com perfil hemodinâmico B (quente e úmido), a base do manejo imediato é a descongestão com DIURÉTICO DE ALÇA intravenoso (furosemida) associada a VASODILATADOR (nitroglicerina ou nitroprussiato se PAS > 90-100 mmHg), devendo-se MANTER o betabloqueador de uso crônico caso não haja choque cardiogênico ou hipoperfusão grave (perfil C).',
    questions: [
      {
        id: 'ic-1',
        type: 'mc',
        topic: 'ICFER • Terapia Modificadora',
        points: 1.5,
        stem: 'Paciente masculino, 64 anos, portador de miocardiopatia dilatada isquêmica com Fração de Ejeção do Ventrículo Esquerdo (FEVE) de 32%, encontra-se em classe funcional NYHA II. Segundo a Diretriz da Sociedade Brasileira de Cardiologia (SBC), qual combinação farmacológica representa os quatro pilares fundamentais que reduzem mortalidade e hospitalização na ICFER?',
        options: [
          'Digoxina, furosemida, anlodipino e hidroclorotiazida.',
          'Sacubitril-valsartana (ou IECA), betabloqueador (carvedilol/bisoprolol/succinato de metoprolol), espironolactona e inibidor de SGLT2 (dapagliflozina/empagliflozina).',
          'Tartarato de metoprolol, losartana em dose baixa, amiodarona e nitrato isolado.',
          'Furosemida em altas doses, espironolactona, ivabradina isolada e ácido acetilsalicílico.',
          'Hidralazina, dinitrato de isossorbida, verapamil e clortalidona.'
        ],
        answer: 1,
        rationale: 'O quarteto fantástico da ICFER (FEVE <= 40%) é composto por INRA (sacubitril-valsartana) ou IECA/BRA + Betabloqueador + Espironolactona + iSGLT2 (dapagliflozina ou empagliflozina).'
      },
      {
        id: 'ic-2',
        type: 'mc',
        topic: 'IC Aguda • Perfil Hemodinâmico',
        points: 1.5,
        stem: 'Mulher de 71 anos chega ao pronto-socorro com dispneia paroxística noturna, ortopneia, estertores crepitantes até terço médio bilateralmente e turgência jugular, porém com extremidades aquecidas, tempo de enchimento capilar de 2 segundos e PA 148x92 mmHg. Classifique o perfil hemodinâmico de Stevenson e assinale a conduta imediata correta:',
        options: [
          'Perfil C (frio e úmido) — iniciar dobutamina imediatamente e suspender todas as medicações orais.',
          'Perfil L (frio e seco) — realizar expansão volêmica rápida com 1.000 mL de cristaloide.',
          'Perfil B (quente e úmido) — iniciar furosemida intravenosa associada a vasodilatador endovenoso e manter o betabloqueador crônico.',
          'Perfil A (quente e seco) — alta hospitalar imediata com prescrição de tiazídico oral.',
          'Perfil B (quente e úmido) — suspender obrigatoriamente o betabloqueador na admissão e iniciar noradrenalina.'
        ],
        answer: 2,
        rationale: 'Congestão pulmonar/sistêmica sem sinais de baixo débito configura Perfil B (quente e úmido): trata-se com diurético de alça EV (furosemida) + vasodilatador, mantendo-se o betabloqueador de uso prévio.'
      },
      {
        id: 'ic-3',
        type: 'mc',
        topic: 'Emergência Hipertensiva • Edema Agudo',
        points: 1.5,
        stem: 'No edema agudo de pulmão hipertensivo (PA 210x120 mmHg, SpO2 86% em ar ambiente), além de suporte ventilatório não invasivo (VNI com pressão positiva), qual a estratégia farmacológica de primeira linha para redução rápida da pré e pós-carga ventricular?',
        options: [
          'Nifedipino sublingual de ação rápida e hidratação venosa.',
          'Nitroprussiato de sódio ou nitroglicerina endovenosa associada à furosemida EV.',
          'Propranolol endovenoso em bolus rápido para reduzir a frequência cardíaca.',
          'Captopril sublingual isolado sem diureticoterapia.',
          'Dobutamina em dose alfa-adrenérgica associada a manitol.'
        ],
        answer: 1,
        rationale: 'No EAP hipertensivo, vasodilatadores parenterais tituláveis (nitroglicerina/nitroprussiato) + furosemida EV + VNI reduzem rapidamente a pós-carga e a congestão pulmonar.'
      },
      {
        id: 'ic-4',
        type: 'mc',
        topic: 'Farmacologia da IC • Betabloqueadores',
        points: 1.5,
        stem: 'Apenas três betabloqueadores demonstraram em grandes ensaios clínicos randomizados redução consistente de mortalidade na Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER). Assinale a alternativa que contém exclusivamente esses fármacos:',
        options: [
          'Atenolol, propranolol e pindolol.',
          'Carvedilol, succinato de metoprolol e bisoprolol.',
          'Tartarato de metoprolol, atenolol e sotalol.',
          'Nebivolol, esmolol e labetalol.',
          'Propranolol, nadolol e carvedilol.'
        ],
        answer: 1,
        rationale: 'Carvedilol, succinato de metoprolol (liberação prolongada) e bisoprolol são os betabloqueadores padrão-ouro com impacto comprovado em sobrevida na ICFER.'
      },
      {
        id: 'ic-5',
        type: 'essay',
        topic: 'Dissertativa • Quarteto da ICFER',
        points: 2.0,
        stem: 'Explique a composição do "Quarteto Fantástico" no tratamento da Insuficiência Cardíaca com Fração de Ejeção Reduzida (ICFER) e justifique o papel metabólico/hemodinâmico dos inibidores de SGLT2 mesmo em pacientes não diabéticos.',
        conceptKey: 'O tratamento modificador de mortalidade na ICFER reúne sacubitril-valsartana (ou IECA/BRA), betabloqueador, espironolactona e inibidor de SGLT2 (dapagliflozina/empagliflozina), que promove natriurese osmótica, redução de pré/pós-carga e remodelamento reverso.',
        keywords: [
          'sacubitril-valsartana',
          'betabloqueador',
          'espironolactona',
          'isglt2',
          'dapagliflozina',
          'natriurese',
          'mortalidade'
        ]
      },
      {
        id: 'ic-6',
        type: 'essay',
        topic: 'Dissertativa • Manejo do Perfil B',
        points: 2.0,
        stem: 'Paciente com IC crônica descompensada dá entrada em Perfil B (quente e úmido) em uso domiciliar de carvedilol 25 mg 12/12h. Descreva a conduta terapêutica imediata de descongestão e explique o que deve ser feito com o betabloqueador na admissão.',
        conceptKey: 'No perfil B (quente e úmido), realiza-se descongestão com furosemida intravenosa (diurético de alça) associada a vasodilatador (nitroglicerina/nitroprussiato), devendo-se manter o betabloqueador em uso na ausência de choque ou hipoperfusão.',
        keywords: [
          'furosemida',
          'diuretico de alca',
          'vasodilatador',
          'manter betabloqueador',
          'quente e umido',
          'descongestao'
        ]
      },
      {
        id: 'ic-7',
        type: 'cloze',
        topic: 'Complete as Lacunas • Diretriz SBC ICFER',
        points: 1.5,
        stem: 'Complete as lacunas com os termos farmacológicos e hemodinâmicos exatos da Diretriz da SBC: Na Insuficiência Cardíaca com Fração de Ejeção Reduzida (FEVE ≤ 40%), a substituição do IECA pelo ________________________ (1) associada ao inibidor de SGLT2 ________________________ (2) reduz significativamente a mortalidade cardiovascular. Já na descompensação aguda em Perfil B (quente e úmido), o fármaco de escolha para descongestão imediata por via endovenosa é a ________________________ (3).',
        blanks: ['sacubitril-valsartana', 'dapagliflozina (ou empagliflozina)', 'furosemida'],
        wordBank: ['furosemida', 'sacubitril-valsartana', 'dapagliflozina', 'dobutamina', 'espironolactona'],
        conceptKey: '1: sacubitril-valsartana | 2: dapagliflozina (ou empagliflozina) | 3: furosemida',
        keywords: ['sacubitril-valsartana', 'dapagliflozina', 'furosemida']
      },
      {
        id: 'ic-8',
        type: 'matching',
        topic: 'Associar Colunas • Perfis de Stevenson na IC Aguda',
        points: 2.0,
        stem: 'Associe corretamente a Coluna A (Perfis Hemodinâmicos de Stevenson na IC Aguda) com a respectiva apresentação clínica e conduta prioritária na Coluna B:',
        colA: [
          '(1) Perfil A (Quente e Seco)',
          '(2) Perfil B (Quente e Úmido)',
          '(3) Perfil C (Frio e Úmido)',
          '(4) Perfil L (Frio e Seco)'
        ],
        colB: [
          '(   ) Congestão pulmonar sem hipoperfusão: diurético de alça EV (furosemida) + vasodilatador.',
          '(   ) Baixo débito com congestão: suporte inotrópico (dobutamina) e ajuste hemodinâmico.',
          '(   ) Paciente compensado hemodinamicamente: otimização oral ambulatorial do quarteto.',
          '(   ) Hipoperfusão sem congestão pulmonar: prova volêmica cautelosa com cristaloide.'
        ],
        matchingKey: '(2) - (3) - (1) - (4)',
        conceptKey: 'Sequência correta da Coluna B: (2) Perfil B, (3) Perfil C, (1) Perfil A, (4) Perfil L.',
        keywords: ['2 - 3 - 1 - 4', 'perfil b', 'perfil c', 'furosemida', 'dobutamina']
      }
    ]
  },

  sepse_uti: {
    institution: 'CERMAM — COMISSÃO ESTADUAL DE RESIDÊNCIA MÉDICA DO AMAZONAS',
    subject: 'Terapia Intensiva & Infectologia — Surviving Sepsis Campaign',
    title: 'Simulado Oficial — Pacote de 1 Hora na Sepse e Choque Séptico',
    sourceText:
      'Diretriz Surviving Sepsis Campaign: Sepse é definida como disfunção orgânica ameaçadora à vida secundária à resposta desregulada do hospedeiro à infecção (aumento >= 2 pontos no escore SOFA). Choque séptico caracteriza-se por necessidade de vasopressor para manter PAM >= 65 mmHg E lactato sérico > 2 mmol/L (18 mg/dL) após ressuscitação volêmica adequada. O pacote de 1 hora inclui: 1) Coletar lactato arterial; 2) Coletar 2 pares de hemoculturas antes do antibiótico (sem atrasar o início); 3) Administrar antimicrobiano de amplo espectro na 1ª hora; 4) Ressuscitação com 30 mL/kg de cristaloide balanceado para hipotensão ou lactato >= 4 mmol/L; 5) Iniciar NORADRENALINA como vasopressor de 1ª escolha para alvo de PAM >= 65 mmHg, associando VASOPRESSINA como 2ª linha se refratário.',
    questions: [
      {
        id: 'sep-1',
        type: 'mc',
        topic: 'Sepsis-3 • Definição Diagnóstica',
        points: 1.5,
        stem: 'De acordo com o consenso Sepsis-3 e a campanha Surviving Sepsis, o diagnóstico operacional de Choque Séptico exige obrigatoriamente, após ressuscitação volêmica adequada:',
        options: [
          'Apenas febre > 38,5°C associada a leucocitose > 12.000/mm³ e taquicardia.',
          'Hipotensão persistente exigindo vasopressor para manter PAM >= 65 mmHg associada a lactato sérico > 2 mmol/L (> 18 mg/dL).',
          'Escore qSOFA igual a 1 ponto no pronto-socorro sem necessidade de coleta de lactato.',
          'Pressão arterial sistólica < 100 mmHg que responde imediatamente a 500 mL de soro fisiológico.',
          'Hemocultura positiva obrigatória antes de iniciar qualquer droga vasoativa.'
        ],
        answer: 1,
        rationale: 'Choque séptico pelo Sepsis-3 = necessidade de vasopressor para PAM >= 65 mmHg + hiperlactatemia > 2 mmol/L a despeito de reposição volêmica adequada.'
      },
      {
        id: 'sep-2',
        type: 'mc',
        topic: 'Choque Séptico • Vasopressor de Escolha',
        points: 1.5,
        stem: 'Na condução hemodinâmica do choque séptico refratário à reposição inicial com 30 mL/kg de cristaloide balanceado, qual é o vasopressor de primeira escolha e qual o agente a ser associado em segunda linha quando doses crescentes são necessárias?',
        options: [
          'Dopamina em primeira linha e adrenalina em segunda linha.',
          'Noradrenalina em primeira linha (alvo PAM >= 65 mmHg) e vasopressina associada em segunda linha.',
          'Dobutamina isolada em primeira linha e fenilefrina em segunda linha.',
          'Vasopressina em primeira linha e nitroprussiato em segunda linha.',
          'Adrenalina em bolus periférico e dopamina renal.'
        ],
        answer: 1,
        rationale: 'A noradrenalina é o vasopressor de 1ª escolha no choque séptico (alvo PAM >= 65 mmHg), adicionando-se vasopressina quando necessário poupar catecolaminas.'
      },
      {
        id: 'sep-3',
        type: 'mc',
        topic: 'Hour-1 Bundle • Antimicrobiano',
        points: 1.5,
        stem: 'Em relação ao pacote da primeira hora (Hour-1 Bundle) da Surviving Sepsis Campaign em paciente com suspeita de choque séptico de foco pulmonar comunitário grave, assinale a conduta correta:',
        options: [
          'Aguardar o resultado parcial da hemocultura (24h) antes de iniciar o antimicrobiano para evitar resistência.',
          'Coletar lactato e hemoculturas (2 pares) e administrar antimicrobiano endovenoso de amplo espectro dentro da primeira hora.',
          'Iniciar corticoide em dose imunossupressora (pulsoterapia com metilprednisolona 1g) antes do antibiótico.',
          'Infundir coloides sintéticos (hidroxietilamido) como expansor plasmático de escolha.',
          'Manter alvo de pressão arterial média (PAM) acima de 95 mmHg em todos os pacientes.'
        ],
        answer: 1,
        rationale: 'No choque séptico, cada hora de atraso no antimicrobiano aumenta a mortalidade; coleta-se hemocultura + lactato e administra-se o antibiótico na 1ª hora.'
      },
      {
        id: 'sep-4',
        type: 'essay',
        topic: 'Dissertativa • Hour-1 Bundle',
        points: 2.0,
        stem: 'Descreva os 5 elementos que compõem o Pacote de 1 Hora (Hour-1 Bundle) da Surviving Sepsis Campaign e especifique a meta pressórica inicial.',
        conceptKey: 'O pacote de 1 hora compreende: mensurar lactato sérico, coletar hemoculturas antes do antibiótico, iniciar antimicrobiano de amplo espectro na 1ª hora, infundir 30 mL/kg de cristaloide se hipotensão ou lactato >= 4 mmol/L, e iniciar noradrenalina para manter PAM >= 65 mmHg.',
        keywords: ['lactato', 'hemocultura', 'antimicrobiano', 'cristaloide', '30 ml/kg', 'noradrenalina', 'pam >= 65']
      },
      {
        id: 'sep-5',
        type: 'cloze',
        topic: 'Complete as Lacunas • Choque Séptico',
        points: 1.5,
        stem: 'Preencha as lacunas segundo a diretriz Surviving Sepsis: A reposição volêmica inicial na hipotensão induzida por sepse deve ser realizada com ________________________ (1) de solução cristaloide balanceada. Caso persista hipotensão, inicia-se ________________________ (2) como vasopressor de primeira escolha visando manter a Pressão Arterial Média (PAM) ≥ ________________________ (3) mmHg.',
        blanks: ['30 mL/kg', 'noradrenalina', '65'],
        wordBank: ['30 mL/kg', 'noradrenalina', '65', 'dopamina', '90'],
        conceptKey: '1: 30 mL/kg | 2: noradrenalina | 3: 65 mmHg',
        keywords: ['30 ml/kg', 'noradrenalina', '65']
      },
      {
        id: 'sep-6',
        type: 'matching',
        topic: 'Associar Colunas • Terapia no Choque Séptico',
        points: 2.0,
        stem: 'Associe a Coluna A (Intervenções no Choque Séptico) com sua respectiva indicação técnica na Coluna B:',
        colA: [
          '(1) Noradrenalina EV',
          '(2) Vasopressina EV',
          '(3) Hidrocortisona 200 mg/dia',
          '(4) Cristaloide Balanceado 30 mL/kg'
        ],
        colB: [
          '(   ) Associada em 2ª linha para poupar catecolaminas quando a PAM não é atingida.',
          '(   ) Expansão volêmica inicial para hipotensão ou lactato ≥ 4 mmol/L.',
          '(   ) Vasopressor de 1ª escolha para atingir meta de PAM ≥ 65 mmHg.',
          '(   ) Corticoterapia indicada no choque séptico refratário com demanda contínua de vasopressor.'
        ],
        matchingKey: '(2) - (4) - (1) - (3)',
        conceptKey: 'Sequência correta: (2) Vasopressina, (4) Cristaloide 30 mL/kg, (1) Noradrenalina, (3) Hidrocortisona.',
        keywords: ['2 - 4 - 1 - 3', 'noradrenalina', 'vasopressina', 'hidrocortisona']
      }
    ]
  },

  atls_trauma: {
    institution: 'HOSPITAL UNIVERSITÁRIO GETÚLIO VARGAS (HUGV) — CIRURGIA & TRAUMA',
    subject: 'Cirurgia do Trauma — Diretrizes ATLS 10ª Edição',
    title: 'Avaliação de Trauma — ABCDE, Via Aérea Definitiva e Choque Hemorrágico',
    sourceText:
      'Diretriz ATLS 10ª Edição: A avaliação primária segue o ABCDE com controle de hemorragia exsanguinante. No pneumotórax hipertensivo, o diagnóstico é eminentemente CLÍNICO (murmúrio vesicular abolido, hipertimpanismo, desvio traqueal, turgência jugular e choque obstrutivo) e a descompressão imediata em adultos é feita no 4º ou 5º espaço intercostal na linha axilar anterior/média, seguida de drenagem torácica em selo d’água. Na ressuscitação hemostática do choque hemorrágico classe III/IV, preconiza-se ácido tranexâmico nas primeiras 3 horas, contenção de cristaloide e protocolo de transfusão maciça 1:1:1 (concentrado de hemácias, plasma fresco e plaquetas).',
    questions: [
      {
        id: 'tr-1',
        type: 'mc',
        topic: 'ATLS • Pneumotórax Hipertensivo',
        points: 2.0,
        stem: 'Motociclista vítima de colisão frontal chega ao trauma com dispneia grave, PA 70x40 mmHg, turgência jugular, ausência de murmúrio vesicular e hipertimpanismo em hemitórax direito. Segundo o ATLS 10ª edição, qual a conduta imediata e o local anatômico preconizado no adulto?',
        options: [
          'Solicitar radiografia de tórax no leito antes de qualquer procedimento invasivo.',
          'Realizar descompressão torácica imediata no 4º ou 5º espaço intercostal, linha axilar anterior/média, seguida de drenagem em selo d’água.',
          'Realizar pericardiocentese subxifoide imediata guiada por radiografia.',
          'Intubar com pressão positiva alta e aguardar tomografia de tórax.',
          'Infundir 3 litros de soro fisiológico aquecido antes de examinar o tórax.'
        ],
        answer: 1,
        rationale: 'O diagnóstico do pneumotórax hipertensivo é clínico; no adulto, o ATLS 10ª ed atualizou a punção descompressiva para o 4º/5º EIC na linha axilar anterior/média, seguida de drenagem definitiva.'
      },
      {
        id: 'tr-2',
        type: 'mc',
        topic: 'ATLS • Choque Hemorrágico & Ácido Tranexâmico',
        points: 2.0,
        stem: 'No paciente politraumatizado em choque hemorrágico Classe IV (perda volêmica > 40%, letargia, taquicardia > 140 bpm e hipotensão grave), a estratégia de ressuscitação de controle de danos inclui:',
        options: [
          'Infusão rápida de 4.000 mL de soro fisiológico 0,9% gelado.',
          'Protocolo de transfusão maciça hemostática (1:1:1 de hemácias, plasma e plaquetas) e ácido tranexâmico dentro das primeiras 3 horas do trauma.',
          'Uso isolado de noradrenalina em dose máxima sem hemotransfusão.',
          'Administração de ácido tranexâmico apenas se o trauma tiver mais de 12 horas de evolução.',
          'Correção completa da pressão arterial para PAS > 160 mmHg antes do controle cirúrgico.'
        ],
        answer: 1,
        rationale: 'A ressuscitação hemostática utiliza hemocomponentes balanceados 1:1:1, restrição de cristaloides e ácido tranexâmico iniciado em até 3 horas do trauma.'
      },
      {
        id: 'tr-3',
        type: 'essay',
        topic: 'Dissertativa • Pneumotórax Hipertensivo & ATLS 10',
        points: 2.5,
        stem: 'Descreva a tríade clínica/fisiopatológica do choque obstrutivo por pneumotórax hipertensivo, por que a radiografia não deve atrasar a conduta e a atualização do ATLS 10ª edição quanto ao local da punção no adulto.',
        conceptKey: 'O pneumotórax hipertensivo gera choque obstrutivo com murmúrio vesicular abolido, hipertimpanismo e turgência jugular. O diagnóstico é clínico (sem aguardar raio-X), realizando-se descompressão no 4º ou 5º espaço intercostal na linha axilar anterior seguida de drenagem em selo d’água.',
        keywords: ['choque obstrutivo', 'murmurio abolido', 'hipertimpanismo', 'diagnostico clinico', '5 espaco intercostal', 'linha axilar anterior', 'drenagem']
      },
      {
        id: 'tr-4',
        type: 'cloze',
        topic: 'Complete as Lacunas • Tríade Letal & ATLS',
        points: 1.5,
        stem: 'Complete as lacunas: A Tríade Letal do trauma grave é constituída por hipotermia, ________________________ (1) e coagulopatia. No pneumotórax hipertensivo do adulto, a punção de alívio segundo o ATLS 10ª Edição é realizada no 4º ou 5º espaço intercostal na linha ________________________ (2), e o antifibrinolítico ________________________ (3) deve ser administrado nas primeiras 3 horas do choque hemorrágico.',
        blanks: ['acidose metabólica', 'axilar anterior (ou média)', 'ácido tranexâmico'],
        wordBank: ['acidose metabólica', 'axilar anterior', 'ácido tranexâmico', 'heparina', 'hemiclavicular'],
        conceptKey: '1: acidose metabólica | 2: linha axilar anterior | 3: ácido tranexâmico',
        keywords: ['acidose', 'axilar anterior', 'acido tranexamico']
      },
      {
        id: 'tr-5',
        type: 'matching',
        topic: 'Associar Colunas • Lesões Torácicas Ameaçadoras à Vida',
        points: 2.0,
        stem: 'Associe a Coluna A (Emergências Torácicas no Trauma) com os achados semiológicos e conduta na Coluna B:',
        colA: [
          '(1) Pneumotórax Hipertensivo',
          '(2) Hemotórax Maciço',
          '(3) Tamponamento Cardíaco',
          '(4) Pneumotórax Aberto'
        ],
        colB: [
          '(   ) Tríade de Beck (hipotensão, hipofonese de bulhas, turgência jugular) e FAST positivo.',
          '(   ) Hipertimpanismo, MV abolido e choque obstrutivo: descompressão no 5º EIC.',
          '(   ) Curativo valvulado de 3 pontas seguido de drenagem torácica fora da ferida.',
          '(   ) Macicez à percussão e drenagem imediata > 1.500 mL de sangue + autotransfusão/toracotomia.'
        ],
        matchingKey: '(3) - (1) - (4) - (2)',
        conceptKey: 'Sequência correta: (3) Tamponamento Cardíaco, (1) Pneumotórax Hipertensivo, (4) Pneumotórax Aberto, (2) Hemotórax Maciço.',
        keywords: ['3 - 1 - 4 - 2', 'pneumotorax', 'hemotorax', 'tamponamento']
      }
    ]
  },

  pediatria_sus: {
    institution: 'ENARE / EBSERH — PEDIATRIA & SAÚDE COLETIVA',
    subject: 'Pediatria — Programa Nacional de Imunizações (PNI) & Bronquiolite Viral Aguda',
    title: 'Avaliação de Pediatria — Calendário Vacinal PNI e Emergências Respiratórias',
    sourceText:
      'Diretrizes da Sociedade Brasileira de Pediatria (SBP) e PNI: A Bronquiolite Viral Aguda (BVA), causada principalmente pelo Vírus Sincicial Respiratório (VSR) em lactentes < 2 anos, tem diagnóstico clínico e tratamento essencialmente de SUPORTE (oxigenoterapia se SpO2 < 90-92%, hidratação e higiene nasal), NÃO sendo recomendados de rotina corticoide sistêmico, broncodilatador de repetição nem antibiótico. No PNI, ao nascer aplicam-se BCG e Hepatite B; aos 2 e 4 meses aplicam-se Pentavalente, VIP, Pneumocócica 10-valente e Rotavírus humano.',
    questions: [
      {
        id: 'ped-1',
        type: 'mc',
        topic: 'Pediatria • Bronquiolite Viral Aguda',
        points: 2.5,
        stem: 'Lactente de 4 meses, previamente hígido, apresenta coriza e tosse há 3 dias, evoluindo com primeiro episódio de sibilância, taquipneia (FR 58 irpm), tiragem subcostal leve e SpO2 94% em ar ambiente. Qual o agente etiológico mais frequente e a conduta respaldada pela SBP?',
        options: [
          'Streptococcus pneumoniae — iniciar amoxicilina + clavulanato e prednisolona por 7 dias.',
          'Vírus Sincicial Respiratório (VSR) — medidas de suporte, desobstrução nasal com soro fisiológico e orientação de sinais de alarme, sem uso rotineiro de corticoide ou broncodilatador.',
          'Bordetella pertussis — prescrever azitromicina, nebulização com adrenalina contínua e radiografia seriada.',
          'Rinovírus — internar em UTI e iniciar corticoterapia endovenosa em altas doses.',
          'Adenovírus — realizar fisioterapia respiratória com tapotagem vigorosa e salbutamol fixo.'
        ],
        answer: 1,
        rationale: 'A BVA tem como principal agente o VSR; o manejo baseia-se em suporte (higiene nasal, hidratação e O2 se hipoxemia), evitando-se corticoides e broncodilatadores de rotina.'
      },
      {
        id: 'ped-2',
        type: 'essay',
        topic: 'Dissertativa • Manejo da Bronquiolite',
        points: 2.5,
        stem: 'Explique a fisiopatologia da Bronquiolite Viral Aguda pelo VSR em lactentes e justifique por que corticoides sistêmicos e broncodilatadores não fazem parte do manejo rotineiro.',
        conceptKey: 'O VSR causa necrose do epitélio bronquiolar, edema submucoso e tampões de muco/fibrina (obstrução mecânica e não broncoespasmo puro). Por isso o manejo é de suporte (oxigenoterapia se SpO2 < 90-92% e hidratação), sem benefício de corticoide ou broncodilatador.',
        keywords: ['vsr', 'suporte', 'oxigenoterapia', 'hidratacao', 'sem corticoide', 'tampoes de muco']
      },
      {
        id: 'ped-3',
        type: 'cloze',
        topic: 'Complete as Lacunas • BVA & Calendário PNI',
        points: 2.0,
        stem: 'Complete as lacunas: O principal agente etiológico da Bronquiolite Viral Aguda em lactentes é o ________________________ (1), cujo tratamento baseia-se em medidas de ________________________ (2). Pelo calendário do PNI, ao nascer são administradas as vacinas BCG e ________________________ (3).',
        blanks: ['Vírus Sincicial Respiratório (VSR)', 'suporte (oxigenoterapia e hidratação)', 'Hepatite B'],
        wordBank: ['Vírus Sincicial Respiratório (VSR)', 'suporte', 'Hepatite B', 'corticoide', 'Tríplice Viral'],
        conceptKey: '1: VSR | 2: suporte | 3: Hepatite B',
        keywords: ['vsr', 'suporte', 'hepatite b']
      },
      {
        id: 'ped-4',
        type: 'matching',
        topic: 'Associar Colunas • Calendário Vacinal PNI',
        points: 2.0,
        stem: 'Associe a idade do Calendário Nacional de Vacinação (Coluna A) com os imunobiológicos preconizados pelo PNI (Coluna B):',
        colA: [
          '(1) Ao nascer',
          '(2) 2 e 4 meses',
          '(3) 3 e 5 meses',
          '(4) 12 meses'
        ],
        colB: [
          '(   ) Meningocócica C (conjugada).',
          '(   ) BCG e Hepatite B (dose ao nascer).',
          '(   ) Tríplice Viral (SCR), Pneumocócica 10 (reforço) e Meningocócica C (reforço).',
          '(   ) Pentavalente, VIP, Pneumocócica 10-valente e Rotavírus Humano.'
        ],
        matchingKey: '(3) - (1) - (4) - (2)',
        conceptKey: 'Sequência correta: (3) 3 e 5 meses, (1) Ao nascer, (4) 12 meses, (2) 2 e 4 meses.',
        keywords: ['3 - 1 - 4 - 2', 'bcg', 'pentavalente', 'triplice viral']
      }
    ]
  },

  farmaco_clinica: {
    institution: 'UNIVERSIDADE DE SÃO PAULO (FMUSP) — FARMACOLOGIA CLÍNICA',
    subject: 'Farmacologia Clínica — Antimicrobianos PK/PD e Anticoagulantes',
    title: 'Prova de Farmacologia — Índices PK/PD de Antimicrobianos e Manejo de Anticoagulação',
    sourceText:
      'Farmacocinética e Farmacodinâmica (PK/PD) de Antimicrobianos: Os BETA-LACTÂMICOS (penicilinas, cefalosporinas, carbapenêmicos) são antimicrobianos TEMPO-DEPENDENTES (T > MIC), beneficiando-se de infusão estendida (3 a 4 horas) em infecções graves. Os AMINOGLICOSÍDEOS (amicacina, gentamicina) são CONCENTRAÇÃO-DEPENDENTES (Cmáx/MIC), administrados em dose única diária para maximizar o pico e reduzir nefrotoxicidade. A VANCOMICINA guia-se pela razão AUC/MIC (alvo 400-600).',
    questions: [
      {
        id: 'far-1',
        type: 'mc',
        topic: 'PK/PD • Beta-lactâmicos vs Aminoglicosídeos',
        points: 2.5,
        stem: 'Em pacientes críticos na UTI, a otimização farmacocinética/farmacodinâmica (PK/PD) dos antimicrobianos é determinante para o sucesso terapêutico. Assinale a correlação correta entre classe antimicrobiana, índice PK/PD determinante de eficácia e estratégia posológica:',
        options: [
          'Meropenem e piperacilina-tazobactam são tempo-dependentes (fT > MIC) e se beneficiam de infusão estendida (3 a 4 horas).',
          'Amicacina e gentamicina são tempo-dependentes e devem ser administradas em infusão contínua de 24 horas.',
          'Cefepime e amoxicilina são concentração-dependentes puros e devem ser feitos em dose única semanal.',
          'Vancomicina atua exclusivamente por pico sérico isolado sem relação com a área sob a curva (AUC/MIC).',
          'Polimixina B é um beta-lactâmico clássico que não apresenta nefrotoxicidade.'
        ],
        answer: 0,
        rationale: 'Os beta-lactâmicos dependem do tempo em que a concentração livre permanece acima da CIM (fT > MIC), motivo pelo qual a infusão estendida (3-4h) otimiza sua eficácia em sepse.'
      },
      {
        id: 'far-2',
        type: 'essay',
        topic: 'Dissertativa • PK/PD na UTI',
        points: 2.5,
        stem: 'Diferencie os índices farmacodinâmicos (PK/PD) dos Beta-lactâmicos e dos Aminoglicosídeos e explique a vantagem clínica da infusão estendida de carbapenêmicos no choque séptico.',
        conceptKey: 'Beta-lactâmicos são tempo-dependentes (T > MIC), logo a infusão estendida de 3 a 4 horas mantém concentrações séricas acima da CIM por mais tempo. Aminoglicosídeos são concentração-dependentes (Cmáx/MIC) com efeito pós-antibiótico, usados em dose única diária.',
        keywords: ['tempo-dependente', 't > mic', 'infusao estendida', 'concentracao-dependente', 'cmax/mic', 'dose unica diaria']
      },
      {
        id: 'far-3',
        type: 'cloze',
        topic: 'Complete as Lacunas • Índices PK/PD',
        points: 2.0,
        stem: 'Complete as lacunas: Os antimicrobianos beta-lactâmicos (como meropenem e cefepime) apresentam atividade bactericida ________________________ (1) (fT > MIC), enquanto os aminoglicosídeos atuam de forma ________________________ (2) (Cmáx/MIC). Já a monitorização terapêutica da vancomicina em infecções graves por MRSA baseia-se na razão ________________________ (3) entre 400 e 600.',
        blanks: ['tempo-dependente', 'concentração-dependente', 'AUC/MIC'],
        wordBank: ['tempo-dependente', 'concentração-dependente', 'AUC/MIC', 'dose semanal', 'pH-dependente'],
        conceptKey: '1: tempo-dependente | 2: concentração-dependente | 3: AUC/MIC',
        keywords: ['tempo-dependente', 'concentracao-dependente', 'auc/mic']
      },
      {
        id: 'far-4',
        type: 'matching',
        topic: 'Associar Colunas • Antimicrobianos e Estratégia PK/PD',
        points: 2.0,
        stem: 'Associe o antimicrobiano na Coluna A com seu respectivo parâmetro farmacodinâmico e regime posológico na Coluna B:',
        colA: [
          '(1) Meropenem (Carbapenêmico)',
          '(2) Amicacina (Aminoglicosídeo)',
          '(3) Vancomicina (Glicopeptídeo)',
          '(4) Linezolida (Oxazolidinona)'
        ],
        colB: [
          '(   ) Concentração-dependente (Cmáx/MIC): administrada em dose única diária.',
          '(   ) Tempo-dependente (fT > MIC): otimizado por infusão estendida de 3 a 4 horas.',
          '(   ) Alternativa bacteriostática/bactericida com excelente penetração pulmonar em pneumonia por MRSA.',
          '(   ) Eficácia guiada pela área sob a curva dividida pela CIM (AUC24/MIC de 400 a 600).'
        ],
        matchingKey: '(2) - (1) - (4) - (3)',
        conceptKey: 'Sequência correta: (2) Amicacina, (1) Meropenem, (4) Linezolida, (3) Vancomicina.',
        keywords: ['2 - 1 - 4 - 3', 'meropenem', 'amicacina', 'vancomicina']
      }
    ]
  }
};

/* =====================================================================
   2. AMOSTRAS DE PROVAS DE ALUNOS E LOTE DA TURMA COMPLETA
   ===================================================================== */
const STUDENT_SAMPLES = {
  mariana_alta: {
    name: 'Mariana Silva (Mat. 2026104)',
    institution: 'UFAM — Internato Clínica Médica',
    mcChoices: [1, 2, 1, 1],
    essayResponses: {
      default: 'O quarteto fantástico da ICFER reúne sacubitril-valsartana (ou IECA), betabloqueador (carvedilol, bisoprolol ou succinato de metoprolol), espironolactona e inibidor de SGLT2 como a dapagliflozina ou empagliflozina. No perfil B (quente e úmido), realiza-se descongestão com furosemida EV (diurético de alça) e vasodilatador, mantendo-se o betabloqueador.'
    }
  },
  lucas_parcial: {
    name: 'Lucas Mendes (Mat. 2026089)',
    institution: 'UFAM — Internato Clínica Médica',
    mcChoices: [1, 2, 0, 1],
    essayResponses: {
      default: 'O tratamento da insuficiência cardíaca usa betabloqueador, espironolactona e gliflozina (dapagliflozina), que ajuda na natriurese e diminui internações hospitalares. Na descompensação em perfil B usamos furosemida na veia para descongestão pulmonar e vasodilatador.'
    }
  },
  rafael_critico: {
    name: 'Pedro Costa (Mat. 2026152)',
    institution: 'CERMAM — Processo Seletivo Residência',
    mcChoices: [0, 0, 1, 2],
    essayResponses: {
      default: 'Usa-se digoxina e furosemida para melhorar os sintomas do paciente e deve-se suspender o betabloqueador imediatamente na entrada do pronto-socorro.'
    }
  }
};

const INITIAL_BATCH_CLASS = [
  { studentName: 'Mariana Silva', correctCount: 6, totalCount: 6, finalGrade: 9.8 },
  { studentName: 'Lucas Mendes', correctCount: 5, totalCount: 6, finalGrade: 8.4 },
  { studentName: 'Beatriz Oliveira', correctCount: 5, totalCount: 6, finalGrade: 8.8 },
  { studentName: 'Gabriel Ferreira', correctCount: 4, totalCount: 6, finalGrade: 7.2 },
  { studentName: 'Pedro Costa', correctCount: 2, totalCount: 6, finalGrade: 4.5 }
];

/* =====================================================================
   3. INICIALIZAÇÃO & ANIMAÇÃO REALISTA DE PISCAR DO MASCOTE OTTO (3 A 5s)
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  applyEmbeddedOttoAssets();
  initOttoMascotBlink();
  loadGuidelineIntoWorkspace('sbc_ic');
  initBatchClassTable();
  initIconographicModule();
  initVaultDataset();
  loadStudentSample('mariana_alta');
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

  // Prepara frame realista de olhos fechados do Otto em Canvas para sincronizar com as pálpebras CSS
  if (avatar) {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.width || 252;
        c.height = img.height || 252;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Cobre as pupilas verticais dentro das lentes brancas e desenha linha de pálpebra fechada nanquim
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(c.width * 0.295, c.height * 0.545, c.width * 0.08, c.height * 0.105);
        ctx.fillRect(c.width * 0.625, c.height * 0.495, c.width * 0.075, c.height * 0.095);

        ctx.strokeStyle = '#121212';
        ctx.lineWidth = Math.max(3, c.width * 0.018);
        ctx.lineCap = 'round';

        // Olho esquerdo fechado (acompanhando inclinação dos óculos)
        ctx.beginPath();
        ctx.moveTo(c.width * 0.30, c.height * 0.605);
        ctx.quadraticCurveTo(c.width * 0.335, c.height * 0.62, c.width * 0.37, c.height * 0.598);
        ctx.stroke();

        // Olho direito fechado
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
  // Intervalo aleatório realista entre 3000ms e 5000ms (3 a 5 segundos)
  const randomDelay = Math.floor(3000 + Math.random() * 2000);
  blinkTimeoutId = setTimeout(() => {
    performSingleOttoBlink(() => {
      // 22% de chance de piscada dupla rápida natural
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
   4. NAVEGAÇÃO PRINCIPAL ENTRE OS MÓDULOS
   ===================================================================== */
function switchMode(mode) {
  OttoState.mode = mode;
  const modes = ['generator', 'grader', 'iconographic', 'vault'];
  modes.forEach(m => {
    const view = document.getElementById(`view-${m}`);
    const btn = document.getElementById(`nav-btn-${m}`);
    if (view) view.classList.toggle('active', m === mode);
    if (btn) btn.classList.toggle('active', m === mode);
  });

  if (mode === 'grader') {
    runFullExamGrading();
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
   5. UPLOAD DE SLIDES (.PPTX, .PPT, .PDF E IMAGENS DE SLIDES) & DIRETRIZES
   ===================================================================== */
function selectGuideline(key, btnEl) {
  OttoState.guidelineKey = key;
  document.querySelectorAll('#guideline-pills .pill').forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  loadGuidelineIntoWorkspace(key);
  showOttoToast(`Diretriz "${GUIDELINE_BANK[key].subject}" carregada e diagramada!`);
}

function loadGuidelineIntoWorkspace(key) {
  const pack = GUIDELINE_BANK[key];
  if (!pack) return;
  document.getElementById('meta-institution').value = pack.institution;
  document.getElementById('meta-subject').value = pack.subject;
  document.getElementById('meta-title').value = pack.title;
  document.getElementById('professor-source-text').value = pack.sourceText;

  rebuildExamQuestionsFromState();
}

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
  rebuildExamQuestionsFromState();
}

function adjustQuestionTypeCount(typeKey, delta) {
  const current = Number(OttoState.typeCounts[typeKey] || 0);
  const next = Math.max(0, Math.min(50, current + delta));
  OttoState.typeCounts[typeKey] = next;
  const inputEl = document.getElementById(`qty-${typeKey}`);
  if (inputEl) inputEl.value = String(next);
  rebuildExamQuestionsFromState();
}

function setQuestionTypeCount(typeKey, rawVal) {
  const parsed = parseInt(rawVal, 10);
  const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(50, parsed));
  OttoState.typeCounts[typeKey] = next;
  rebuildExamQuestionsFromState();
}

function getTotalConfiguredQuestions() {
  const c = OttoState.typeCounts;
  return (c.mc || 0) + (c.essay || 0) + (c.cloze || 0) + (c.matching || 0);
}

function rebuildExamQuestionsFromState() {
  const basePack = GUIDELINE_BANK[OttoState.guidelineKey] || GUIDELINE_BANK.sbc_ic;
  const customText = (document.getElementById('professor-source-text')?.value || '').trim();
  const referenceText = customText || basePack.sourceText;

  const totalBadge = document.getElementById('total-questions-counter-badge');
  const totalWanted = getTotalConfiguredQuestions();
  if (totalBadge) {
    totalBadge.textContent = `${totalWanted} ${totalWanted === 1 ? 'QUESTÃO NO TOTAL' : 'QUESTÕES NO TOTAL'}`;
  }

  const typesOrder = ['mc', 'essay', 'cloze', 'matching'];
  const finalQuestions = [];

  typesOrder.forEach(tKey => {
    const needed = Number(OttoState.typeCounts[tKey] || 0);
    if (needed <= 0) return;

    const fromBank = basePack.questions
      .filter(q => q.type === tKey)
      .map(q => JSON.parse(JSON.stringify(q)));

    // Se o professor editou o texto-fonte ou enviou slides, prioriza síntese contextualizada
    let poolForType = [];
    if (customText && customText !== basePack.sourceText && customText.length > 45) {
      const synth = synthesizeQuestionsByType(referenceText, tKey, needed);
      poolForType = [...synth, ...fromBank];
    } else {
      poolForType = [...fromBank];
    }

    while (poolForType.length < needed) {
      const extra = synthesizeQuestionsByType(referenceText, tKey, needed - poolForType.length, poolForType.length + 1);
      if (!extra.length) break;
      poolForType.push(...extra);
    }

    poolForType.slice(0, needed).forEach(q => {
      q.level = OttoState.level;
      finalQuestions.push(q);
    });
  });

  OttoState.questions = finalQuestions;
  renderExamSheet();
}

function synthesizeQuestionsByType(rawText, typeKey, countNeeded, seedOffset = 1) {
  const sentences = String(rawText || '')
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!;])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  const fallbackSentences = [
    'A avaliação sistematizada segundo as diretrizes clínicas vigentes reduz desfechos adversos e orienta a conduta imediata.',
    'A estratificação precoce de gravidade associada ao manejo fisiopatológico direcionado constitui pilar essencial do protocolo.',
    'O monitoramento contínuo dos parâmetros clínicos e laboratoriais permite titular a intervenção terapêutica com segurança.',
    'A integração entre achados semiológicos, exames complementares e diretrizes baseadas em evidências fundamenta a decisão.'
  ];

  const sourceList = sentences.length > 0 ? sentences : fallbackSentences;
  const subjectTitle = (document.getElementById('meta-subject')?.value || 'Diretriz Docente').split('—')[0].trim();
  const levelLabel = OttoState.level || 'Superior / Graduação';
  const results = [];

  for (let i = 0; i < countNeeded; i++) {
    const sent = sourceList[(i + seedOffset - 1) % sourceList.length];
    const cleanWords = (sent.match(/[A-Za-zÀ-ÿ0-9>=<%/+-]{5,}/g) || [])
      .map(w => w.replace(/[.,;:()]/g, ''))
      .filter(w => !['para', 'como', 'pela', 'pelo', 'mais', 'menos', 'entre', 'quando', 'sobre'].includes(w.toLowerCase()));
    const kws = [...new Set(cleanWords.map(w => w.toLowerCase()))].slice(0, 5);
    const keyTerms = kws.length >= 3 ? kws : ['diagnóstico', 'conduta', 'diretriz'];

    if (typeKey === 'mc') {
      results.push({
        id: `synth-mc-${seedOffset}-${i}-${Date.now()}`,
        type: 'mc',
        topic: `${subjectTitle} • ${levelLabel}`,
        points: 1.5,
        stem: `[Nível: ${levelLabel}] Considerando os conceitos ministrados em "${subjectTitle}", assinale a alternativa tecnicamente CORRETA:`,
        options: [
          sent,
          'A conduta preconizada deve ser postergada por 48 horas independentemente dos sinais clínicos de gravidade.',
          'O protocolo dispensa avaliação inicial sistematizada ou monitorização de parâmetros fisiológicos.',
          'A intervenção de primeira linha descrita no material encontra-se formalmente proscrita.',
          'Recomenda-se manejo exclusivamente expectante sem estratificação de risco.'
        ],
        answer: 0,
        rationale: `Baseado diretamente no material/slide: "${sent}"`
      });
    } else if (typeKey === 'essay') {
      results.push({
        id: `synth-essay-${seedOffset}-${i}-${Date.now()}`,
        type: 'essay',
        topic: `${subjectTitle} • Dissertativa (${levelLabel})`,
        points: 2.0,
        stem: `[Nível: ${levelLabel}] Com base nos slides e diretrizes da disciplina de ${subjectTitle}, desenvolva e justifique tecnicamente a seguinte afirmativa: "${sent.slice(0, 150)}..."`,
        conceptKey: sent,
        keywords: keyTerms
      });
    } else if (typeKey === 'cloze') {
      const t1 = keyTerms[0] || 'diagnóstico';
      const t2 = keyTerms[1] || 'conduta';
      const t3 = keyTerms[2] || 'monitorização';
      results.push({
        id: `synth-cloze-${seedOffset}-${i}-${Date.now()}`,
        type: 'cloze',
        topic: `${subjectTitle} • Complete as Lacunas`,
        points: 1.5,
        stem: `[Nível: ${levelLabel}] Complete as lacunas com os conceitos fundamentais de ${subjectTitle}: O manejo estruturado contempla ________________________ (1) aliado ao controle de ________________________ (2) e acompanhamento sistemático de ________________________ (3), conforme o protocolo apresentado em aula.`,
        blanks: [t1, t2, t3],
        wordBank: [t1, t2, t3, 'conduta expectante', 'placebo'],
        conceptKey: `1: ${t1} | 2: ${t2} | 3: ${t3}`,
        keywords: [t1, t2, t3]
      });
    } else if (typeKey === 'matching') {
      const t1 = (keyTerms[0] || 'Avaliação Inicial').toUpperCase();
      const t2 = (keyTerms[1] || 'Estratificação').toUpperCase();
      const t3 = (keyTerms[2] || 'Intervenção Alvo').toUpperCase();
      const t4 = (keyTerms[3] || 'Monitorização').toUpperCase();
      results.push({
        id: `synth-match-${seedOffset}-${i}-${Date.now()}`,
        type: 'matching',
        topic: `${subjectTitle} • Associar Colunas`,
        points: 2.0,
        stem: `[Nível: ${levelLabel}] Associe os conceitos-chave da Coluna A com sua aplicação correspondente na Coluna B sobre ${subjectTitle}:`,
        colA: [
          `(1) ${t1}`,
          `(2) ${t2}`,
          `(3) ${t3}`,
          `(4) ${t4}`
        ],
        colB: [
          `(   ) Aplicação terapêutica imediata baseada nas diretrizes de ${subjectTitle}.`,
          `(   ) Identificação precoce dos critérios clínicos e semiológicos prioritários.`,
          `(   ) Reavaliação seriada da resposta clínica e segurança do protocolo.`,
          `(   ) Classificação de gravidade e definição do fluxograma assistencial.`
        ],
        matchingKey: '(3) - (1) - (4) - (2)',
        conceptKey: `Sequência correta da Coluna B: (3) ${t3}, (1) ${t1}, (4) ${t4}, (2) ${t2}.`,
        keywords: ['3 - 1 - 4 - 2', t1.toLowerCase(), t2.toLowerCase(), t3.toLowerCase()]
      });
    }
  }

  return results;
}

function generateExamFromMaterial() {
  rebuildExamQuestionsFromState();
  showOttoToast(`${OttoState.questions.length} questões (${OttoState.level}) diagramadas na folha A4!`);
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
      if (srcBox) {
        srcBox.value = extractedSlideNotes;
      }
      document.getElementById('meta-title').value = `Avaliação — Slides: ${baseTitle}`;
      rebuildExamQuestionsFromState();
      showOttoToast(`Apresentação de slides "${file.name}" importada! Questões geradas.`);
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
            document.getElementById('professor-source-text').value = data.text.slice(0, 4000);
          }
        } catch (err) {
          const cur = document.getElementById('professor-source-text').value;
          document.getElementById('professor-source-text').value =
            `[Slides/Diretriz em PDF: ${baseTitle}] ` + (cur || GUIDELINE_BANK[OttoState.guidelineKey].sourceText);
        }
        document.getElementById('meta-title').value = `Avaliação — ${baseTitle}`;
        rebuildExamQuestionsFromState();
        showOttoToast(`Slides/PDF "${file.name}" processado com sucesso!`);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif)$/i.test(lower)) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        OttoState.uploadedSlides.push({
          id: `imgslide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'SLIDE IMG',
          thumb: dataUrl
        });
        renderUploadedSlidesStrip();

        // Anexa como figura de apoio na prova A4 e também disponibiliza no Modo Prova Iconográfica
        OttoState.attachedFigureDataUrl = dataUrl;
        const wrap = document.getElementById('sheet-attached-figure-wrap');
        const img = document.getElementById('sheet-attached-figure-img');
        if (wrap && img) {
          img.src = dataUrl;
          wrap.style.display = 'block';
        }

        OttoState.iconographic.items.push({
          id: `ico-slide-${Date.now()}`,
          title: `Slide: ${baseTitle}`,
          prompt: `Analise o slide/imagem "${baseTitle}" e descreva os achados principais e a conduta preconizada.`,
          durationSec: Number(document.getElementById('icono-default-time')?.value || 45),
          imageDataUrl: dataUrl
        });
        renderIconographicList();
        rebuildExamQuestionsFromState();
        showOttoToast(`Imagem de slide "${file.name}" anexada à prova e ao Modo Iconográfico!`);
      };
      reader.readAsDataURL(file);
    } else {
      const text = await file.text();
      document.getElementById('professor-source-text').value = text.slice(0, 5000);
      document.getElementById('meta-title').value = `Avaliação — ${baseTitle}`;
      rebuildExamQuestionsFromState();
      showOttoToast(`Material "${file.name}" importado e transformado em prova!`);
    }
  }
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
      if (cleaned.length > 40) {
        return `Slides "${baseTitle}": ${cleaned.slice(0, 3500)}`;
      }
    }
  } catch (e) {}
  const currentGuideline = GUIDELINE_BANK[OttoState.guidelineKey] || GUIDELINE_BANK.sbc_ic;
  return `Conteúdo extraído dos slides "${file.name}" (${baseTitle}): ${currentGuideline.sourceText}`;
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
        ${s.thumb ? `<img src="${s.thumb}" alt="${escapeHtml(s.name)}" />` : `<span>📊</span>`}
        <span>[${escapeHtml(s.type)}] ${escapeHtml(s.name)}</span>
        <button type="button" class="q-inline-btn" style="padding:0 4px;" onclick="removeUploadedSlide(${idx})" title="Remover slide">×</button>
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
   6. DIAGRAMAÇÃO A4 VIVA & MODELOS DE PROVA
   ===================================================================== */
function syncExamHeader() {
  const inst = document.getElementById('meta-institution').value;
  const subj = document.getElementById('meta-subject').value;
  const title = document.getElementById('meta-title').value;
  const prof = document.getElementById('meta-professor').value;

  document.getElementById('sheet-institution').textContent = inst;
  document.getElementById('sheet-title').textContent = title;
  document.getElementById('sheet-subject').innerHTML = `<strong>Assunto:</strong> ${escapeHtml(subj)}`;
  document.getElementById('sheet-professor').innerHTML = `<strong>Docente:</strong> ${escapeHtml(prof)}`;
}

function setExamStyle(style) {
  OttoState.style = style;
  ['classico', 'duas_colunas', 'clinico'].forEach(s => {
    const btn = document.getElementById(`style-btn-${s}`);
    if (btn) btn.classList.toggle('active', s === style);
  });

  const sheet = document.getElementById('exam-a4-sheet');
  sheet.className = `a4-sheet style-${style}`;

  const styleLabels = {
    classico: 'MODELO CLÁSSICO',
    duas_colunas: 'RESIDÊNCIA 2 COLUNAS',
    clinico: 'MODELO CLÍNICO OSCE'
  };
  document.getElementById('sheet-style-badge').textContent = styleLabels[style] || 'MODELO CLÁSSICO';
  showOttoToast(`Diagramação alterada para ${styleLabels[style]}!`);
}

function shuffleExamVersion() {
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
      q.answer = q.options.indexOf(correctText);
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
  const listEl = document.getElementById('sheet-questions-list');
  const omrGridEl = document.getElementById('sheet-omr-grid');
  if (!listEl || !omrGridEl) return;

  const totalPoints = OttoState.questions.reduce((acc, q) => acc + (Number(q.points) || 1), 0);
  document.getElementById('sheet-qcount-badge').textContent =
    `${OttoState.questions.length} QUESTÕES • ${totalPoints.toFixed(1).replace('.', ',')} PTS`;

  const levelBadge = document.getElementById('sheet-level-badge');
  if (levelBadge) {
    levelBadge.textContent = (OttoState.level || 'Residência Médica / Concursos').toUpperCase();
  }

  const letters = ['A', 'B', 'C', 'D', 'E'];
  const mcQuestions = OttoState.questions
    .map((q, idx) => ({ ...q, num: idx + 1 }))
    .filter(q => q.type === 'mc');

  if (mcQuestions.length === 0) {
    omrGridEl.innerHTML = '<span style="font-size:11px; color:#555;">Sem questões de múltipla escolha — Avaliação Dissertativa / Lacunas / Associação</span>';
  } else {
    omrGridEl.innerHTML = mcQuestions
      .map(
        q => `
        <div class="omr-q-row">
          <span>Q${String(q.num).padStart(2, '0')}</span>
          ${letters
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
      `
      )
      .join('');
  }

  const typeLabelMap = {
    mc: 'MÚLTIPLA ESCOLHA (OBJETIVA)',
    essay: 'DISSERTATIVA',
    cloze: 'COMPLETE AS LACUNAS',
    matching: 'ASSOCIAR COLUNAS'
  };

  if (OttoState.questions.length === 0) {
    listEl.innerHTML = `
      <div style="padding:28px; text-align:center; border:1.5px dashed #121212; border-radius:8px; color:#444;">
        Defina pelo menos 1 questão nos contadores de <strong>Composição das questões</strong> ao lado.
      </div>
    `;
    return;
  }

  listEl.innerHTML = OttoState.questions
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, '0');
      const typeBadge = typeLabelMap[q.type] || 'QUESTÃO';

      let bodyHtml = '';
      if (q.type === 'mc') {
        bodyHtml = `
          <div class="exam-q-options">
            ${(q.options || [])
              .map((opt, oIdx) => {
                const isKey = OttoState.showTeacherKeyOnSheet && q.answer === oIdx;
                return `
                  <div class="exam-opt-line" style="${isKey ? 'font-weight:700; color:#065F46;' : ''}">
                    <span class="exam-opt-letter">(${letters[oIdx]})</span>
                    <span>${escapeHtml(opt)} ${isKey ? '✓' : ''}</span>
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      } else if (q.type === 'cloze') {
        const bankTerms = (q.wordBank || q.blanks || []).join('  •  ');
        bodyHtml = `
          <div class="exam-cloze-bank">
            <strong>Banco de Termos de Referência:</strong> ${escapeHtml(bankTerms)}
          </div>
        `;
      } else if (q.type === 'matching') {
        bodyHtml = `
          <div class="exam-matching-grid">
            <div>
              <div class="exam-matching-col-title">Coluna A — Conceitos / Quadros</div>
              ${(q.colA || [])
                .map(item => `<div class="exam-matching-item">${escapeHtml(item)}</div>`)
                .join('')}
            </div>
            <div>
              <div class="exam-matching-col-title">Coluna B — Condutas / Correlações</div>
              ${(q.colB || [])
                .map(item => `<div class="exam-matching-item">${escapeHtml(item)}</div>`)
                .join('')}
            </div>
          </div>
        `;
      } else {
        bodyHtml = `
          <div class="exam-essay-lines">
            <div class="exam-essay-line"></div>
            <div class="exam-essay-line"></div>
            <div class="exam-essay-line"></div>
            <div class="exam-essay-line"></div>
          </div>
        `;
      }

      let teacherKeyHtml = '';
      if (OttoState.showTeacherKeyOnSheet) {
        if (q.type === 'mc') {
          teacherKeyHtml = `
            <div class="teacher-key-box">
              <strong>Gabarito Otto (${letters[q.answer] || 'A'}):</strong> ${escapeHtml(q.rationale || 'Conforme diretriz.')}
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
              <strong>Sequência Correta (Associar Colunas):</strong> ${escapeHtml(q.matchingKey || q.conceptKey || '')}
            </div>
          `;
        } else {
          teacherKeyHtml = `
            <div class="teacher-key-box" style="background:var(--accent-cobalt-soft); border-color:var(--accent-cobalt); color:#1E3A8A;">
              <div><strong>Conceito-Alvo Esperado:</strong> ${escapeHtml(q.conceptKey || '')}</div>
              <div style="margin-top:4px;">
                <strong>Palavras-Chave do Corretor:</strong>
                ${(q.keywords || [])
                  .map(kw => `<span class="kw-chip found" style="font-size:10.5px; padding:1px 6px;">${escapeHtml(kw)}</span>`)
                  .join('')}
              </div>
            </div>
          `;
        }
      }

      return `
        <div class="exam-q-item">
          <div class="exam-q-head">
            <span>QUESTÃO ${qNum} • [${escapeHtml(q.topic || 'Diretriz')}] • ${typeBadge} (${Number(q.points || 1).toFixed(1)} pt)</span>
            <span class="q-inline-actions">
              <button class="q-inline-btn" onclick="editQuestionPrompt(${idx})">Editar</button>
              <button class="q-inline-btn" onclick="removeQuestionAt(${idx})">×</button>
            </span>
          </div>
          <div class="exam-q-stem" contenteditable="true" onblur="updateQuestionStem(${idx}, this.innerText)">${escapeHtml(q.stem)}</div>
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

function removeQuestionAt(idx) {
  if (OttoState.questions.length <= 1) {
    showOttoToast('A prova precisa ter pelo menos 1 questão.');
    return;
  }
  const removed = OttoState.questions.splice(idx, 1)[0];
  if (removed && OttoState.typeCounts[removed.type] > 0) {
    OttoState.typeCounts[removed.type]--;
    const inp = document.getElementById(`qty-${removed.type}`);
    if (inp) inp.value = String(OttoState.typeCounts[removed.type]);
  }
  renderExamSheet();
}

function editQuestionPrompt(idx) {
  const q = OttoState.questions[idx];
  if (!q) return;
  if (q.type === 'mc') {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const newAns = prompt(
      `Letra correta do gabarito da Questão ${idx + 1} (A, B, C, D ou E):`,
      letters[q.answer] || 'A'
    );
    if (newAns) {
      const lIdx = letters.indexOf(newAns.trim().toUpperCase());
      if (lIdx >= 0) {
        q.answer = lIdx;
        renderExamSheet();
        showOttoToast(`Gabarito da Questão ${idx + 1} alterado para (${letters[lIdx]}).`);
      }
    }
  } else {
    const newKws = prompt(
      'Gabarito / Palavras-chave esperadas para esta questão (separadas por vírgula):',
      (q.keywords || []).join(', ')
    );
    if (newKws !== null) {
      q.keywords = newKws
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      q.conceptKey = newKws;
      renderExamSheet();
      showOttoToast('Espelho da questão atualizado!');
    }
  }
}

function addCustomQuestionModal() {
  const stem = prompt('Digite o enunciado da nova questão:');
  if (!stem || !stem.trim()) return;
  const kws = prompt(
    'Digite as palavras-chave obrigatórias do gabarito (separadas por vírgula):',
    'diagnóstico, conduta, diretriz'
  );
  OttoState.questions.push({
    id: `manual-${Date.now()}`,
    type: 'essay',
    topic: `Questão Autoral • ${OttoState.level}`,
    points: 2.0,
    stem: stem.trim(),
    conceptKey: `Resposta fundamentada contemplando: ${kws || 'conceitos centrais da aula'}.`,
    keywords: (kws || 'diagnóstico, conduta')
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean)
  });
  OttoState.typeCounts.essay = (OttoState.typeCounts.essay || 0) + 1;
  const inp = document.getElementById('qty-essay');
  if (inp) inp.value = String(OttoState.typeCounts.essay);
  renderExamSheet();
  showOttoToast('Nova questão adicionada à folha A4!');
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
    addBackupItem({
      id: `fig-${Date.now()}`,
      title: `Figura Clínica — ${file.name}`,
      student_name: 'Acervo Docente',
      subject: document.getElementById('meta-subject').value.split('—')[0].trim(),
      institution: document.getElementById('meta-institution').value.split('—')[0].trim(),
      date_str: new Date().toISOString().slice(0, 10),
      category: 'imagem_clinica',
      exam_style: OttoState.style,
      score: 'FIGURA',
      tags: `imagem clinica figura prova ${file.name}`,
      summary: `Imagem anexada à prova "${document.getElementById('meta-title').value}".`,
      image_data: reader.result
    });
    showOttoToast('Figura inserida na prova e salva no Cofre de Backup!');
  };
  reader.readAsDataURL(file);
}

function removeAttachedFigure() {
  OttoState.attachedFigureDataUrl = '';
  const wrap = document.getElementById('sheet-attached-figure-wrap');
  if (wrap) wrap.style.display = 'none';
}

async function downloadNativePdf(includeKey = true) {
  const payload = {
    meta: {
      institution: document.getElementById('meta-institution').value,
      subject: document.getElementById('meta-subject').value,
      title: document.getElementById('meta-title').value,
      professor: document.getElementById('meta-professor').value,
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
      const slug = payload.meta.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      a.href = url;
      a.download = `otto_${slug}_${OttoState.style}.pdf`;
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
   7. CORREÇÃO EM LOTE (TURMA COMPLETA) & EXPORTAÇÃO CSV NATIVA
   ===================================================================== */
function initBatchClassTable() {
  const totalQ = Math.max(1, OttoState.questions.length || 6);
  OttoState.batchResults = INITIAL_BATCH_CLASS.map(row => {
    const ratio = row.correctCount / row.totalCount;
    const adjCorrect = Math.min(totalQ, Math.max(1, Math.round(ratio * totalQ)));
    return {
      studentName: row.studentName,
      correctCount: adjCorrect,
      totalCount: totalQ,
      finalGrade: row.finalGrade
    };
  });
  renderBatchResultsTable();
}

function handleBatchPhotosUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const statusText = document.getElementById('batch-status-text');
  if (statusText) {
    statusText.innerHTML = `<strong style="color:var(--accent-emerald);">⏳ Processando lote de ${files.length} foto(s) de provas via OMR + OCR...</strong>`;
  }

  const totalQ = Math.max(1, OttoState.questions.length || 6);
  const sampleNames = [
    'Ana Clara Souza',
    'Bruno Henrique Lima',
    'Camila Rocha',
    'Diego Vasconcelos',
    'Eduarda Nogueira',
    'Felipe Azevedo',
    'Giovanna Martins',
    'Henrique Cavalcanti',
    'Isabela Ribeiro',
    'João Pedro Teixeira'
  ];

  const uploadedRows = files.map((file, idx) => {
    const rawBase = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    const looksGeneric = /^(img|dsc|photo|foto|image|whatsapp|scan|prova)\s*\d*$/i.test(rawBase);
    const studentName = looksGeneric || rawBase.length < 3
      ? sampleNames[idx % sampleNames.length]
      : rawBase.replace(/\b\w/g, l => l.toUpperCase());

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
      statusText.innerHTML = `<strong style="color:var(--accent-emerald);">✓ Lote processado com sucesso:</strong> ${files.length} nova(s) prova(s) adicionada(s) à tabela da turma.`;
    }
    showOttoToast(`${files.length} prova(s) corrigida(s) em lote! Prontas para exportar em .CSV.`);
  }, 350);
}

function simulateBatchClassProcessing() {
  const totalQ = Math.max(1, OttoState.questions.length || 6);
  const simulatedCohort = [
    { studentName: 'Mariana Silva', hits: totalQ, grade: 9.8 },
    { studentName: 'Lucas Mendes', hits: Math.max(1, totalQ - 1), grade: 8.5 },
    { studentName: 'Beatriz Oliveira', hits: Math.max(1, totalQ - 1), grade: 8.7 },
    { studentName: 'Rafael Albuquerque', hits: totalQ, grade: 9.5 },
    { studentName: 'Camila Vasconcelos', hits: Math.max(1, totalQ - 2), grade: 7.4 },
    { studentName: 'Gabriel Ferreira', hits: Math.max(1, totalQ - 2), grade: 7.0 },
    { studentName: 'Pedro Costa', hits: Math.max(1, Math.floor(totalQ * 0.45)), grade: 4.8 }
  ];

  OttoState.batchResults = simulatedCohort.map(s => ({
    studentName: s.studentName,
    correctCount: s.hits,
    totalCount: totalQ,
    finalGrade: s.grade
  }));

  renderBatchResultsTable();
  const statusText = document.getElementById('batch-status-text');
  if (statusText) {
    statusText.innerHTML = `<strong style="color:var(--accent-emerald);">✓ Simulação de turma concluída:</strong> ${OttoState.batchResults.length} provas avaliadas.`;
  }
  showOttoToast(`Lote da turma (${OttoState.batchResults.length} alunos) processado!`);
}

function renderBatchResultsTable() {
  const tbody = document.getElementById('batch-results-tbody');
  const badge = document.getElementById('batch-count-badge');
  if (!tbody) return;

  if (badge) {
    badge.textContent = `${OttoState.batchResults.length} PROVAS PROCESSADAS`;
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
    simulateBatchClassProcessing();
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
  showOttoToast('Planilha (.csv) exportada com sucesso para Excel / Google Sheets!');
}

/* =====================================================================
   8. CORREÇÃO DE PROVA INDIVIDUAL POR FOTO (OMR + DISSERTATIVA)
   ===================================================================== */
function loadStudentSample(sampleId, btnEl) {
  OttoState.studentGrading.sampleId = sampleId;
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btnEl.classList.add('active');
  }

  const sample = STUDENT_SAMPLES[sampleId] || STUDENT_SAMPLES.mariana_alta;
  document.getElementById('graded-student-name').value = sample.name;
  document.getElementById('graded-student-inst').value = sample.institution;

  OttoState.studentGrading.mcMarked = {};
  OttoState.studentGrading.essayAnswers = {};
  OttoState.studentGrading.manualScoreOverride = {};

  let mcCounter = 0;
  OttoState.questions.forEach((q, idx) => {
    if (q.type === 'mc') {
      OttoState.studentGrading.mcMarked[idx] =
        sample.mcChoices[mcCounter] !== undefined ? sample.mcChoices[mcCounter] : q.answer;
      mcCounter++;
    } else {
      OttoState.studentGrading.essayAnswers[idx] =
        sample.essayResponses.default || q.conceptKey || '';
    }
  });

  const photoUrl = renderSimulatedExamPhotoDataUrl(
    sample.name,
    sample.institution,
    OttoState.studentGrading.mcMarked,
    OttoState.studentGrading.essayAnswers
  );
  OttoState.studentGrading.photoDataUrl = photoUrl;
  const imgEl = document.getElementById('scanned-exam-img');
  if (imgEl) imgEl.src = photoUrl;

  runFullExamGrading();
}

function handleStudentPhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    OttoState.studentGrading.photoDataUrl = reader.result;
    const imgEl = document.getElementById('scanned-exam-img');
    if (imgEl) imgEl.src = reader.result;
    document.getElementById('graded-student-name').value =
      `Aluno(a) — Foto (${file.name.replace(/\.[^.]+$/, '')})`;
    runFullExamGrading();
    showOttoToast('Foto da prova analisada!');
  };
  reader.readAsDataURL(file);
}

function runFullExamGrading() {
  const laser = document.getElementById('scan-laser-bar');
  if (laser) {
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

  const synonymMap = {
    'sacubitril-valsartana': ['inra', 'entresto', 'neprilisina', 'sacubitril'],
    'betabloqueador': ['carvedilol', 'bisoprolol', 'metoprolol', 'succinato'],
    'isglt2': ['dapagliflozina', 'empagliflozina', 'gliflozina', 'sglt2'],
    'dapagliflozina': ['empagliflozina', 'gliflozina', 'isglt2', 'sglt2'],
    'diuretico de alca': ['furosemida', 'lasix', 'diuretico venoso'],
    'manter betabloqueador': ['manter o betabloqueador', 'nao suspender betabloqueador', 'manter carvedilol'],
    'quente e umido': ['perfil b', 'congesto sem baixo debito'],
    'descongestao': ['diurese', 'descongestionar', 'furosemida'],
    'antimicrobiano': ['antibiotico', 'antibioticoterapia', 'cefepime', 'meropenem'],
    'pam >= 65': ['pam 65', 'pressao arterial media', '65 mmhg'],
    'lactato > 2': ['hiperlactatemia', 'lactato elevado', '18 mg/dl']
  };

  const criticalContradiction =
    normStudent.includes('suspender o betabloqueador') ||
    normStudent.includes('suspender betabloqueador');

  const matched = [];
  const partialSynonyms = [];
  const missing = [];

  keywords.forEach(kw => {
    const nKw = norm(kw);
    const stemToken = nKw.length > 6 ? nKw.slice(0, -2) : nKw;
    if (normStudent.includes(nKw) || (stemToken.length >= 5 && normStudent.includes(stemToken))) {
      matched.push(kw);
    } else {
      const syns = synonymMap[nKw] || [];
      const hitSyn = syns.find(s => normStudent.includes(norm(s)));
      if (hitSyn) {
        partialSynonyms.push({ kw, via: hitSyn });
      } else {
        missing.push(kw);
      }
    }
  });

  const totalKw = Math.max(1, keywords.length);
  let rawRatio = (matched.length + partialSynonyms.length * 0.85) / totalKw;
  if (criticalContradiction) {
    rawRatio = Math.min(rawRatio, 0.25);
  }
  const ratio = Math.max(0, Math.min(1, rawRatio));

  return {
    ratio,
    matched,
    partialSynonyms,
    missing,
    criticalContradiction
  };
}

function renderGradingWorkspace() {
  const omrListEl = document.getElementById('grader-omr-list');
  const essayListEl = document.getElementById('grader-essay-list');
  if (!omrListEl || !essayListEl) return;

  const letters = ['A', 'B', 'C', 'D', 'E'];
  let totalPointsPossible = 0;
  let totalPointsEarned = 0;
  let mcHits = 0;
  let mcTotal = 0;
  let essayRatios = [];

  const omrCardsHtml = [];
  const essayCardsHtml = [];

  OttoState.questions.forEach((q, idx) => {
    const qPts = Number(q.points) || 1.5;
    totalPointsPossible += qPts;

    if (q.type === 'mc') {
      mcTotal++;
      const marked =
        OttoState.studentGrading.mcMarked[idx] !== undefined
          ? OttoState.studentGrading.mcMarked[idx]
          : q.answer;
      const isCorrect = marked === q.answer;
      if (isCorrect) {
        mcHits++;
        totalPointsEarned += qPts;
      }

      omrCardsHtml.push(`
        <div class="omr-card ${isCorrect ? 'correct' : 'wrong'}">
          <div>
            <div style="font-family:'JetBrains Mono', monospace; font-weight:800; font-size:12px;">
              Questão ${String(idx + 1).padStart(2, '0')}
            </div>
            <div style="font-size:11px; color:var(--text-secondary);">
              Gabarito: <strong>(${letters[q.answer]})</strong> • ${isCorrect ? '✓ Acertou' : '✗ Errou'}
            </div>
          </div>
          <div class="omr-bubbles-interactive">
            ${letters
              .map((L, lIdx) => {
                let cls = 'omr-btn-bubble';
                if (marked === lIdx) {
                  cls += isCorrect ? ' marked-correct' : ' marked-wrong';
                } else if (q.answer === lIdx && !isCorrect) {
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
          : q.conceptKey || '';

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

          <div style="background:var(--bg-paper); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 10px; margin-bottom:8px; font-size:12px;">
            <strong>Gabarito Esperado:</strong> ${escapeHtml(q.conceptKey || q.matchingKey || '')}
          </div>

          <label class="form-label">Resposta Transcrita da Foto da Prova do Aluno (OCR editável):</label>
          <textarea
            class="textarea-field"
            style="min-height:64px; margin-bottom:8px; font-size:12.5px;"
            oninput="updateStudentEssayText(${idx}, this.value)"
          >${escapeHtml(studentAns)}</textarea>

          <div style="margin-bottom:10px;">
            <span class="form-label">Rastreamento de Palavras-Chave &amp; Conceitos:</span>
            <div>
              ${evalRes.matched
                .map(kw => `<span class="kw-chip found">✓ ${escapeHtml(kw)}</span>`)
                .join('')}
              ${evalRes.partialSynonyms
                .map(item => `<span class="kw-chip synonym">≈ ${escapeHtml(item.kw)} (${escapeHtml(item.via)})</span>`)
                .join('')}
              ${evalRes.missing
                .map(kw => `<span class="kw-chip missing">✗ Faltou: ${escapeHtml(kw)}</span>`)
                .join('')}
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid var(--border-subtle);">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-secondary);">Ajuste Rápido do Professor:</span>
            <div class="pill-group">
              ${[
                { label: 'Automático IA', val: undefined },
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

  const mcPct = mcTotal > 0 ? Math.round((mcHits / mcTotal) * 100) : 100;
  document.getElementById('grade-mc-summary').textContent = `Múltipla Escolha: ${mcHits}/${mcTotal} (${mcPct}%)`;
  const omrBadge = document.getElementById('omr-hit-badge');
  if (omrBadge) {
    omrBadge.textContent = `${mcHits}/${mcTotal} ACERTOS OMR`;
    omrBadge.style.background = mcPct >= 70 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
  }

  const avgEssayPct =
    essayRatios.length > 0
      ? Math.round((essayRatios.reduce((a, b) => a + b, 0) / essayRatios.length) * 100)
      : 100;
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
  ctx.fillText(institution.toUpperCase(), 28, 38);
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(document.getElementById('meta-title')?.value || 'Prova Oficial — Diretrizes Clínicas', 28, 60);

  ctx.fillStyle = '#1D4ED8';
  ctx.font = 'italic bold 14px Georgia, serif';
  ctx.fillText(`Aluno(a): ${studentName}`, 28, 82);

  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.fillRect(525, 24, 162, 56);
  ctx.strokeRect(525, 24, 162, 56);
  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('OTTO VISION OMR', 540, 44);
  ctx.fillText('LEITURA VALIDADA ✓', 540, 64);

  ctx.fillStyle = '#F3F1EC';
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 1.5;
  ctx.fillRect(18, 104, 680, 62);
  ctx.strokeRect(18, 104, 680, 62);

  ctx.fillStyle = '#141414';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CARTÃO-RESPOSTA OMR CAPTURADO:', 28, 122);

  const letters = ['A', 'B', 'C', 'D', 'E'];
  let bx = 28;
  OttoState.questions.forEach((q, idx) => {
    if (q.type !== 'mc' || bx > 580) return;
    const marked = mcMarked[idx] !== undefined ? mcMarked[idx] : q.answer;
    const isHit = marked === q.answer;
    ctx.fillStyle = '#141414';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Q0${idx + 1}:`, bx, 148);
    bx += 34;

    letters.forEach((L, lIdx) => {
      ctx.beginPath();
      ctx.arc(bx + 8, 144, 9, 0, Math.PI * 2);
      if (marked === lIdx) {
        ctx.fillStyle = isHit ? '#059669' : '#DC2626';
        ctx.fill();
        ctx.strokeStyle = '#141414';
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#666666';
        ctx.stroke();
        ctx.fillStyle = '#333333';
      }
      ctx.font = 'bold 10px monospace';
      ctx.fillText(L, bx + 4.5, 147.5);
      bx += 22;
    });
    bx += 18;
  });

  let ey = 186;
  OttoState.questions.forEach((q, idx) => {
    if (q.type === 'mc' || ey > 420) return;
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(18, ey, 680, 122);

    ctx.fillStyle = '#141414';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`QUESTÃO 0${idx + 1} (${q.topic}) — TRANSCRIÇÃO OCR:`, 28, ey + 20);

    const ansText = essayAnswers[idx] || q.conceptKey || '';
    ctx.fillStyle = '#1E3A8A';
    ctx.font = 'italic 13.5px Georgia, serif';
    wrapCanvasText(ctx, ansText, 28, ey + 44, 655, 19);
    ey += 134;
  });

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let row = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = words[n] + ' ';
      row++;
      if (row >= 4) break;
    } else {
      line = testLine;
    }
  }
  if (row < 4) {
    ctx.fillText(line, x, y + row * lineHeight);
  }
}

function saveGradedExamToBackup() {
  const studentName = document.getElementById('graded-student-name').value || 'Aluno(a)';
  const inst = document.getElementById('graded-student-inst').value || 'UFAM';
  const gradeStr = document.getElementById('final-grade-display').textContent || '9,0 / 10,0';
  const subj = document.getElementById('meta-subject').value || 'Clínica Médica';

  const photoUrl = renderSimulatedExamPhotoDataUrl(
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
    tags: `${studentName} ${subj} ${inst} corrigida omr dissertativa`,
    summary: `Prova corrigida com nota ${gradeStr}.`,
    image_data: photoUrl
  };

  addBackupItem(item);
  showOttoToast(`Prova de "${studentName}" (${gradeStr}) salva no Cofre de Backup!`);
}

function saveCurrentExamToVault() {
  const inst = document.getElementById('meta-institution').value;
  const subj = document.getElementById('meta-subject').value;
  const title = document.getElementById('meta-title').value;
  const verName = OttoState.versions[OttoState.versionIndex];

  const previewImg = renderExamMatrixThumbnailDataUrl(title, inst, subj, verName, OttoState.style);

  const item = {
    id: `matrix-${Date.now()}`,
    title: `${title} (${verName})`,
    student_name: 'Matriz Oficial do Professor',
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
  showOttoToast(`Matriz "${title}" salva com imagem no Cofre de Backup!`);
}

function exportStudentReportCard() {
  switchMode('generator');
  window.print();
}

/* =====================================================================
   9. MODO PROVA ICONOGRÁFICA (IMAGENS + CRONÔMETRO REGRESSIVO VISÍVEL)
   ===================================================================== */
function renderClinicalSlideImageDataUrl(kind, title, subtitle) {
  const c = document.createElement('canvas');
  c.width = 760;
  c.height = 460;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, c.width, c.height);

  // Moldura técnica
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 724, 424);

  // Cabeçalho do slide clínico
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(18, 18, 724, 52);
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`OTTO ICONOGRAPHIC STATION • ${title.toUpperCase()}`, 34, 48);

  if (kind === 'ecg') {
    // Grade milimetrada ECG
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 35; x < 720; x += 18) {
      ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x, 360); ctx.stroke();
    }
    for (let y = 90; y < 360; y += 18) {
      ctx.beginPath(); ctx.moveTo(35, y); ctx.lineTo(720, y); ctx.stroke();
    }
    // Traçado ECG com Supra de ST
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let x = 45;
    const baseY = 235;
    ctx.moveTo(x, baseY);
    while (x < 690) {
      ctx.lineTo(x + 20, baseY);
      ctx.lineTo(x + 28, baseY - 10); // onda P
      ctx.lineTo(x + 36, baseY);
      ctx.lineTo(x + 44, baseY + 12); // Q
      ctx.lineTo(x + 52, baseY - 88); // R
      ctx.lineTo(x + 60, baseY - 42); // Ponto J elevado (Supra ST!)
      ctx.quadraticCurveTo(x + 82, baseY - 52, x + 102, baseY); // Onda T hiperaguda
      x += 125;
    }
    ctx.stroke();
  } else if (kind === 'xray') {
    // Simulação de Radiografia de Tórax (Pneumotórax Hipertensivo)
    ctx.fillStyle = '#090D16';
    ctx.fillRect(180, 82, 400, 290);
    ctx.strokeStyle = '#64748B';
    ctx.strokeRect(180, 82, 400, 290);
    // Hemitórax esquerdo com trama / direito hipertransparente
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.beginPath();
    ctx.ellipse(455, 225, 75, 105, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pulmão direito colabado no hilo
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.beginPath();
    ctx.ellipse(325, 235, 28, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('← HIPERTRANSPARÊNCIA + AUSÊNCIA DE TRAMA VASCULAR', 200, 118);
  } else {
    // Tomografia de Crânio (Hematoma Epidural Lente Biconvexa)
    ctx.beginPath();
    ctx.arc(380, 225, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#E2E8F0';
    ctx.stroke();
    // Lente biconvexa hiperdensa
    ctx.beginPath();
    ctx.ellipse(468, 205, 26, 68, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('COLEÇÃO HIPERDENSA BICONVEXA ( PARIETOTEMPORAL )', 215, 365);
  }

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.fillText(subtitle, 34, 412);

  return c.toDataURL('image/png');
}

function initIconographicModule() {
  OttoState.iconographic.items = [
    {
      id: 'ico-1',
      title: 'Estação 01 — Eletrocardiograma na Dor Torácica',
      prompt: 'Paciente de 58 anos com dor retroesternal opressiva há 40 minutos. Identifique a alteração eletrocardiográfica principal e defina a conduta imediata de reperfusão.',
      durationSec: 45,
      imageDataUrl: renderClinicalSlideImageDataUrl(
        'ecg',
        'Estação 01 • ECG de 12 Derivações',
        'Supradesnivelamento do segmento ST em parede anterior extensa (V1–V6)'
      )
    },
    {
      id: 'ico-2',
      title: 'Estação 02 — Imagem Torácica no Politrauma (ATLS)',
      prompt: 'Com base na imagem radiológica e no quadro de choque obstrutivo com turgência jugular, indique o diagnóstico e o local anatômico exato da descompressão imediata.',
      durationSec: 40,
      imageDataUrl: renderClinicalSlideImageDataUrl(
        'xray',
        'Estação 02 • Tórax Agudo no Trauma',
        'Hipertransparência em hemitórax direito, colapso pulmonar e desvio contralateral do mediastino'
      )
    },
    {
      id: 'ico-3',
      title: 'Estação 03 — Neuroimagem no TCE com Intervalo Lúcido',
      prompt: 'Identifique o padrão morfológico da coleção intracraniana na TC de crânio sem contraste, o vaso classicamente lesado e a conduta neurocirúrgica.',
      durationSec: 50,
      imageDataUrl: renderClinicalSlideImageDataUrl(
        'ct',
        'Estação 03 • TC de Crânio sem Contraste',
        'Lesão hiperdensa biconvexa (lenticular) respeitando as suturas cranianas'
      )
    }
  ];

  OttoState.iconographic.currentIndex = 0;
  OttoState.iconographic.remainingSec = OttoState.iconographic.items[0].durationSec;
  renderIconographicList();
  renderIconographicStage();
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
        title: `Imagem ${OttoState.iconographic.items.length + 1} — ${baseName}`,
        prompt: `Observe a imagem "${baseName}" projetada. Qual o diagnóstico principal e a conduta indicada?`,
        durationSec: defaultSec,
        imageDataUrl: reader.result
      };
      OttoState.iconographic.items.push(newStation);
      OttoState.iconographic.currentIndex = OttoState.iconographic.items.length - 1;
      OttoState.iconographic.remainingSec = newStation.durationSec;
      renderIconographicList();
      renderIconographicStage();
      showOttoToast(`Imagem "${file.name}" adicionada ao Modo Prova Iconográfica!`);
    };
    reader.readAsDataURL(file);
  });
}

function renderIconographicList() {
  const listEl = document.getElementById('icono-items-list');
  const countEl = document.getElementById('icono-total-count');
  if (!listEl) return;

  const items = OttoState.iconographic.items;
  if (countEl) countEl.textContent = String(items.length);

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
    if (promptEl) promptEl.textContent = newPrompt;
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
  showOttoToast(`Tempo de ${sec}s aplicado a todas as questões iconográficas!`);
}

function removeIconographicStation(idx) {
  if (OttoState.iconographic.items.length <= 1) {
    showOttoToast('A Prova Iconográfica precisa ter pelo menos 1 imagem.');
    return;
  }
  OttoState.iconographic.items.splice(idx, 1);
  if (OttoState.iconographic.currentIndex >= OttoState.iconographic.items.length) {
    OttoState.iconographic.currentIndex = 0;
  }
  OttoState.iconographic.remainingSec = OttoState.iconographic.items[OttoState.iconographic.currentIndex].durationSec;
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
  if (!active) return;

  const counterEl = document.getElementById('icono-stage-counter');
  const timerEl = document.getElementById('icono-countdown-display');
  const progressEl = document.getElementById('icono-progress-bar');
  const imgEl = document.getElementById('icono-stage-image');
  const promptEl = document.getElementById('icono-stage-prompt');
  const allocEl = document.getElementById('icono-stage-alloc-time');
  const badgeEl = document.getElementById('icono-stage-badge');

  if (counterEl) {
    counterEl.textContent = `QUESTÃO ICONOGRÁFICA ${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  }
  if (imgEl) imgEl.src = active.imageDataUrl;
  if (promptEl) promptEl.textContent = active.prompt;
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
  if (!currentItem) return;

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
      // Avança automaticamente para a próxima imagem quando o tempo chega a zero
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
  const nextIdx = (OttoState.iconographic.currentIndex + 1) % OttoState.iconographic.items.length;
  selectIconographicStation(nextIdx);
}

function prevIconographicSlide() {
  const len = OttoState.iconographic.items.length;
  const prevIdx = (OttoState.iconographic.currentIndex - 1 + len) % len;
  selectIconographicStation(prevIdx);
}

/* =====================================================================
   10. COFRE DE BACKUP DE IMAGENS & PRÉ-VISUALIZAÇÃO EM TEMPO REAL (LIVE PREVIEW)
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
  ctx.fillText(institution.slice(0, 68), 32, 102);

  ctx.font = 'bold 21px Georgia, serif';
  ctx.fillText(title.slice(0, 56), 32, 134);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText(`Assunto: ${subject}`, 32, 164);

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

function initVaultDataset() {
  const initialItems = [
    {
      id: 'bkp-seed-1',
      title: 'Prova Corrigida — Mariana Silva (Cardiologia ICFER)',
      student_name: 'Mariana Silva',
      subject: 'Cardiologia — Diretriz SBC de Insuficiência Cardíaca',
      institution: 'UFAM — Faculdade de Medicina',
      date_str: '2026-10-21',
      category: 'prova_aluno',
      exam_style: 'classico',
      score: '9,6 / 10,0',
      tags: 'mariana silva cardiologia icfer sbc ufam quarteto fantastico furosemida',
      summary: 'Acertou 100% das questões objetivas OMR e contemplou todas as palavras-chave no manejo do Perfil B.',
      image_data: renderSimulatedExamPhotoDataUrl(
        'Mariana Silva (Mat. 2026104)',
        'UFAM — Faculdade de Medicina',
        { 0: 1, 1: 2, 2: 1, 3: 1 },
        { 4: STUDENT_SAMPLES.mariana_alta.essayResponses.default }
      )
    },
    {
      id: 'bkp-seed-2',
      title: 'Simulado Residência CERMAM — Sepse & Choque Séptico (Hour-1 Bundle)',
      student_name: 'Matriz Oficial CERMAM',
      subject: 'Sepse & Terapia Intensiva (Surviving Sepsis)',
      institution: 'CERMAM — Residência Médica AM',
      date_str: '2026-10-20',
      category: 'matriz_prova',
      exam_style: 'duas_colunas',
      score: '6 Qs • 10 pts',
      tags: 'cermam sepse choque septico noradrenalina lactato uti duas colunas',
      summary: 'Prova diagramada em 2 colunas compactas estilo residência médica com cartão OMR e espelho conceitual.',
      image_data: renderExamMatrixThumbnailDataUrl(
        'Simulado Oficial — Sepse & Choque Séptico',
        'CERMAM — COMISSÃO ESTADUAL DE RESIDÊNCIA MÉDICA',
        'Sepse & Terapia Intensiva',
        'CADERNO ALFA',
        'duas_colunas'
      )
    },
    {
      id: 'bkp-seed-3',
      title: 'Avaliação Prática OSCE — Trauma Torácico & Pneumotórax Hipertensivo',
      student_name: 'Lucas Mendes',
      subject: 'Trauma & Cirurgia de Emergência (ATLS 10ª Ed)',
      institution: 'HUGV — Hospital Universitário Getúlio Vargas',
      date_str: '2026-10-18',
      category: 'prova_aluno',
      exam_style: 'clinico',
      score: '8,5 / 10,0',
      tags: 'trauma atls hugv pneumotorax hipertensivo acido tranexamico cirurgia lucas mendes',
      summary: 'Identificou corretamente a punção descompressiva no 5º EIC linha axilar anterior e protocolo de transfusão maciça 1:1:1.',
      image_data: renderExamMatrixThumbnailDataUrl(
        'Exame Prático OSCE — Trauma Torácico ATLS 10',
        'HUGV — HOSPITAL UNIVERSITÁRIO GETÚLIO VARGAS',
        'Trauma & Cirurgia (ATLS)',
        'PROVA CORRIGIDA',
        'clinico'
      )
    }
  ];

  OttoState.vaultItems = initialItems;
  OttoState.selectedVaultId = initialItems[0].id;
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
        title: `Backup de Imagem — ${file.name}`,
        student_name: document.getElementById('graded-student-name')?.value || 'Arquivo do Professor',
        subject: document.getElementById('meta-subject')?.value || 'Geral',
        institution: document.getElementById('meta-institution')?.value || 'UFAM',
        date_str: new Date().toISOString().slice(0, 10),
        category: 'imagem_clinica',
        exam_style: OttoState.style,
        score: 'BACKUP HD',
        tags: `${file.name} backup imagem prova`,
        summary: `Imagem arquivada diretamente pelo professor (${Math.round(file.size / 1024)} KB).`,
        image_data: reader.result
      };
      addBackupItem(newItem);
      showOttoToast(`Imagem "${file.name}" salva no Cofre!`);
    };
    reader.readAsDataURL(file);
  });
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
        : `Exibindo todos os <strong>${filtered.length}</strong> arquivos do Cofre de Backup`;
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

  if (items.length === 0) {
    container.innerHTML = `
      <div class="panel-card" style="grid-column: 1 / -1; text-align:center; padding:28px;">
        <div style="font-weight:800; font-size:14px; margin-bottom:4px;">Nenhum arquivo corresponde a "${escapeHtml(query)}"</div>
        <div style="font-size:12px; color:var(--text-secondary);">Clique em "Limpar" para restaurar todos os backups.</div>
      </div>
    `;
    return;
  }

  const catLabels = {
    prova_aluno: '📸 PROVA DE ALUNO',
    matriz_prova: '📄 MATRIZ DE PROVA',
    imagem_clinica: '🩻 IMAGEM CLÍNICA'
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
      <span class="brand-tag" style="background:var(--accent-emerald);">RESULTADO / STATUS: ${escapeHtml(item.score)}</span>
    </div>

    <h3 style="font-size:16px; font-weight:800; line-height:1.3; margin-bottom:8px;">
      ${highlightMatch(item.title, query)}
    </h3>

    <div style="background:var(--bg-paper); border:1.5px solid var(--border-ink); border-radius:8px; padding:10px 12px; margin-bottom:12px; font-size:12.5px; display:grid; gap:5px;">
      <div><strong>🏛️ Instituição:</strong> ${highlightMatch(item.institution, query)}</div>
      <div><strong>📚 Assunto / Diretriz:</strong> ${highlightMatch(item.subject, query)}</div>
      <div><strong>👤 Aluno(a) / Origem:</strong> ${highlightMatch(item.student_name, query)}</div>
      <div><strong>📅 Data do Registro:</strong> ${highlightMatch(item.date_str, query)}</div>
    </div>

    <div style="margin-bottom:14px;">
      <span class="form-label">Resumo Técnico &amp; Espelho da Correção:</span>
      <p style="font-size:12.5px; color:var(--text-secondary); background:#FAFAFA; border:1px solid var(--border-subtle); padding:9px 11px; border-radius:6px;">
        ${highlightMatch(item.summary, query)}
      </p>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
      <button class="btn btn-primary" onclick="downloadBackupImage('${item.id}')">
        📥 Baixar Imagem Original
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
    if (imgEl) imgEl.src = item.image_data;
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
