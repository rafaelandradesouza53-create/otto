/**
 * OTTO. — Motor Full Stack de Geração de Provas, Diagramação A4,
 * Correção por Foto (OMR + Dissertativa por Conceito/Palavras-Chave)
 * e Cofre de Backup com Live Preview em Tempo Real.
 */

const OttoState = {
  mode: 'generator',
  guidelineKey: 'sbc_ic',
  format: 'mista',     // 'mista' | 'mc' | 'essay'
  count: 6,
  level: 'residencia', // 'graduacao' | 'residencia'
  style: 'classico',   // 'classico' | 'duas_colunas' | 'clinico'
  versionIndex: 0,
  versions: ['CADERNO ALFA', 'CADERNO BETA', 'CADERNO GAMA'],
  showTeacherKeyOnSheet: true,
  attachedFigureDataUrl: '',
  questions: [],
  studentGrading: {
    sampleId: 'mariana_alta',
    photoDataUrl: '',
    mcMarked: {},       // { qIndex: 0..4 }
    essayAnswers: {},   // { qIndex: "texto do aluno" }
    manualScoreOverride: {} // { qIndex: ratio 0..1 }
  },
  vaultItems: [],
  selectedVaultId: null
};

/* =====================================================================
   1. DIRETRIZES DA SAÚDE & BANCOS DE CONHECIMENTO BASE DO PROFESSOR
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
        rationale: 'A noradrenalina é o vasopressor de 1ª escolha no choque séptico (alvo PAM >= 65 mmHg), adicionando-se vasopressina (até 0,03 U/min) quando necessário poupar catecolaminas.'
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
        type: 'mc',
        topic: 'Corticoterapia • Choque Refratário',
        points: 1.5,
        stem: 'Quando está indicada a associação de corticosteroide sistêmico no manejo do paciente adulto em choque séptico segundo a Surviving Sepsis Campaign?',
        options: [
          'Em todos os pacientes com infecção urinária baixa sem disfunção orgânica.',
          'No choque séptico refratário que mantém necessidade contínua de vasopressor, utilizando-se hidrocortisona 200 mg/dia EV.',
          'Apenas usando dexametasona intramuscular em dose única na triagem.',
          'É formalmente contraindicado qualquer corticoide no choque séptico.',
          'Somente após 14 dias de internação em UTI.'
        ],
        answer: 1,
        rationale: 'A hidrocortisona EV (200 mg/dia divididos ou em infusão contínua) é recomendada no choque séptico com demanda contínua de vasopressor.'
      },
      {
        id: 'sep-5',
        type: 'essay',
        topic: 'Dissertativa • Hour-1 Bundle',
        points: 2.0,
        stem: 'Descreva os 5 elementos que compõem o Pacote de 1 Hora (Hour-1 Bundle) da Surviving Sepsis Campaign e especifique a meta pressórica inicial.',
        conceptKey: 'O pacote de 1 hora compreende: mensurar lactato sérico, coletar hemoculturas antes do antibiótico, iniciar antimicrobiano de amplo espectro na 1ª hora, infundir 30 mL/kg de cristaloide se hipotensão ou lactato >= 4 mmol/L, e iniciar noradrenalina para manter PAM >= 65 mmHg.',
        keywords: [
          'lactato',
          'hemocultura',
          'antimicrobiano',
          'cristaloide',
          '30 ml/kg',
          'noradrenalina',
          'pam >= 65'
        ]
      },
      {
        id: 'sep-6',
        type: 'essay',
        topic: 'Dissertativa • Vasopressores no Choque',
        points: 2.0,
        stem: 'Explique os critérios diagnósticos de Choque Séptico pelo consenso Sepsis-3 e a sequência escalonada de suporte vasopressor e corticoterapia quando há refratariedade.',
        conceptKey: 'Choque séptico exige vasopressor para PAM >= 65 mmHg e lactato > 2 mmol/L após volume. Inicia-se noradrenalina como 1ª escolha, associa-se vasopressina como 2ª linha e hidrocortisona 200 mg/dia no choque refratário.',
        keywords: [
          'vasopressor',
          'lactato > 2',
          'noradrenalina',
          'vasopressina',
          'hidrocortisona',
          'pam >= 65'
        ]
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
        rationale: 'A ressuscitação hemostática utiliza hemocomponentes balanceados 1:1:1, restrição de cristaloides e ácido tranexâmico (1g em 10 min + 1g em 8h) iniciado em até 3 horas do trauma.'
      },
      {
        id: 'tr-3',
        type: 'essay',
        topic: 'Dissertativa • Pneumotórax Hipertensivo & ATLS 10',
        points: 3.0,
        stem: 'Descreva a tríade clínica/fisiopatológica do choque obstrutivo por pneumotórax hipertensivo, por que a radiografia não deve atrasar a conduta e a atualização do ATLS 10ª edição quanto ao local da punção no adulto.',
        conceptKey: 'O pneumotórax hipertensivo gera choque obstrutivo com murmúrio vesicular abolido, hipertimpanismo e turgência jugular. O diagnóstico é clínico (sem aguardar raio-X), realizando-se descompressão no 4º ou 5º espaço intercostal na linha axilar anterior seguida de drenagem em selo d’água.',
        keywords: [
          'choque obstrutivo',
          'murmurio abolido',
          'hipertimpanismo',
          'diagnostico clinico',
          '5 espaco intercostal',
          'linha axilar anterior',
          'drenagem'
        ]
      },
      {
        id: 'tr-4',
        type: 'essay',
        topic: 'Dissertativa • Tríade Letal do Trauma',
        points: 3.0,
        stem: 'Cite os 3 componentes da "Tríade Letal do Trauma" e explique como a ressuscitação hemostática (transfusão 1:1:1 e controle de cristaloide) atua para interromper esse ciclo.',
        conceptKey: 'A tríade letal é composta por hipotermia, acidose metabólica e coagulopatia. A ressuscitação hemostática com transfusão maciça 1:1:1, aquecimento ativo, ácido tranexâmico e restrição de cristaloide previne a coagulopatia dilucional.',
        keywords: [
          'hipotermia',
          'acidose',
          'coagulopatia',
          'transfusao macica',
          '1:1:1',
          'acido tranexamico'
        ]
      }
    ]
  },

  pediatria_sus: {
    institution: 'ENARE / EBSERH — PEDIATRIA & SAÚDE COLETIVA',
    subject: 'Pediatria — Programa Nacional de Imunizações (PNI) & Bronquiolite Viral Aguda',
    title: 'Avaliação de Pediatria — Calendário Vacinal PNI e Emergências Respiratórias',
    sourceText:
      'Diretrizes da Sociedade Brasileira de Pediatria (SBP) e PNI: A Bronquiolite Viral Aguda (BVA), causada principalmente pelo Vírus Sincicial Respiratório (VSR) em lactentes < 2 anos, tem diagnóstico clínico e tratamento essencialmente de SUPORTE (oxigenoterapia se SpO2 < 90-92%, hidratação e higiene nasal), NÃO sendo recomendados de rotina corticoide sistêmico, broncodilatador de repetição nem antibiótico. No PNI, ao nascer aplicam-se BCG e Hepatite B; aos 2 e 4 meses aplicam-se Pentavalente, VIP, Pneumocócica 10-valente e Rotavírus humano (com limites rígidos de idade para a 1ª e 2ª doses da Rotavírus).',
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
        keywords: [
          'vsr',
          'suporte',
          'oxigenoterapia',
          'hidratacao',
          'sem corticoide',
          'tampoes de muco'
        ]
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
        keywords: [
          'tempo-dependente',
          't > mic',
          'infusao estendida',
          'concentracao-dependente',
          'cmax/mic',
          'dose unica diaria'
        ]
      }
    ]
  }
};

/* =====================================================================
   2. AMOSTRAS DE PROVAS DE ALUNOS RESPONDIDAS (PARA TESTE DE 1 CLIQUE)
   ===================================================================== */
