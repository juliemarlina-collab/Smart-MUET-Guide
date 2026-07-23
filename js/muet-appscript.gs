/***************************************************************
 * SMART MUET GUIDE — Google Apps Script Backend
 * Version 2.0 · Jules Marlina binti Hasan · ELU · POLIPD
 *
 * SETUP STEPS:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script → paste this file as Code.gs
 * 3. Replace SPREADSHEET_ID below with your Sheet ID
 * 4. Run setupSheets() once to create all sheet tabs
 * 5. Run testFullFlow() to verify everything works
 * 6. Deploy → New Deployment → Web App
 *    Execute as: Me
 *    Who has access: Anyone (even anonymous)
 * 7. Copy the Web App URL into js/backend-config.js
 ***************************************************************/

var SPREADSHEET_ID = 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE';

var SHEET = {
  STUDENTS:  'Students',
  ATTEMPTS:  'Attempts',
  SPEAKING:  'Speaking',
  READING:   'Reading',
  LISTENING: 'Listening',
  WRITING:   'Writing',
  BADGES:    'Badges',
  LOG:       'Activity_Log'
};

/***************************************************************
 * ROUTING
 ***************************************************************/
function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var action = clean(params.action);
  try {
    setupIfNeeded_();
    if (action === 'ping') return json({ status:'ok', message:'Smart MUET Guide backend running.', ts: new Date().toISOString() });
    if (action === 'student_status') return json(handleStudentStatus(params));
    if (action === 'class_results') return json(handleClassResults(params));
    return json({ status:'error', message:'Unknown GET action: ' + action });
  } catch(err) {
    return json({ status:'error', message: String(err) });
  }
}

