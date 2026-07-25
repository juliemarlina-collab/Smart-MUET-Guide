/* ═════════════════════════════════════════════════════════════════════════
   PHOTO UPLOAD FUNCTIONS
   
   ADD THESE FUNCTIONS TO MuetNeo OBJECT IN muet-neopop.js
   
   Location: After the existing MuetNeo object initialization, around line 200-300,
   BEFORE the closing "};" of the MuetNeo object.
   
   These functions handle:
   - Photo upload from device
   - Selfie capture from camera
   - Photo preview updates
   - Profile hero updates
   ═════════════════════════════════════════════════════════════════════════ */

// ── Photo Upload & Display ──────────────────────────────────────
MuetNeo.handlePhotoUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file');
    return;
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    alert('Image must be less than 5MB');
    return;
  }

  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoData = e.target.result;
    
    // Save to localStorage
    const profiles = JSON.parse(localStorage.getItem(LS.profile) || '[]');
    if (profiles.length > 0) {
      profiles[0].photo = photoData;
      localStorage.setItem(LS.profile, JSON.stringify(profiles));
    }

    // Update preview images
    const previewEl = document.getElementById('editPhotoPreview');
    if (previewEl) previewEl.src = photoData;
    
    const heroEl = document.getElementById('profileHeroPhoto');
    if (heroEl) heroEl.src = photoData;
    
    // Update hero section
    MuetNeo.updateProfileHero();
    
    // Show success message
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = '📸 Photo saved!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }
  };

  reader.readAsDataURL(file);
};

// Request camera photo (selfie)
MuetNeo.requestCameraPhoto = function() {
  // Check browser support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera not supported on this device. Use "Upload Photo" instead.');
    return;
  }

  // Create camera modal
  const modal = document.createElement('div');
  modal.className = 'camera-modal';
  modal.innerHTML = `
    <div class="camera-container">
      <div class="camera-header">
        <h3>Take a Selfie</h3>
        <button onclick="this.closest('.camera-modal').remove()" class="close-btn">✕</button>
      </div>
      <video id="cameraPreview" autoplay playsinline style="width: 100%; border-radius: 14px; margin-bottom: 12px; background: black;"></video>
      <div class="camera-actions">
        <button class="btn-cancel" onclick="MuetNeo.stopCamera(); this.closest('.camera-modal').remove();">Cancel</button>
        <button class="btn-capture" onclick="MuetNeo.capturePhoto();">📷 Capture</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Start camera
  navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: 'user' },
    audio: false 
  }).then(stream => {
    MuetNeo.currentStream = stream;
    const video = document.getElementById('cameraPreview');
    video.srcObject = stream;
  }).catch(err => {
    console.error('Camera error:', err);
    alert('Unable to access camera. Please use "Upload Photo".');
    modal.remove();
  });
};

// Capture photo from camera
MuetNeo.capturePhoto = function() {
  const video = document.getElementById('cameraPreview');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  // Convert to blob and handle like upload
  canvas.toBlob(blob => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const photoData = e.target.result;
      
      // Save photo
      const profiles = JSON.parse(localStorage.getItem(LS.profile) || '[]');
      if (profiles.length > 0) {
        profiles[0].photo = photoData;
        localStorage.setItem(LS.profile, JSON.stringify(profiles));
      }

      // Update displays
      const previewEl = document.getElementById('editPhotoPreview');
      if (previewEl) previewEl.src = photoData;
      
      const heroEl = document.getElementById('profileHeroPhoto');
      if (heroEl) heroEl.src = photoData;
      
      MuetNeo.updateProfileHero();

      // Stop camera and close modal
      MuetNeo.stopCamera();
      const modal = document.querySelector('.camera-modal');
      if (modal) modal.remove();

      // Show success
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = '📸 Selfie saved!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }
    };
    reader.readAsDataURL(blob);
  }, 'image/jpeg', 0.8);
};

// Stop camera stream
MuetNeo.stopCamera = function() {
  if (MuetNeo.currentStream) {
    MuetNeo.currentStream.getTracks().forEach(track => track.stop());
    MuetNeo.currentStream = null;
  }
};

// Update profile hero with current data
MuetNeo.updateProfileHero = function() {
  const profiles = JSON.parse(localStorage.getItem(LS.profile) || '[]');
  const profile = profiles[0];
  if (!profile) return;

  // Update name
  const nameEl = document.getElementById('profileHeroName');
  if (nameEl) nameEl.textContent = profile.name || 'Student Name';

  // Update target band
  const targetEl = document.getElementById('profileHeroTarget');
  if (targetEl) targetEl.textContent = 'Band ' + (profile.targetBand || '4.0');

  // Update current band (from overall score calculation)
  const currentEl = document.getElementById('profileHeroCurrent');
  if (currentEl) {
    const overallBandEl = document.getElementById('overallBand');
    const bandText = overallBandEl ? overallBandEl.textContent : 'Band 0.0';
    currentEl.textContent = bandText;
  }

  // Update streak
  const streakEl = document.getElementById('profileHeroStreak');
  if (streakEl) streakEl.textContent = profile.streak || '0';

  // Update XP
  const xpEl = document.getElementById('profileHeroXP');
  if (xpEl) xpEl.textContent = profile.xp || '0';

  // Update photo
  if (profile.photo) {
    const photoEls = document.querySelectorAll('#profileHeroPhoto, #editPhotoPreview');
    photoEls.forEach(el => el.src = profile.photo);
  }
};

/* ═════════════════════════════════════════════════════════════════════════
   END OF PHOTO FUNCTIONS
   
   NEXT STEP: Update the profile form save handler to include photo.
   See STEP_2_UPDATE_PROFILE_SAVE.txt
   ═════════════════════════════════════════════════════════════════════════ */