const STUDENT_SAMPLES = {
  mariana_alta: {
    name: 'Mariana Silva (Mat. 2026104)',
    institution: 'UFAM — Internato Clínica Médica',
    mcChoices: [1, 2, 1, 1], // 100% acerto nas 4 questões MC da diretriz SBC
    essayResponses: {
      4: 'O quarteto fantástico da ICFER reúne sacubitril-valsartana (ou IECA), betabloqueador (carvedilol, bisoprolol ou succinato de metoprolol), espironolactona e inibidor de SGLT2 como a dapagliflozina ou empagliflozina. Os iSGLT2 reduzem a mortalidade cardiovascular e promovem natriurese osmótica e proteção cardiorrenal mesmo em pacientes sem diabetes.',
      5: 'A paciente encontra-se em perfil B (quente e úmido). A conduta imediata de descongestão deve ser feita com furosemida endovenosa (diurético de alça) associada a vasodilatador venoso (nitroglicerina). Deve-se manter o betabloqueador de uso prévio pois não há sinais de choque cardiogênico.'
    }
  },
  lucas_parcial: {
    name: 'Lucas Mendes (Mat. 2026089)',
    institution: 'UFAM — Internato Clínica Médica',
    mcChoices: [1, 2, 0, 1], // 3/4 acertos
    essayResponses: {
      4: 'O tratamento da insuficiência cardíaca usa betabloqueador, espironolactona e gliflozina (dapagliflozina), que ajuda na diurese e diminui internações hospitalares, faltando lembrar o quarto medicamento da classe dos inibidores da neprilisina.',
      5: 'Como o paciente está congesto (úmido), iniciamos furosemida na veia para descongestão pulmonar e usamos vasodilatador para reduzir pós-carga.'
    }
  },
  rafael_critico: {
    name: 'Pedro Costa (Mat. 2026152)',
    institution: 'CERMAM — Processo Seletivo Residência',
    mcChoices: [0, 0, 1, 2], // 1/4 acerto
    essayResponses: {
      4: 'Usa-se digoxina e furosemida para melhorar os sintomas do paciente com coração fraco.',
      5: 'Deve-se suspender o betabloqueador imediatamente na entrada do pronto-socorro e fazer soro fisiológico.'
    }
  }
};