function doPost(e) {
  try {
    setupIfNeeded_();
    var raw  = e && e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var action = clean(data.action);

    if (action === 'register')      return json(handleRegister(data));
    if (action === 'saveAttempt')   return json(handleSaveAttempt(data));
    if (action === 'profile_update')return json(handleProfileUpdate(data));
    return json({ status:'error', message:'Unknown POST action: ' + action });
  } catch(err) {
    logSafe('ERROR', '', '', String(err));
    return json({ status:'error', message: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/***************************************************************
 * SETUP
 ***************************************************************/
function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  makeSheet(ss, SHEET.STUDENTS, [
    'Timestamp','Student Name','Email','Reg No',
    'Class / Group','Target Band','Registered On','Last Seen','Status'
  ]);

  makeSheet(ss, SHEET.ATTEMPTS, [
    'Timestamp','Student Name','Email','Reg No','Class / Group',
    'Vault ID','Component','Task Type','Raw Score','Total Items',
    'Score /90','Estimated Band','XP Earned','Feedback','Next Action',
    'Badge Earned','Status','Answer Text'
  ]);

  makeSheet(ss, SHEET.SPEAKING, [
    'Timestamp','Student Name','Email','Reg No','Vault ID',
    'Task Type','Topic ID','Topic Title','Prompt',
    'PREP Point','PREP Reason','PREP Example','PREP Close',
    'Transcript','Score /90','Band'
  ]);

  makeSheet(ss, SHEET.READING, [
    'Timestamp','Student Name','Email','Reg No','Vault ID',
    'Raw Score','Total Questions','Score /90','Band',
    'Weak Question Types','XP Earned'
  ]);

  makeSheet(ss, SHEET.LISTENING, [
    'Timestamp','Student Name','Email','Reg No','Vault ID',
    'Raw Score','Total Questions','Score /90','Band',
    'Notes Taken','XP Earned'
  ]);

  makeSheet(ss, SHEET.WRITING, [
    'Timestamp','Student Name','Email','Reg No','Vault ID',
    'Task Type','Topic','Word Count','Score /90','Band',
    'Task Fulfilment','Organisation','Language','Vocabulary',
    'Answer Preview','XP Earned'
  ]);

  makeSheet(ss, SHEET.BADGES, [
    'Timestamp','Student Name','Email','Reg No','Badge','Source','Awarded'
  ]);

  makeSheet(ss, SHEET.LOG, [
    'Timestamp','Action','Student Name','Email','Reg No','Details'
  ]);

  Logger.log('Smart MUET Guide sheets ready.');
}

function setupIfNeeded_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('PASTE_') === 0) {
    throw new Error('SPREADSHEET_ID not set. Paste your Google Sheet ID at the top of Code.gs.');
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  if (!ss.getSheetByName(SHEET.STUDENTS)) setupSheets();
}

function makeSheet(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    var r = sh.getRange(1, 1, 1, headers.length);
    r.setBackground('#071B3D');
    r.setFontColor('#FFFFFF');
    r.setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

/***************************************************************
 * REGISTRATION
 ***************************************************************/
function handleRegister(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET.STUDENTS);
  var now = new Date();

  var name       = clean(data.studentName || data.name || '');
  var email      = clean(data.studentEmail || data.email || '').toLowerCase();
  var regNo      = clean(data.studentRegNo || data.regNo || '').toUpperCase();
  var classGroup = clean(data.classGroup || data.group || '');
  var targetBand = clean(data.targetBand || '4.0');
  var registered = clean(data.registeredAt || now.toISOString());

  if (!email && !regNo) return { status:'error', message:'Email or Reg No required.' };

  var row = findStudent_(sh, email, regNo);
  if (row > 0) {
    // Update existing
    setCell_(sh, row, 'Last Seen', now);
    setCell_(sh, row, 'Status', 'Active');
    if (name) setCell_(sh, row, 'Student Name', name);
    if (classGroup) setCell_(sh, row, 'Class / Group', classGroup);
    if (targetBand) setCell_(sh, row, 'Target Band', targetBand);
    logSafe('REGISTER_UPDATE', name, email, regNo);
    return { status:'ok', message:'Profile updated.', returning:true };
  }

  // New registration
  sh.appendRow([now, name, email, regNo, classGroup, targetBand, now, now, 'Registered']);
  logSafe('REGISTER_NEW', name, email, regNo);
  return { status:'ok', message:'Registration saved.', returning:false };
}

/***************************************************************
 * SAVE ATTEMPT (called from frontend saveSmartMuetAttempt)
 ***************************************************************/
function handleSaveAttempt(data) {
  var ss  = SpreadsheetApp.openById(SPREADSHEET_ID);
  var now = new Date();

  var name       = clean(data.studentName || '');
  var email      = clean(data.studentEmail || '').toLowerCase();
  var regNo      = clean(data.studentRegNo || '').toUpperCase();
  var classGroup = clean(data.classGroup || '');
  var vaultId    = clean(data.vaultId || 'VAULT-01');
  var component  = clean(data.component || '');
  var taskType   = clean(data.taskType || '');
  var rawScore   = Number(data.rawScore || 0);
  var totalItems = Number(data.totalItems || 90);
  var score90    = Number(data.score90 || 0);
  var band       = clean(data.estimatedBand || data.band || '');
  var xp         = Number(data.xpEarned || 0);
  var feedback   = clean(data.feedback || '');
  var nextAction = clean(data.nextAction || '');
  var badge      = clean(data.badgeEarned || '');
  var status     = clean(data.status || 'Auto-feedback');
  var answerText = String(data.answerText || '').substring(0, 500);

  // Upsert student
  upsertStudent_(name, email, regNo, classGroup, now);

  // Main Attempts sheet
  var attSh = ss.getSheetByName(SHEET.ATTEMPTS);
  attSh.appendRow([
    now, name, email, regNo, classGroup,
    vaultId, component, taskType, rawScore, totalItems,
    score90, band, xp, feedback, nextAction, badge, status, answerText
  ]);

  // Component-specific sheet
  saveComponentDetail_(ss, data, now, name, email, regNo, vaultId, component, score90, band, xp, taskType, answerText);

  // Badge log
  if (badge) {
    var bdSh = ss.getSheetByName(SHEET.BADGES);
    bdSh.appendRow([now, name, email, regNo, badge, component, 'Yes']);
  }

  logSafe('ATTEMPT_SAVED', name, email, regNo, component + ' ' + score90 + '/90');

  return { status:'ok', message:'Attempt saved.', component:component, score90:score90, band:band };
}

function saveComponentDetail_(ss, data, now, name, email, regNo, vaultId, component, score90, band, xp, taskType, answerText) {
  var comp = component.toLowerCase();

  if (comp === 'speaking') {
    var prep = data.rubric && data.rubric.criteria ? {} : (data.prep || {});
    var sh = ss.getSheetByName(SHEET.SPEAKING);
    sh.appendRow([
      now, name, email, regNo, vaultId, taskType,
      clean(data.topicId || ''), clean(data.topicTitle || ''), clean(data.prompt || ''),
      clean(prep.point || ''), clean(prep.reason || ''), clean(prep.example || ''), clean(prep.close || ''),
      answerText.substring(0, 400), score90, band
    ]);
  }

  if (comp === 'reading') {
    var sh = ss.getSheetByName(SHEET.READING);
    sh.appendRow([
      now, name, email, regNo, vaultId,
      Number(data.rawScore || 0), Number(data.totalItems || 40), score90, band,
      clean(Array.isArray(data.weakTypes) ? data.weakTypes.join(', ') : ''), xp
    ]);
  }

  if (comp === 'listening') {
    var sh = ss.getSheetByName(SHEET.LISTENING);
    sh.appendRow([
      now, name, email, regNo, vaultId,
      Number(data.rawScore || 0), Number(data.totalItems || 30), score90, band,
      answerText.substring(0, 200), xp
    ]);
  }

  if (comp === 'writing') {
    var criteria = {};
    if (data.rubric && data.rubric.criteria) {
      data.rubric.criteria.forEach(function(c) {
        criteria[c.name] = c.score;
      });
    }
    var sh = ss.getSheetByName(SHEET.WRITING);
    sh.appendRow([
      now, name, email, regNo, vaultId, taskType,
      clean(data.topic || data.topicTitle || ''),
      Number(data.wordCount || 0), score90, band,
      criteria['Task Fulfilment'] || '', criteria['Organisation'] || '',
      criteria['Language Structure'] || '', criteria['Lexis'] || '',
      answerText.substring(0, 300), xp
    ]);
  }
}

/***************************************************************
 * PROFILE UPDATE
 ***************************************************************/
function handleProfileUpdate(data) {
  var ss  = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh  = ss.getSheetByName(SHEET.STUDENTS);
  var email  = clean(data.studentEmail || data.email || '').toLowerCase();
  var regNo  = clean(data.studentRegNo || data.regNo || '').toUpperCase();
  var row = findStudent_(sh, email, regNo);
  if (row < 1) return { status:'error', message:'Student not found. Register first.' };
  setCell_(sh, row, 'Target Band', clean(data.targetBand || ''));
  setCell_(sh, row, 'Class / Group', clean(data.classGroup || data.group || ''));
  setCell_(sh, row, 'Last Seen', new Date());
  logSafe('PROFILE_UPDATE', clean(data.studentName || ''), email, regNo, 'Target band updated');
  return { status:'ok', message:'Profile updated.' };
}

/***************************************************************
 * STUDENT STATUS (GET)
 ***************************************************************/
function handleStudentStatus(params) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh    = ss.getSheetByName(SHEET.STUDENTS);
  var email = clean(params.email || '').toLowerCase();
  var regNo = clean(params.regNo || '').toUpperCase();
  var row   = findStudent_(sh, email, regNo);
  if (row < 1) return { status:'error', exists:false };

  var headers = getHeaders_(sh);
  var vals    = sh.getRange(row, 1, 1, headers.length).getValues()[0];
  var obj     = rowToObj_(headers, vals);

  // Count attempts
  var attSh = ss.getSheetByName(SHEET.ATTEMPTS);
  var count  = 0;
  if (attSh && attSh.getLastRow() >= 2) {
    var rows = attSh.getRange(2, 1, attSh.getLastRow()-1, attSh.getLastColumn()).getValues();
    rows.forEach(function(r) {
      var re = clean(r[2]).toLowerCase();
      var rg = clean(r[3]).toUpperCase();
      if (re === email || rg === regNo) count++;
    });
  }

  return {
    status:'ok', exists:true,
    student: {
      name:       clean(obj['Student Name']),
      email:      clean(obj['Email']),
      regNo:      clean(obj['Reg No']),
      classGroup: clean(obj['Class / Group']),
      targetBand: clean(obj['Target Band'])
    },
    totalAttempts: count
  };
}

/***************************************************************
 * CLASS RESULTS (GET — for lecturer dashboard)
 ***************************************************************/
function handleClassResults(params) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var classFilter = clean(params.class || params.className || '').toLowerCase();
  var attSh = ss.getSheetByName(SHEET.ATTEMPTS);
  if (!attSh || attSh.getLastRow() < 2) return { status:'ok', rows:[] };

  var headers = getHeaders_(attSh);
  var data    = attSh.getRange(2, 1, attSh.getLastRow()-1, headers.length).getValues();
  var results = [];

  data.forEach(function(row) {
    var obj = rowToObj_(headers, row);
    if (classFilter && clean(obj['Class / Group']).toLowerCase() !== classFilter) return;
    results.push({
      name:      clean(obj['Student Name']),
      email:     clean(obj['Email']),
      regNo:     clean(obj['Reg No']),
      classGroup:clean(obj['Class / Group']),
      vaultId:   clean(obj['Vault ID']),
      component: clean(obj['Component']),
      score90:   Number(obj['Score /90'] || 0),
      band:      clean(obj['Estimated Band']),
      date:      obj['Timestamp']
    });
  });

  return { status:'ok', total:results.length, rows:results };
}

