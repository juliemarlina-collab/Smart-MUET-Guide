/* ============================================================
   MUET SmartHub 2026 · Shared Engine v2.0 (Phase A Fixes)
   - Fixed: streak daily login tracking
   - Fixed: XP single key, level titles
   - Fixed: badge auto-check after every session
   - Fixed: cycle schema + currentCycle in profile
   - Fixed: materials screen with real clickable links
   - Added: Band Achiever per cycle
   - Added: XP level display
   ============================================================ */

const MuetNeo = (() => {

  // ── STORAGE KEYS ──────────────────────────────────────────
  const LS = {
    profile:  'muet_profile',
    speaking: 'muet_speaking_sessions',
    reading:  'muet_reading_history',
    listening:'muet_listening_sessions',
    writing:  'muet_writing_sessions',
    cycles:   'muet_cycle_history',
    mock:     'muet_mock_history'
  };

  // ── SKILL CONFIG ──────────────────────────────────────────
  const SKILLS = [
    ['speaking',  'Speaking',  '🎤', 'speaking.html'],
    ['reading',   'Reading',   '📖', 'reading.html'],
    ['listening', 'Listening', '🎧', 'listening.html'],
    ['writing',   'Writing',   '✍️', 'writing.html']
  ];

  // ── XP LEVEL TITLES ───────────────────────────────────────
  const XP_LEVELS = [
    [0,    'Band Rookie'],
    [700,  'MUET Explorer'],
    [1500, 'Band Climber'],
    [3000, 'SmartSpeaker'],
    [5000, 'Band Champion']
  ];

  // ── FULL BADGE DEFINITIONS ────────────────────────────────
  const ALL_BADGES = [
    // Foundation
    ['✨','First Step',       'first_step'],
    ['🎤','PREP Starter',     'prep_starter'],
    ['💬','Discussion Builder','discussion_builder'],
    ['📖','Passage Hunter',   'passage_hunter'],
    ['🎧','Audio Focus',      'audio_focus'],
    ['📧','Email Ready',      'email_ready'],
    ['📝','Essay Builder',    'essay_builder'],
    ['⏱️','Time Master',      'time_master'],
    ['⬆️','Band Climber',     'band_climber_badge'],
    // Skill mastery
    ['🏆','PREP Pro',         'prep_pro'],
    ['⚡','Speed Reader',     'speed_reader'],
    ['👂','Sharp Ears',       'sharp_ears'],
    // Consistency
    ['🔥','7-Day Warrior',    'warrior_7'],
    ['📅','Monthly Grinder',  'monthly_grinder'],
    ['🚀','Quick Starter',    'quick_starter'],
    // Mock
    ['🥇','Mock Finisher 1',  'mock_1'],
    ['🥇','Mock Finisher 2',  'mock_2'],
    // Full journey
    ['🌟','Full Journey',     'full_journey']
  ];

  // ── MATERIALS DATA (with real links) ─────────────────────
  const MATERIALS = [
    {
      title: 'SOURCE 1 · MPM Official Sample Questions',
      badge: 'Official',
      badgeColor: '#0757ff',
      desc: 'The only fully authoritative source from Majlis Peperiksaan Malaysia. Contains official sample papers for all four components including Listening audio. 100% safe to use for Cycle 1.',
      links: [
        ['Download Sample PDF', 'https://www.mpm.edu.my/images/dokumen/calon-peperiksaan/muet/regulation/SAMPLE_QUESTIONS.pdf'],
        ['MPM Portal', 'https://www.mpm.edu.my']
      ]
    },
    {
      title: 'SOURCE 2 · MUET My Way (Madam Audrey Koh)',
      badge: 'Answers + Reasoning',
      badgeColor: '#059669',
      desc: 'Suggested Reading answers with detailed "Why is this correct?" explanations. Updated from 2013 to Session 1 2026. Best source for building answer explanations in the app.',
      links: [
        ['Visit Blog', 'http://muetmyway.blogspot.com'],
        ['S1 2026 Answers', 'http://muetmyway.blogspot.com/2026/04/suggested-answers-for-muet-session-1.html'],
        ['S1 2025 Answers', 'http://muetmyway.blogspot.com/2025/04/suggested-answers-for-muet-reading-8003.html'],
        ['S2 2024 Answers', 'http://muetmyway.blogspot.com/2024/08/suggested-answers-for-muet-reading-8003.html'],
        ['S1 2024 Answers', 'http://muetmyway.blogspot.com/2024/04/suggested-muet-reading-8003-answers-for.html'],
        ['S1 2023 Answers', 'http://muetmyway.blogspot.com/2023/04/suggested-answers-for-muet-reading.html']
      ]
    },
    {
      title: 'SOURCE 3 · Azeelia MUET Resources',
      badge: 'Papers + Keys',
      badgeColor: '#7C3AED',
      desc: 'Teacher-curated hub with Reading practice papers (Parts 1–3), Session 2 2021 full paper + key, Writing Task 1 & 2 samples, Speaking booklets and guided writing worksheets.',
      links: [
        ['Azeelia Linktree', 'https://linktr.ee/azeelia.muetresources']
      ]
    },
    {
      title: 'SOURCE 4 · Bumi Gemilang Google Drive',
      badge: 'Full Papers 2022+',
      badgeColor: '#D97706',
      desc: 'Community-compiled Drive folders for all 4 skills, new format 2022 onwards. Best for bulk collection. Verify each file before use.',
      links: [
        ['Main Page', 'https://www.bumigemilang.com/muet-past-year-question-papers/'],
        ['2022 All Papers Drive', 'https://drive.google.com/drive/folders/1DdaiiNt-xkmMf56AGHmZEdjU9cP2Ys63'],
        ['Writing Papers Drive', 'https://drive.google.com/drive/folders/1BSxKsKxda94zCsZQffsNiiSiMBo88xAe'],
        ['Speaking Papers Drive','https://drive.google.com/drive/folders/1VKvzVMzFp0020_oGK0ZDSMlmj3ahLzy_'],
        ['Listening Papers Drive','https://drive.google.com/drive/folders/14WnE6lU6S3y3fyRfPe0srhxYu2_zb1v-']
      ]
    },
    {
      title: 'SOURCE 5 · Scribd MUET Archive',
      badge: 'Large Archive',
      badgeColor: '#EF4444',
      desc: 'Largest archive for MUET 2021–2025 new format. Viewable free without account. Search specifically for the paper and year needed.',
      links: [
        ['Search Scribd', 'https://www.scribd.com/search?query=MUET+Reading+Session'],
        ['Reading S1 2021', 'https://www.scribd.com/document/643392642/MUET-Reading-Past-Paper-Session-1-2021-pdf'],
        ['Listening 2021 All Keys', 'https://www.scribd.com/document/607676319/Listening-Muet-2021-Answers'],
        ['Reading S3 2021 Answers', 'https://www.scribd.com/document/702536429/Reading-MUET-S3-2021-Answer-PDF'],
        ['Reading 2024–25 Answers', 'https://www.scribd.com/document/907437708/Muet-Reading-Past-Years-Answer']
      ]
    },
    {
      title: 'SOURCE 6 · Studocu Malaysia',
      badge: 'Answers with Notes',
      badgeColor: '#0F172A',
      desc: 'Student-uploaded study materials with reading answer keys that include notes explaining reasoning per question — aligned with our "Why is this the answer?" format.',
      links: [
        ['Reading Answer S1 2023', 'https://www.studocu.com/my/document/kolej-matrikulasi-johor/english/muet-reading-answer/65934389']
      ]
    }
  ];

  // ── CYCLE CONFIG ──────────────────────────────────────────
  const CYCLE_MAP = [
    { id:'C1',  label:'Cycle 1',  paper:'MPM Official Sample',   difficulty:'Foundation' },
    { id:'C2',  label:'Cycle 2',  paper:'Session 1 2021',        difficulty:'Foundation' },
    { id:'C3',  label:'Cycle 3',  paper:'Session 2 2021',        difficulty:'Foundation+' },
    { id:'C4',  label:'Cycle 4',  paper:'Session 3 2021',        difficulty:'Developing' },
    { id:'C5',  label:'Cycle 5',  paper:'Session 1 2022',        difficulty:'Developing' },
    { id:'C6',  label:'Cycle 6',  paper:'Session 2 2022',        difficulty:'Developing+' },
    { id:'C7',  label:'Cycle 7',  paper:'Session 1 2023',        difficulty:'Proficient' },
    { id:'C8',  label:'Cycle 8',  paper:'Session 2 2023',        difficulty:'Proficient' },
    { id:'C9',  label:'Cycle 9',  paper:'Session 1 2024',        difficulty:'Advanced' },
    { id:'C10', label:'Cycle 10', paper:'Session 1 2025',        difficulty:'Advanced' },
    { id:'M1',  label:'Mock 1',   paper:'Session 2 2025',        difficulty:'Final Exam' },
    { id:'M2',  label:'Mock 2',   paper:'Session 1 2026',        difficulty:'Final Exam' }
  ];

  // ── HELPERS ───────────────────────────────────────────────
  function parse(x, fallback){ try{ return x ? JSON.parse(x) : fallback }catch{ return fallback } }
  function loadProfile(){ return parse(localStorage.getItem(LS.profile), null); }
  function saveProfile(p){ localStorage.setItem(LS.profile, JSON.stringify(p)); }
  function arr(key){ const x = parse(localStorage.getItem(key), []); return Array.isArray(x) ? x : []; }
  function val(id){ return document.getElementById(id)?.value.trim() || ''; }
  function set(id, v){ const el = document.getElementById(id); if(el) el.value = v; }
  function el(id){ return document.getElementById(id); }

  function scoreToBand(total360){
    if(total360 >= 331) return '5+';
    if(total360 >= 294) return '5.0';
    if(total360 >= 258) return '4.5';
    if(total360 >= 211) return '4.0';
    if(total360 >= 164) return '3.5';
    if(total360 >= 123) return '3.0';
    if(total360 >= 82)  return '2.5';
    if(total360 >= 36)  return '2.0';
    if(total360 >= 1)   return '1.0';
    return '0.0';
  }

  function bandMessage(b){
    return {
      '5+': 'Excellent control. Maintain exam discipline and refine accuracy.',
      '5.0':'Strong performance. Focus on precision and natural expression.',
      '4.5':'Good readiness. Strengthen weak component to stabilise band.',
      '4.0':'Target zone. Practise consistently and avoid task fulfilment errors.',
      '3.5':'Minimum readiness. Build content, structure and accuracy.',
      '3.0':'Needs targeted practice and lecturer support.',
      '0.0':'Complete your first task to activate tracking.'
    }[b] || 'Keep practising to improve your band.';
  }

  function getXPLevel(xp){
    let level = XP_LEVELS[0][1];
    for(const [threshold, title] of XP_LEVELS){
      if(xp >= threshold) level = title;
    }
    return level;
  }

  function getNextXPThreshold(xp){
    for(const [threshold] of XP_LEVELS){
      if(xp < threshold) return threshold;
    }
    return null; // maxed out
  }

  // ── DAILY STREAK CHECK ────────────────────────────────────
  // Call this whenever the app loads and a profile exists.
  // Compares today's date with lastVisit. If different day → increment streak.
  // If more than 1 day gap → reset streak to 1.
  function checkAndUpdateStreak(profile){
    const today = new Date().toDateString();
    const last  = profile.lastVisit ? new Date(profile.lastVisit).toDateString() : null;

    if(!last || last === today){
      // same day or first visit — don't change streak
      return profile;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if(last === yesterdayStr){
      // consecutive day — increment
      profile.streak = (profile.streak || 0) + 1;
      profile.xp = (profile.xp || 0) + 10; // daily login bonus

      // streak milestone rewards
      if(profile.streak === 7){
        profile.xp += 50;
        profile.badges = [...new Set([...(profile.badges || []), 'warrior_7'])];
        setTimeout(() => toast('🔥 7-Day Warrior badge unlocked! +50 XP bonus!'), 600);
      }
      if(profile.streak >= 30){
        profile.badges = [...new Set([...(profile.badges || []), 'monthly_grinder'])];
      }
    } else {
      // gap of 2+ days — reset streak
      profile.streak = 1;
    }

    return profile;
  }

  // ── BADGE ENGINE ──────────────────────────────────────────
  // Runs after every session save. Checks all conditions.
  function checkBadges(profile){
    const badges = new Set(profile.badges || ['first_step']);
    const sp = arr(LS.speaking);
    const rd = arr(LS.reading);
    const ls = arr(LS.listening);
    const wr = arr(LS.writing);
    const cy = arr(LS.cycles);

    // Foundation
    if(sp.length >= 1)  badges.add('prep_starter');
    if(sp.some(s => s.type === 'Task B')) badges.add('discussion_builder');
    if(rd.length >= 1)  badges.add('passage_hunter');
    if(ls.length >= 1)  badges.add('audio_focus');
    if(wr.some(s => s.task === 'Task 1' || s.taskType === '1')) badges.add('email_ready');
    if(wr.some(s => s.task === 'Task 2' || s.taskType === '2')) badges.add('essay_builder');

    // Quick Starter — completed first session within 24h of register
    if((sp.length + rd.length + ls.length + wr.length) >= 1 && profile.createdAt){
      const created = new Date(profile.createdAt);
      const now = new Date();
      if((now - created) < 24 * 60 * 60 * 1000) badges.add('quick_starter');
    }

    // Skill mastery
    const band4sp = sp.filter(s => {
      const b = parseFloat(s.bandLabel || s.band || 0);
      return b >= 4.0;
    });
    if(band4sp.length >= 10) badges.add('prep_pro');

    if(rd.some(s => s.percent >= 80)) badges.add('speed_reader');
    if(ls.some(s => (s.score90 / 90 * 100) >= 80)) badges.add('sharp_ears');

    // Band climber — improved from previous cycle
    if(cy.length >= 2){
      const prev = cy[cy.length - 2];
      const curr = cy[cy.length - 1];
      if(curr && prev && curr.total360 > prev.total360) badges.add('band_climber_badge');
    }

    // Full journey
    if(cy.length >= 10 && arr(LS.mock).length >= 2) badges.add('full_journey');

    // Cycle badges (C1–C10 + M1 + M2)
    cy.forEach((c, i) => {
      if(c.completed) badges.add(`cycle_${i+1}_complete`);
    });

    profile.badges = [...badges];
    return profile;
  }

  // ── CYCLE ENGINE ──────────────────────────────────────────
  // Checks if all 4 skills have been attempted for the current cycle.
  // If yes, completes the cycle, calculates Band Achiever, saves to history.
  function checkCycleCompletion(profile){
    const cycleNum = profile.currentCycle || 1;
    if(cycleNum > 10) return profile; // mock exams handled separately

    const sp = arr(LS.speaking);
    const rd = arr(LS.reading);
    const ls = arr(LS.listening);
    const wr = arr(LS.writing);
    const cycles = arr(LS.cycles);

    // Already have a record for this cycle?
    const existing = cycles.find(c => c.cycleNumber === cycleNum && c.completed);
    if(existing) return profile;

    // Check sessions for current cycle (sessions tagged with cycleNumber)
    const spCycle = sp.filter(s => s.cycleNumber === cycleNum);
    const rdCycle = rd.filter(s => s.cycleNumber === cycleNum);
    const lsCycle = ls.filter(s => s.cycleNumber === cycleNum);
    const wrCycle = wr.filter(s => s.cycleNumber === cycleNum);

    // If all 4 have at least one session for this cycle
    if(spCycle.length && rdCycle.length && lsCycle.length && wrCycle.length){
      const sScore = spCycle[spCycle.length-1].score90 || 0;
      const rScore = rdCycle[rdCycle.length-1].score90 || 0;
      const lScore = lsCycle[lsCycle.length-1].score90 || 0;
      const wScore = wrCycle[wrCycle.length-1].score90 || 0;
      const total360 = sScore + rScore + lScore + wScore;
      const bandLabel = scoreToBand(total360);
      const weakest = [
        ['Speaking',  sScore],
        ['Reading',   rScore],
        ['Listening', lScore],
        ['Writing',   wScore]
      ].sort((a,b) => a[1]-b[1])[0][0];

      const prevCycle = cycles.find(c => c.cycleNumber === cycleNum - 1);
      const improvement = prevCycle ? total360 - prevCycle.total360 : null;

      const cycleRecord = {
        cycleNumber: cycleNum,
        completed: true,
        completedAt: new Date().toISOString(),
        speaking90: sScore,
        reading90: rScore,
        listening90: lScore,
        writing90: wScore,
        total360,
        band: bandLabel,
        weakestComponent: weakest,
        improvement,
        xpEarned: 50 + (improvement > 0 ? 30 : 0)
      };

      const newCycles = cycles.filter(c => c.cycleNumber !== cycleNum);
      newCycles.push(cycleRecord);
      localStorage.setItem(LS.cycles, JSON.stringify(newCycles));

      // Award XP and advance to next cycle
      profile.xp = (profile.xp || 0) + cycleRecord.xpEarned;
      profile.currentCycle = cycleNum + 1;
      profile.badges = [...new Set([...(profile.badges || []), `cycle_${cycleNum}_badge`])];

      // Show Band Achiever card
      setTimeout(() => showBandAchiever(cycleRecord), 400);
    }

    return profile;
  }

  function showBandAchiever(record){
    const impStr = record.improvement !== null
      ? (record.improvement > 0 ? `+${record.improvement}` : `${record.improvement}`)
      : 'First cycle';
    toast(`🏅 Cycle ${record.cycleNumber} complete! Band ${record.band} · ${record.total360}/360 · ${impStr} marks`);
  }

  // ── SCORE READER ──────────────────────────────────────────
  function getLatestScore(skill){
    const list = arr(LS[skill]);
    if(!list.length) return 0;
    const latest = list[list.length - 1];
    if(typeof latest.score90 === 'number') return latest.score90;
    if(typeof latest.score  === 'number') return latest.score;
    if(typeof latest.rawScore === 'number' && typeof latest.totalQ === 'number')
      return Math.round(latest.rawScore / latest.totalQ * 90);
    return 0;
  }

  // ── RENDER HUB ────────────────────────────────────────────
  function render(){
    const p = loadProfile();
    if(!p) return;

    // name & stats
    if(el('welcomeName')) el('welcomeName').textContent = p.name || 'MUET Learner';
    if(el('streak'))      el('streak').textContent = p.streak || 0;
    if(el('xp'))          el('xp').textContent = p.xp || 0;
    if(el('targetDisplay')) el('targetDisplay').textContent = p.targetBand || '4.0';
    if(el('xpLevel'))     el('xpLevel').textContent = getXPLevel(p.xp || 0);

    // skills
    const scores = {};
    SKILLS.forEach(([key]) => {
      scores[key] = getLatestScore(key);
      const pc = Math.round(scores[key] / 90 * 100);
      if(el(key+'Score')) el(key+'Score').textContent = scores[key] ? `${scores[key]}/90 · ${pc}%` : 'No attempt';
      if(el(key+'Bar'))   el(key+'Bar').style.width = Math.min(100, pc) + '%';
    });

    // overall band
    const total = scores.speaking + scores.reading + scores.listening + scores.writing;
    const b = scoreToBand(total);
    const pcAll = Math.round(total / 360 * 100);
    if(el('overallBand'))    el('overallBand').textContent = 'Band ' + b;
    if(el('bandMessage'))    el('bandMessage').textContent = bandMessage(b);
    if(el('overallPercent')) el('overallPercent').textContent = pcAll + '%';
    const disc = document.querySelector('.band-disc');
    if(disc) disc.style.setProperty('--p', pcAll + '%');

    // current cycle indicator
    if(el('currentCycleLabel')){
      const cn = p.currentCycle || 1;
      el('currentCycleLabel').textContent = cn <= 10 ? `Cycle ${cn} of 10` : cn === 11 ? 'Mock Exam 1' : 'Mock Exam 2';
    }

    renderFocus(scores);
    renderCycles(p);
    renderProgress(scores);
    renderBadges(p);
  }

  function renderFocus(scores){
    const ordered = SKILLS.slice().sort((a,b) => scores[a[0]] - scores[b[0]]);
    const [key, label, icon, link] = ordered[0];
    const tips = {
      speaking: 'Complete one Task A using PREP: Point, Reason, Example, Point again.',
      reading:  'Complete one part using Question-First strategy.',
      listening:'Practise one part. Write keywords, not full sentences.',
      writing:  'Write one task using the rubric checklist and check word count.'
    };
    if(el('focusTitle')) el('focusTitle').textContent = `${icon} Focus: ${label}`;
    if(el('focusText'))  el('focusText').textContent  = tips[key];
    const btn = el('focusBtn');
    if(btn) btn.onclick = () => openModule(link);
  }

  function renderCycles(p){
    const wrap = el('cycleStrip');
    if(!wrap) return;
    const cycles = arr(LS.cycles);
    const current = p?.currentCycle || 1;

    wrap.innerHTML = CYCLE_MAP.map((c, i) => {
      const cycleNum = i + 1;
      const completed = cycles.find(x => x.cycleNumber === cycleNum && x.completed);
      const isCurrent = cycleNum === current && cycleNum <= 10;
      const isLocked  = cycleNum > current;
      const isMock    = i >= 10;
      const mockCompleted = isMock && arr(LS.mock).find(m => m.mockNumber === (i - 9));

      let cls = 'cycle-node';
      if(completed || mockCompleted) cls += ' done';
      else if(isCurrent) cls += ' current';
      else if(isLocked)  cls += ' locked';

      const bandStr = completed ? `<small>Band ${completed.band}</small>` : '';
      const lockStr = isLocked  ? '<div class="lock-icon">🔒</div>' : '';

      return `<div class="${cls}" title="${c.paper}">
        ${lockStr}
        <div class="cycle-label">${c.label}</div>
        <div class="cycle-diff">${c.difficulty}</div>
        ${bandStr}
      </div>`;
    }).join('');
  }

  function renderResources(){
    const wrap = el('resourceList');
    if(!wrap) return;
    wrap.innerHTML = MATERIALS.map(m => `
      <div class="resource-card">
        <div class="res-header">
          <h3>${m.title}</h3>
          <span class="res-badge" style="background:${m.badgeColor}">${m.badge}</span>
        </div>
        <p>${m.desc}</p>
        <div class="res-links">
          ${m.links.map(([label, url]) =>
            `<a href="${url}" target="_blank" rel="noopener" class="res-link">${label} ↗</a>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }

  function renderProgress(scores){
    const wrap = el('progressRows');
    if(!wrap) return;
    wrap.innerHTML = SKILLS.map(([key, label, icon]) => {
      const s = scores?.[key] ?? getLatestScore(key);
      const pc = Math.round(s / 90 * 100);
      return `
        <div class="progress-row">
          <div class="top"><span>${icon} ${label}</span><span>${s}/90</span></div>
          <div class="track"><span style="width:${pc}%"></span></div>
        </div>
      `;
    }).join('');

    // Cycle history on progress screen
    const histEl = el('cycleHistory');
    if(histEl){
      const cycles = arr(LS.cycles);
      if(!cycles.length){
        histEl.innerHTML = '<p style="color:var(--muted);font-weight:800;padding:10px 0">Complete your first cycle to see Band Achiever results here.</p>';
      } else {
        histEl.innerHTML = cycles.map(c => `
          <div class="cycle-result-row">
            <div class="cr-left">
              <b>Cycle ${c.cycleNumber}</b>
              <small>${c.band ? `Band ${c.band}` : ''}</small>
            </div>
            <div class="cr-scores">
              <span>S: ${c.speaking90}</span>
              <span>R: ${c.reading90}</span>
              <span>L: ${c.listening90}</span>
              <span>W: ${c.writing90}</span>
            </div>
            <div class="cr-total">${c.total360}<small>/360</small></div>
          </div>
        `).join('');
      }
    }
  }

  function renderBadges(p){
    const wrap = el('badges');
    if(!wrap) return;
    const earned = p.badges || [];
    wrap.innerHTML = ALL_BADGES.map(([icon, name, id]) => `
      <div class="badge ${earned.includes(id) ? '' : 'locked'}">
        <span>${earned.includes(id) ? icon : '🔒'}</span>
        <b>${name}</b>
      </div>
    `).join('');
  }

  // ── FORMS ─────────────────────────────────────────────────
  function bindForms(){
    const form = el('profileForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const profile = {
        name:        val('name'),
        regNo:       val('regNo'),
        group:       val('group'),
        targetBand:  val('targetBand'),
        xp:          50,
        streak:      1,
        currentCycle:1,
        badges:      ['first_step', 'quick_starter'],
        lastVisit:   new Date().toISOString(),
        createdAt:   new Date().toISOString()
      };
      saveProfile(profile);
      toast('Profile created. Welcome to MUET SmartHub!');
      show('homeScreen');
      render();
      fillEdit();
    });

    const edit = el('editForm');
    edit?.addEventListener('submit', e => {
      e.preventDefault();
      const p = loadProfile() || {};
      p.name       = val('editName');
      p.regNo      = val('editRegNo');
      p.group      = val('editGroup');
      p.targetBand = val('editTarget');
      saveProfile(p);
      toast('Profile updated.');
      show('homeScreen');
      render();
    });
  }

  function fillEdit(){
    const p = loadProfile();
    if(!p) return;
    set('editName',   p.name       || '');
    set('editRegNo',  p.regNo      || '');
    set('editGroup',  p.group      || '');
    set('editTarget', p.targetBand || '4.0');
  }

  // ── SCREEN NAV ────────────────────────────────────────────
  function show(id, first = false){
    document.querySelectorAll('.screen').forEach(s =>
      s.classList.toggle('active', s.id === id)
    );
    const nav = el('nav');
    if(nav) nav.style.display = id === 'registerScreen' ? 'none' : 'grid';
    document.querySelectorAll('.bottom-nav button').forEach(btn =>
      btn.classList.remove('active')
    );
    const map = { homeScreen:0, materialsScreen:1, progressScreen:2, profileScreen:3 };
    const navBtn = document.querySelectorAll('.bottom-nav button')[map[id]];
    if(navBtn) navBtn.classList.add('active');
    if(!first) window.scrollTo({ top:0, behavior:'smooth' });
    if(id === 'homeScreen' || id === 'progressScreen') render();
    if(id === 'profileScreen') fillEdit();
    if(id === 'materialsScreen') renderResources();
  }

  function openModule(url){ window.location.href = url; }

  // ── DEMO SEED ─────────────────────────────────────────────
  function seedDemo(){
    localStorage.setItem(LS.speaking,  JSON.stringify([{ cycleNumber:1, score:64, score90:64, bandLabel:'4.0', type:'Task A', date:new Date().toISOString() }]));
    localStorage.setItem(LS.reading,   JSON.stringify([{ cycleNumber:1, rawScore:28, totalQ:40, score90:63, date:new Date().toISOString() }]));
    localStorage.setItem(LS.listening, JSON.stringify([{ cycleNumber:1, rawScore:22, totalQ:30, score90:66, date:new Date().toISOString() }]));
    localStorage.setItem(LS.writing,   JSON.stringify([{ cycleNumber:1, score:58, score90:58, taskType:'2', date:new Date().toISOString() }]));
    const p = loadProfile() || {};
    p.xp = (p.xp || 0) + 320;
    p.currentCycle = 2;
    p.badges = [...new Set([...(p.badges || []), 'prep_starter','passage_hunter','audio_focus','essay_builder','email_ready','discussion_builder'])];
    const cycleRecord = {
      cycleNumber:1, completed:true, completedAt:new Date().toISOString(),
      speaking90:64, reading90:63, listening90:66, writing90:58,
      total360:251, band:'3.5', weakestComponent:'Writing', improvement:null, xpEarned:50
    };
    localStorage.setItem(LS.cycles, JSON.stringify([cycleRecord]));
    saveProfile(p);
    toast('Demo scores added. Cycle 1 complete — Band 3.5!');
    render();
  }

  function resetAll(){
    if(!confirm('Reset all MUET SmartHub data? This cannot be undone.')) return;
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    toast('App reset.');
    setTimeout(() => location.reload(), 500);
  }

  // ── TOAST ─────────────────────────────────────────────────
  function toast(msg){
    const t = el('toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  // ── INIT ──────────────────────────────────────────────────
  function init(){
    bindForms();

    let p = loadProfile();
    if(p){
      // Run daily streak check on every load
      p = checkAndUpdateStreak(p);
      p.lastVisit = new Date().toISOString();
      saveProfile(p);
      show('homeScreen');
      render();
      fillEdit();
    } else {
      show('registerScreen', true);
    }
  }

  // ── PUBLIC API ────────────────────────────────────────────
  // Shared utility for module pages to call after saving a session
  function afterSessionSave(){
    let p = loadProfile();
    if(!p) return;
    p = checkBadges(p);
    p = checkCycleCompletion(p);
    saveProfile(p);
  }

  return {
    init, show, openModule, seedDemo, resetAll, toast,
    afterSessionSave, checkBadges, checkCycleCompletion,
    getXPLevel, scoreToBand, arr, loadProfile, saveProfile,
    LS, SKILLS, CYCLE_MAP
  };
})();

document.addEventListener('DOMContentLoaded', MuetNeo.init);