/* =====================================================================
   3. INICIALIZAÇÃO & IDENTIDADE VISUAL DO OTTO
   ===================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  applyEmbeddedOttoAssets();
  loadGuidelineIntoWorkspace('sbc_ic');
  initVaultDataset();
  loadStudentSample('mariana_alta');
});

function applyEmbeddedOttoAssets() {
  if (!window.OTTO_ASSETS) return;
  const { avatar, wordmark } = window.OTTO_ASSETS;
  const headerAvatar = document.getElementById('otto-header-avatar');
  const sheetAvatar = document.getElementById('sheet-otto-avatar');
  const headerWm = document.getElementById('otto-header-wordmark');
  if (headerAvatar && avatar) headerAvatar.src = avatar;
  if (sheetAvatar && avatar) sheetAvatar.src = avatar;
  if (headerWm && wordmark) headerWm.src = wordmark;
  document.querySelectorAll('.otto-inline-avatar').forEach(img => {
    if (avatar) img.src = avatar;
  });
}

function setOttoVoice(message) {
  const el = document.getElementById('otto-voice-status');
  if (el) {
    el.innerHTML = `<strong>Otto:</strong> "${message}"`;
  }
}

let toastTimer = null;
function showOttoToast(message) {
  setOttoVoice(message);
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

function ottoNudge() {
  const tips = [
    'Economia de cliques: alterne entre Clássico, 2 Colunas ou Caso Clínico direto na barra acima da folha A4.',
    'Na aba Corrigir por Foto, analiso o cartão OMR e confiro cada palavra-chave conceitual das dissertativas.',
    'No Cofre de Backup, basta digitar qualquer letra que eu abro a pré-visualização da prova em tempo real.'
  ];
  const pick = tips[Math.floor(Math.random() * tips.length)];
  showOttoToast(pick);
}

/* =====================================================================
   4. NAVEGAÇÃO EM 1 CLIQUE (ZERO BIFURCAÇÕES)
   ===================================================================== */
function switchMode(mode) {
  OttoState.mode = mode;
  const modes = ['generator', 'grader', 'vault'];
  modes.forEach(m => {
    const view = document.getElementById(`view-${m}`);
    const btn = document.getElementById(`nav-btn-${m}`);
    if (view) view.classList.toggle('active', m === mode);
    if (btn) btn.classList.toggle('active', m === mode);
  });

  if (mode === 'generator') {
    setOttoVoice('Edite o material ou troque o modelo de diagramação em 1 clique.');
  } else if (mode === 'grader') {
    runFullExamGrading();
    setOttoVoice('Foto carregada! Confira as bolhas OMR e os conceitos-chave destacados.');
  } else if (mode === 'vault') {
    handleVaultLiveFilter();
    const searchInput = document.getElementById('vault-live-search');
    if (searchInput) searchInput.focus();
    setOttoVoice('Digite parte do assunto, data, aluno ou instituição para pré-visualizar em tempo real.');
  }
}

