# MUET SmartHub MVP v1.1 — NeoPop UI Direction

This version fixes the previous design direction and follows a stronger Contra/UI Store inspired style.

## Improvements
- Open `index.html` directly. No redirect problem.
- Turquoise app background.
- Thick black outlines.
- Offset shadows.
- Bold yellow, blue, pink, green and orange module cards.
- Mobile-first layout.
- More playful NeoPop academic dashboard.
- Placeholder pages for Speaking, Reading, Listening and Writing.

## Test
1. Extract the ZIP.
2. Open `index.html`.
3. Create a profile.
4. Use Demo button to preview scores.


## v1.2 Update
- SmartSpeaking placeholder replaced with a working Speaking module.
- Task A and Task B practice included.
- PREP notes, timer, rubric checklist, transcript box and score estimation included.
- Saves practice result to `muet_speaking_sessions`.
- Hub dashboard updates Speaking score after returning.


## v1.3 Update
- SmartWriting placeholder replaced with a working Writing module.
- Task 1 and Task 2 included.
- Timer: 25 minutes for Task 1 and 50 minutes for Task 2.
- Word count and word status included.
- Rubric checklist included.
- Estimates score out of 90 and band label.
- Saves result to `muet_writing_sessions`.
- Hub dashboard updates Writing score after returning.


## v1.4 Update
- SmartReading placeholder replaced with a working Reading module.
- Includes 2 sample practice sets.
- Includes timer, passages, MCQ questions, answer checking and explanations.
- Calculates raw score, percentage and score out of 90.
- Tracks part breakdown and weakest question type.
- Saves result to `muet_reading_history`.
- Hub dashboard updates Reading score after returning.


## v1.5 Update
- SmartListening placeholder replaced with a working Listening module.
- Includes 2 prototype listening sessions.
- Uses browser speech synthesis as temporary audio simulation.
- Includes part navigation, note-taking boxes, answer checking, explanations and transcript reveal after submission.
- Calculates raw score, percentage and score out of 90.
- Saves result to `muet_listening_sessions`.
- Hub dashboard updates Listening score after returning.
- Later upgrade: replace browser script playback with real MUET audio files.


## v1.6 Update — Study Vault
- Materials page replaced with Study Vault.
- Removed student-facing Google Drive resource concept.
- Added Starter Vault / Vault 0 for previous sample practice.
- Added Vault 1–10 for complete MUET practice sets.
- Added Final Mock Exam 1 and Final Mock Exam 2 for strict exam mode.
- Each vault contains Speaking, Reading, Listening and Writing components.
- Added unique paper ID placeholders to avoid duplicate test papers.
- Active vault is saved before opening a component.
- Component results now save vault metadata when launched from Study Vault.