/***************************************************************
 * HELPERS
 ***************************************************************/
function upsertStudent_(name, email, regNo, classGroup, now) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET.STUDENTS);
  var row = findStudent_(sh, email, regNo);
  if (row > 0) {
    setCell_(sh, row, 'Last Seen', now);
    setCell_(sh, row, 'Status', 'Active');
  } else if (email || regNo) {
    sh.appendRow([now, name, email, regNo, classGroup, '4.0', now, now, 'Auto-created']);
  }
}

function findStudent_(sh, email, regNo) {
  if (!sh || sh.getLastRow() < 2) return -1;
  var headers = getHeaders_(sh);
  var emailCol = headers.indexOf('Email') + 1;
  var regCol   = headers.indexOf('Reg No') + 1;
  var data = sh.getRange(2, 1, sh.getLastRow()-1, headers.length).getValues();
  for (var i = 0; i < data.length; i++) {
    var re = regCol > 0 ? clean(data[i][regCol-1]).toUpperCase() : '';
    var em = emailCol > 0 ? clean(data[i][emailCol-1]).toLowerCase() : '';
    if ((regNo && re === regNo) || (email && em === email)) return i + 2;
  }
  return -1;
}

function getHeaders_(sh) {
  if (!sh || sh.getLastColumn() < 1) return [];
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function(h){ return clean(h); });
}