/* =====================================================================
   5. GERADOR DE QUESTÕES (DIRETRIZES + MATERIAL DO PROFESSOR)
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

function setGeneratorParam(param, val, btnEl) {
  OttoState[param] = val;
  if (btnEl && btnEl.parentElement) {
    btnEl.parentElement.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btnEl.classList.add('active');
  }
  rebuildExamQuestionsFromState();
}

function rebuildExamQuestionsFromState() {
  const basePack = GUIDELINE_BANK[OttoState.guidelineKey] || GUIDELINE_BANK.sbc_ic;
  let pool = JSON.parse(JSON.stringify(basePack.questions));

  // Se o professor digitou texto autoral diferente da diretriz padrão, extrai questões extras do texto dele!
  const customText = (document.getElementById('professor-source-text')?.value || '').trim();
  if (customText && customText !== basePack.sourceText && customText.length > 60) {
    const synthesized = synthesizeQuestionsFromCustomMaterial(customText);
    pool = [...synthesized, ...pool];
  }

  // Filtra pelo formato escolhido (mista, mc, essay)
  if (OttoState.format === 'mc') {
    pool = pool.filter(q => q.type === 'mc');
  } else if (OttoState.format === 'essay') {
    pool = pool.filter(q => q.type === 'essay');
  }

  // Se precisar completar até a quantidade solicitada, sintetiza a partir do texto-base
  while (pool.length < OttoState.count) {
    const extra = synthesizeQuestionsFromCustomMaterial(customText || basePack.sourceText, pool.length + 1);
    if (!extra.length) break;
    pool.push(...extra);
  }

  OttoState.questions = pool.slice(0, OttoState.count);
  renderExamSheet();
}

function synthesizeQuestionsFromCustomMaterial(rawText, seedOffset = 1) {
  const sentences = rawText
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!;])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 35);

  if (sentences.length === 0) return [];

  const stopwords = new Set([
    'para', 'como', 'pela', 'pelo', 'com', 'sem', 'mais', 'menos', 'entre',
    'após', 'antes', 'deve', 'sendo', 'quando', 'onde', 'qual', 'quais',
    'este', 'esta', 'isso', 'aquele', 'uma', 'uns', 'umas', 'dos', 'das'
  ]);

  const created = [];
  const subjectTitle = document.getElementById('meta-subject')?.value || 'Material Docente';

  sentences.slice(0, 4).forEach((sent, idx) => {
    const words = (sent.match(/[A-Za-zÀ-ÿ0-9>=<%/+-]{5,}/g) || [])
      .map(w => w.replace(/[.,;:()]/g, ''))
      .filter(w => !stopwords.has(w.toLowerCase()));

    const uniqueKeywords = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 6);
    const shouldBeEssay = OttoState.format === 'essay' || (OttoState.format === 'mista' && idx % 2 === 1);

    if (shouldBeEssay) {
      created.push({
        id: `custom-essay-${seedOffset}-${idx}`,
        type: 'essay',
        topic: `${subjectTitle.split('—')[0].trim()} • Conceito Aplicado`,
        points: 2.0,
        stem: `Com base no material de referência da disciplina, fundamente a conduta e os mecanismos envolvidos na seguinte diretriz: "${sent.slice(0, 140)}..."`,
        conceptKey: sent,
        keywords: uniqueKeywords.length ? uniqueKeywords : ['conduta', 'diagnostico', 'diretriz', 'tratamento']
      });
    } else {
      created.push({
        id: `custom-mc-${seedOffset}-${idx}`,
        type: 'mc',
        topic: `${subjectTitle.split('—')[0].trim()} • Diretriz`,
        points: 1.5,
        stem: `Considerando as diretrizes e o material didático ministrado sobre ${subjectTitle}, analise as proposições abaixo e assinale a conduta tecnicamente CORRETA:`,
        options: [
          sent,
          'A conduta inicial deve ser adiada por 48 horas até confirmação laboratorial terciária, independentemente da gravidade clínica.',
          'O manejo baseia-se exclusivamente em medidas sintomáticas sem necessidade de monitorização ou estratificação de risco.',
          'A intervenção farmacológica de primeira linha descrita na diretriz está formalmente contraindicada em todos os cenários agudos.',
          'Recomenda-se substituir o protocolo institucional por conduta expectante domiciliar.'
        ],
        answer: 0,
        rationale: `Extraído diretamente do material do professor: "${sent}"`
      });
    }
  });

  return created;
}

function generateExamFromMaterial() {
  rebuildExamQuestionsFromState();
  showOttoToast(`${OttoState.questions.length} questões geradas e diagramadas na folha A4!`);
}

async function handleMaterialUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.name.toLowerCase().endsWith('.pdf')) {
    showOttoToast(`Extraindo texto do PDF "${file.name}"...`);
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
          document.getElementById('meta-title').value = `Avaliação — ${file.name.replace(/\.pdf$/i, '')}`;
          rebuildExamQuestionsFromState();
          showOttoToast(`PDF lido (${data.pages} págs)! Questões montadas automaticamente.`);
        } else {
          showOttoToast('PDF carregado! Gere as questões em 1 clique.');
        }
      } catch (err) {
        showOttoToast('Modo offline ativo: cole os tópicos-chave do PDF na caixa de texto.');
      }
    };
    reader.readAsDataURL(file);
  } else {
    const text = await file.text();
    document.getElementById('professor-source-text').value = text.slice(0, 5000);
    document.getElementById('meta-title').value = `Avaliação — ${file.name.replace(/\.[^.]+$/, '')}`;
    rebuildExamQuestionsFromState();
    showOttoToast(`Material "${file.name}" importado e transformado em prova!`);
  }
}

/* =====================================================================
   6. DIAGRAMAÇÃO A4 VIVA & MODELOS DE PROVA (CLÁSSICO, 2 COLUNAS, CLÍNICO)
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

  // Embaralha a ordem das questões e das alternativas mantendo o gabarito exato!
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
  showOttoToast(`${verName} gerado! Questões e alternativas embaralhadas com novo gabarito.`);
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

  // Renderiza Grade OMR no topo da folha
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const mcQuestions = OttoState.questions
    .map((q, idx) => ({ ...q, num: idx + 1 }))
    .filter(q => q.type === 'mc');

  if (mcQuestions.length === 0) {
    omrGridEl.innerHTML = '<span style="font-size:11px; color:#555;">Prova 100% Dissertativa — Correção por Conceito & Palavras-Chave</span>';
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

  // Renderiza cada questão
  listEl.innerHTML = OttoState.questions
    .map((q, idx) => {
      const qNum = String(idx + 1).padStart(2, '0');
      const isMc = q.type === 'mc';
      const typeBadge = isMc ? 'MÚLTIPLA ESCOLHA' : 'DISSERTATIVA CONCEITUAL';

      let bodyHtml = '';
      if (isMc) {
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
        if (isMc) {
          teacherKeyHtml = `
            <div class="teacher-key-box">
              <strong>Gabarito Otto (${letters[q.answer] || 'A'}):</strong> ${escapeHtml(q.rationale || 'Conforme diretriz.')}
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
  OttoState.questions.splice(idx, 1);
  renderExamSheet();
}

function editQuestionPrompt(idx) {
  const q = OttoState.questions[idx];
  if (!q) return;
  if (q.type === 'essay') {
    const newKws = prompt(
      'Palavras-chave para correção automática da questão dissertativa (separadas por vírgula):',
      (q.keywords || []).join(', ')
    );
    if (newKws !== null) {
      q.keywords = newKws
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
      renderExamSheet();
      showOttoToast('Palavras-chave atualizadas no gabarito da questão!');
    }
  } else {
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
  }
}

function addCustomQuestionModal() {
  const stem = prompt('Digite o enunciado da nova questão dissertativa:');
  if (!stem || !stem.trim()) return;
  const kws = prompt(
    'Digite as palavras-chave obrigatórias do gabarito (separadas por vírgula):',
    'diagnóstico, conduta, diretriz'
  );
  OttoState.questions.push({
    id: `manual-${Date.now()}`,
    type: 'essay',
    topic: 'Questão Autoral Docente',
    points: 2.0,
    stem: stem.trim(),
    conceptKey: `Resposta fundamentada contemplando: ${kws || 'conceitos centrais da aula'}.`,
    keywords: (kws || 'diagnóstico, conduta')
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean)
  });
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
    // Faz backup automático da imagem clínica anexada
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
    showOttoToast('Figura inserida na prova e salva automaticamente no Cofre de Backup!');
  };
  reader.readAsDataURL(file);
}

function removeAttachedFigure() {
  OttoState.attachedFigureDataUrl = '';
  const wrap = document.getElementById('sheet-attached-figure-wrap');
  if (wrap) wrap.style.display = 'none';
}

/* =====================================================================
   7. EXPORTAÇÃO DE PDF NATIVO (PYMUPDF BACKEND OU IMPRESSÃO A4)
   ===================================================================== */
