/**
 * Smart MUET backend config and helper.
 * Replace SMART_MUET_BACKEND_URL with your deployed Apps Script Web App URL.
 */
const SMART_MUET_BACKEND_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

async function saveSmartMuetAttempt(payload) {
  if (!SMART_MUET_BACKEND_URL || SMART_MUET_BACKEND_URL.includes('PASTE_')) {
    console.warn('Smart MUET backend URL not configured. Saving locally only.', payload);
    return { ok:false, localOnly:true, message:'Backend URL not configured.' };
  }

  try {
    const res = await fetch(SMART_MUET_BACKEND_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action:'saveAttempt', ...payload })
    });

    // no-cors does not allow reading response, but request will still be sent.
    return { ok:true, sent:true };
  } catch (err) {
    console.error('Backend save failed:', err);
    return { ok:false, error:String(err) };
  }
}

// Example payload:
/*
saveSmartMuetAttempt({
  studentEmail:'student@polipd.edu.my',
  studentName:'Student Name',
  classGroup:'DPR3A',
  vaultId:'VAULT-01',
  component:'Writing',
  taskType:'Task 1',
  score90:72,
  estimatedBand:'4.0',
  feedback:'You addressed all notes. Improve sentence variety.',
  nextAction:'Review Task 1 paragraphing guide.',
  badgeEarned:'Essay Builder',
  answerText:'Student answer here...',
  rubric:{
    engine:'Rule-based rubric v1',
    reviewStatus:'Auto-feedback',
    overallStrength:'Task fulfilment',
    improvementFocus:'Sentence variety',
    nextAction:'Use more complex sentences.',
    criteria:[
      {name:'Task Fulfilment', score:18, feedback:'All required notes addressed.'},
      {name:'Organisation', score:16, feedback:'Clear but paragraphing can improve.'},
      {name:'Structure', score:15, feedback:'Mostly simple sentences.'},
      {name:'Lexis', score:14, feedback:'Suitable vocabulary.'}
    ]
  }
});
*/