function setCell_(sh, row, headerName, value) {
  var headers = getHeaders_(sh);
  var col = headers.indexOf(headerName) + 1;
  if (col > 0) sh.getRange(row, col).setValue(value);
}

function rowToObj_(headers, row) {
  var obj = {};
  headers.forEach(function(h, i){ obj[h] = row[i]; });
  return obj;
}

function clean(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function logSafe(action, name, email, regNo, details) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sh = ss.getSheetByName(SHEET.LOG);
    if (!sh) return;
    sh.appendRow([new Date(), action, name||'', email||'', regNo||'', details||'']);
  } catch(err) { Logger.log('Log failed: ' + err); }
}

/***************************************************************
 * MENU
 ***************************************************************/
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Smart MUET Guide')
    .addItem('Setup Sheets', 'setupSheets')
    .addItem('Test Full Flow', 'testFullFlow')
    .addItem('View Activity Log', 'viewLog')
    .addToUi();
}

function viewLog() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(SHEET.LOG);
  if (sh) ss.setActiveSheet(sh);
}

/***************************************************************
 * TEST
 ***************************************************************/
function testFullFlow() {
  setupSheets();

  var reg = handleRegister({
    studentName:'Test MUET Student', studentEmail:'muet.test@polipd.edu.my',
    studentRegNo:'TEST001', classGroup:'DPR5A', targetBand:'4.0'
  });
  Logger.log('REGISTER: ' + JSON.stringify(reg));

  var spk = handleSaveAttempt({
    action:'saveAttempt',
    studentName:'Test MUET Student', studentEmail:'muet.test@polipd.edu.my',
    studentRegNo:'TEST001', classGroup:'DPR5A',
    vaultId:'VAULT-01', component:'Speaking', taskType:'Task A',
    rawScore:68, totalItems:90, score90:68, estimatedBand:'4.0',
    xpEarned:90, feedback:'Good PREP structure.', nextAction:'Practise Task B.',
    badgeEarned:'PREP Starter', status:'Auto-feedback',
    answerText:'I believe students should pursue part-time work because it builds independence.',
    topicId:'A1', topicTitle:'Candidate A - Location',
    prep:{ point:'Location matters', reason:'Affects commute', example:'KL vs Sabah', close:'Location is key' }
  });
  Logger.log('SPEAKING: ' + JSON.stringify(spk));

  var rd = handleSaveAttempt({
    action:'saveAttempt',
    studentName:'Test MUET Student', studentEmail:'muet.test@polipd.edu.my',
    studentRegNo:'TEST001', classGroup:'DPR5A',
    vaultId:'VAULT-01', component:'Reading', taskType:'MCQ',
    rawScore:28, totalItems:40, score90:63, estimatedBand:'4.0',
    xpEarned:80, feedback:'Good reading accuracy.', nextAction:'Review inference questions.',
    badgeEarned:'Passage Hunter', status:'Auto-marked',
    answerText:'28/40 correct.', weakTypes:['Part 5']
  });
  Logger.log('READING: ' + JSON.stringify(rd));

  var status = handleStudentStatus({ email:'muet.test@polipd.edu.my' });
  Logger.log('STATUS: ' + JSON.stringify(status));

  return 'Test complete. Check Students, Attempts, Speaking, Reading tabs.';
}