async function downloadNativePdf(includeKey = true) {
  const payload = {
    meta: {
      institution: document.getElementById('meta-institution').value,
      subject: document.getElementById('meta-subject').value,
      title: document.getElementById('meta-title').value,
      professor: document.getElementById('meta-professor').value,
      date: new Date().toLocaleDateString('pt-BR'),
      version: OttoState.versions[OttoState.versionIndex],
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
  } catch (e) {
    // Fallback para impressão vetorial A4 nativa do navegador se rodando como arquivo local offline
  }

  window.print();
}

/* =====================================================================
   8. CORREÇÃO DE PROVA POR FOTO (MÚLTIPLA ESCOLHA + DISSERTATIVA POR CONCEITO)
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

  // Mapeia respostas simuladas para as questões atuais da prova
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
        sample.essayResponses[idx] ||
        sample.essayResponses[4] ||
        q.conceptKey;
    }
  });

  // Gera imagem realista da prova escaneada do aluno em Canvas
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
    showOttoToast('Foto da prova recebida! OMR e conceitos dissertativos analisados.');
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

/**
 * Avalia semântica e lexicalmente a resposta dissertativa do aluno contra
 * o gabarito de conceito e as palavras-chave da questão.
 */
function evaluateEssayByConceptAndKeywords(studentText, question) {
  const norm = str =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normStudent = norm(studentText);
  const keywords = question.keywords || [];

  // Dicionário clínico de sinônimos e equivalências conceituais
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

  // Verifica se o aluno cometeu erro conceitual crítico (ex: "suspender o betabloqueador" no perfil B)
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
                QUESTÃO DISSERTATIVA ${String(idx + 1).padStart(2, '0')} — ${escapeHtml(q.topic)}
              </span>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="brand-tag" style="background:${
                pct >= 75 ? 'var(--accent-emerald)' : pct >= 45 ? 'var(--accent-amber)' : 'var(--accent-crimson)'
              };">
                ADERÊNCIA CONCEITUAL: ${pct}% (${earnedPts.toFixed(1)} / ${qPts.toFixed(1)} pt)
              </span>
            </div>
          </div>

          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
            <strong>Enunciado:</strong> ${escapeHtml(q.stem)}
          </div>

          <div style="background:var(--bg-paper); border:1px solid var(--border-subtle); border-radius:6px; padding:8px 10px; margin-bottom:8px; font-size:12px;">
            <strong>Gabarito de Conceito Esperado:</strong> ${escapeHtml(q.conceptKey)}
          </div>

          <label class="form-label">Resposta Transcrita da Foto da Prova do Aluno (OCR editável):</label>
          <textarea
            class="textarea-field"
            style="min-height:68px; margin-bottom:8px; font-size:12.5px;"
            oninput="updateStudentEssayText(${idx}, this.value)"
          >${escapeHtml(studentAns)}</textarea>

          <!-- PÍLULAS DE PALAVRAS-CHAVE DETECTADAS VS AUSENTES -->
          <div style="margin-bottom:10px;">
            <span class="form-label">Rastreamento de Palavras-Chave &amp; Conceitos na Resposta:</span>
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
            ${
              evalRes.criticalContradiction
                ? `<div style="margin-top:6px; color:var(--accent-crimson); font-size:11.5px; font-weight:700;">
                     ⚠️ Alerta Conceitual do Otto: O aluno mencionou conduta contraindicada ("suspender betabloqueador" no perfil B).
                   </div>`
                : ''
            }
          </div>

          <!-- AJUSTE RÁPIDO DE NOTA EM 1 CLIQUE -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid var(--border-subtle);">
            <span style="font-size:11.5px; font-weight:700; color:var(--text-secondary);">Ajuste Rápido do Professor (1 clique):</span>
            <div class="pill-group">
              ${[
                { label: 'Automático IA', val: undefined },
                { label: '100% (Total)', val: 1.0 },
                { label: '75%', val: 0.75 },
                { label: '50% (Parcial)', val: 0.5 },
                { label: '25%', val: 0.25 },
                { label: '0% (Zero)', val: 0.0 }
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
    '<div style="font-size:12px; color:var(--text-secondary);">Nenhuma questão dissertativa nesta prova.</div>';

  // Calcula nota normalizada de 0 a 10,0
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
  document.getElementById('grade-essay-summary').textContent = `Dissertativas: ${avgEssayPct}%`;

  const commentEl = document.getElementById('otto-grade-comment');
  if (commentEl) {
    if (normalizedGrade >= 8.5) {
      commentEl.textContent =
        '"Excelente domínio fisiopatológico e terapêutico. As palavras-chave essenciais das diretrizes foram contempladas com precisão."';
    } else if (normalizedGrade >= 6.0) {
      commentEl.textContent =
        '"Desempenho satisfatório com acerto parcial dos conceitos-chave. Recomendo reforçar os fármacos modificadores de mortalidade omitidos."';
    } else {
      commentEl.textContent =
        '"Atenção pedagógica necessária: houve lacunas nas palavras-chave obrigatórias e divergência em relação à diretriz vigente."';
    }
  }
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

/**
 * Renderiza uma imagem realista da prova do aluno respondida (para o visor e para o Backup)
 */
function renderSimulatedExamPhotoDataUrl(studentName, institution, mcMarked, essayAnswers) {
  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Mesa de madeira/fundo escuro e folha de papel levemente inclinada
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(22, 16);
  ctx.fillStyle = '#FAF8F4';
  ctx.fillRect(0, 0, 716, 468);
  ctx.strokeStyle = '#141414';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 716, 468);

  // Cabeçalho da folha fotografada
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

  // Carimbo de Leitura Óptica OMR
  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.fillRect(525, 24, 162, 56);
  ctx.strokeRect(525, 24, 162, 56);
  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('OTTO VISION OMR', 540, 44);
  ctx.fillText('LEITURA VALIDADA ✓', 540, 64);

  // Grade de Bolhas OMR preenchidas pelo aluno
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
    if (q.type !== 'mc') return;
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

  // Respostas Dissertativas Manuscritas na Folha
  let ey = 186;
  OttoState.questions.forEach((q, idx) => {
    if (q.type !== 'essay' || ey > 420) return;
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(18, ey, 680, 122);

    ctx.fillStyle = '#141414';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`QUESTÃO DISSERTATIVA 0${idx + 1} (${q.topic}) — TRANSCRIÇÃO & PALAVRAS-CHAVE:`, 28, ey + 20);

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
    summary: `Prova corrigida por foto com nota ${gradeStr}. ${document.getElementById('grade-mc-summary').textContent} | ${document.getElementById('grade-essay-summary').textContent}.`,
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
    summary: `Matriz de prova gerada no estilo ${OttoState.style.toUpperCase()} com ${OttoState.questions.length} questões e gabarito conceitual Otto.`,
    image_data: previewImg,
    payload: {
      guidelineKey: OttoState.guidelineKey,
      style: OttoState.style,
      questions: OttoState.questions
    }
  };

  addBackupItem(item);
  showOttoToast(`Matriz "${title}" salva com imagem no Cofre de Backup!`);
}

function exportStudentReportCard() {
  switchMode('generator');
  window.print();
}

/* =====================================================================
   9. COFRE DE BACKUP DE IMAGENS & PRÉ-VISUALIZAÇÃO EM TEMPO REAL (LIVE PREVIEW)
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

  // Faixa superior nanquim
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

  // Simulação visual de colunas da prova
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
      summary: 'Acertou 4/4 questões objetivas OMR e contemplou 100% das palavras-chave no manejo do Perfil B (furosemida + vasodilatador + manutenção do betabloqueador).',
      image_data: renderSimulatedExamPhotoDataUrl(
        'Mariana Silva (Mat. 2026104)',
        'UFAM — Faculdade de Medicina',
        { 0: 1, 1: 2, 2: 1, 3: 1 },
        STUDENT_SAMPLES.mariana_alta.essayResponses
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
      summary: 'Prova diagramada em 2 colunas compactas estilo residência médica com cartão OMR e espelho conceitual sobre pacote de 1 hora e vasopressores.',
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
    },
    {
      id: 'bkp-seed-4',
      title: 'Imagem Clínica de Prova — ECG Taquicardia & Radiografia de Tórax',
      student_name: 'Acervo de Imagens Clínicas',
      subject: 'Cardiologia & Emergências Clínicas',
      institution: 'USP — FMUSP / HC',
      date_str: '2026-10-15',
      category: 'imagem_clinica',
      exam_style: 'clinico',
      score: 'IMAGEM HD',
      tags: 'imagem clinica ecg radiografia torax cardiologia fmusp usp edema agudo',
      summary: 'Backup de figura clínica de alta resolução utilizada nas questões de emergência cardiológica e choque.',
      image_data: renderExamMatrixThumbnailDataUrl(
        'Figura Clínica #04 — ECG & Congestão Pulmonar',
        'FMUSP — FACULDADE DE MEDICINA DA USP',
        'Cardiologia — Emergências',
        'IMAGEM CLÍNICA',
        'clinico'
      )
    },
    {
      id: 'bkp-seed-5',
      title: 'Prova P2 — Pediatria, Bronquiolite Viral Aguda (VSR) e PNI',
      student_name: 'Beatriz Oliveira',
      subject: 'Pediatria & Imunizações (PNI / SUS)',
      institution: 'ENARE / EBSERH',
      date_str: '2026-10-12',
      category: 'prova_aluno',
      exam_style: 'classico',
      score: '9,2 / 10,0',
      tags: 'pediatria bronquiolite vsr pni vacinas enare ebserh beatriz oliveira',
      summary: 'Excelente fundamentação sobre suporte ventilatório/hidratação na BVA e contraindicação de corticoterapia rotineira.',
      image_data: renderExamMatrixThumbnailDataUrl(
        'Avaliação de Pediatria — BVA & Calendário PNI',
        'ENARE / EBSERH — RESIDÊNCIA MULTIPROFISSIONAL E MÉDICA',
        'Pediatria & PNI',
        'NOTA 9,2',
        'classico'
      )
    },
    {
      id: 'bkp-seed-6',
      title: 'Matriz de Prova — Antimicrobianos PK/PD na Terapia Intensiva',
      student_name: 'Matriz Oficial Docente',
      subject: 'Farmacologia Clínica — Antimicrobianos',
      institution: 'USP — FMUSP',
      date_str: '2026-10-08',
      category: 'matriz_prova',
      exam_style: 'duas_colunas',
      score: '8 Qs • 10 pts',
      tags: 'farmacologia antimicrobianos pk pd meropenem vancomicina amicacina usp',
      summary: 'Matriz avaliando tempo acima da CIM (fT > MIC) em beta-lactâmicos com infusão estendida vs pico/MIC em aminoglicosídeos.',
      image_data: renderExamMatrixThumbnailDataUrl(
        'Prova de Farmacologia — PK/PD de Antimicrobianos',
        'UNIVERSIDADE DE SÃO PAULO — FMUSP',
        'Farmacologia Clínica',
        'CADERNO BETA',
        'duas_colunas'
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
  // Persiste assincronamente na API SQLite se o servidor estiver ativo
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
        summary: `Imagem arquivada diretamente pelo professor (${Math.round(file.size / 1024)} KB). Disponível para busca instantânea e inserção em provas.`,
        image_data: reader.result
      };
      addBackupItem(newItem);
      showOttoToast(`Imagem "${file.name}" salva no Cofre e pré-visualizada em tempo real!`);
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

/**
 * FILTRAGEM EM TEMPO REAL AO DIGITAR + PRÉ-VISUALIZAÇÃO AUTOMÁTICA DO ARQUIVO
 */
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

  // REGRA DE OURO PEDIDA PELO USUÁRIO:
  // Ao digitar parte da pesquisa ou filtrar, traz automaticamente em tempo real a pré-visualização do arquivo!
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
