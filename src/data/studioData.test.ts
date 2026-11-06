import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESENTATION_AUDIO_URL,
  PRESENTATION_AUDIO_TRANSCRIPT,
  STUDIO_GALLERY_ITEMS,
  STUDIO_SERVICES,
  STUDIO_DROPS,
  LOOKBOOK_ITEMS,
  GOOGLE_REVIEWS,
} from './studioData';

test('presentation audio asset and synchronized transcript are properly configured', () => {
  assert.equal(
    PRESENTATION_AUDIO_URL,
    '/assets/aistudio/ElevenLabs_2026-11-06T09_51_29_Carlos_pro_pvc_s50_sim75_v4_d6b60f32.mp3'
  );
  assert.ok(PRESENTATION_AUDIO_TRANSCRIPT.length >= 5);
  for (const segment of PRESENTATION_AUDIO_TRANSCRIPT) {
    assert.ok(segment.endTime > segment.startTime, `Segment ${segment.id} must have endTime > startTime`);
    assert.ok(segment.text.length > 5, `Segment ${segment.id} must have non-empty text`);
  }
});

test('multi-purpose gallery includes all 5 categories for Rodrigo and the studio', () => {
  const categories = new Set(STUDIO_GALLERY_ITEMS.map((item) => item.category));
  assert.ok(categories.has('Cortes & Fades'));
  assert.ok(categories.has('El Estudio & Local'));
  assert.ok(categories.has('Máquinas & Setup'));
  assert.ok(categories.has('Color & Diseños'));
  assert.ok(categories.has('Cultura & Streetwear'));
});

test('no services, lookbook items, gallery items, or reviews reference razors (navaja/shavette)', () => {
  const serialized = JSON.stringify({
    STUDIO_SERVICES,
    STUDIO_DROPS,
    LOOKBOOK_ITEMS,
    STUDIO_GALLERY_ITEMS,
    GOOGLE_REVIEWS,
  }).toLowerCase();

  assert.equal(serialized.includes('navaja'), false, 'Should not contain navaja');
  assert.equal(serialized.includes('shavette'), false, 'Should not contain shavette');
});
