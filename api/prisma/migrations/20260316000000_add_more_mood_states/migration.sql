-- Add 10 new mood states: Carga social, Desorientación, Alta intensidad
INSERT INTO "moods" (id, code, name, emoji, category, display_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'guilty', 'Culpable', '😣', 'social_load', 15, NOW(), NOW()),
  (gen_random_uuid(), 'ashamed', 'Avergonzado', '😳', 'social_load', 16, NOW(), NOW()),
  (gen_random_uuid(), 'resentful', 'Resentido', '😒', 'social_load', 17, NOW(), NOW()),
  (gen_random_uuid(), 'lonely', 'Solitario', '🏝️', 'social_load', 18, NOW(), NOW()),
  (gen_random_uuid(), 'lost_disoriented', 'Perdido / Desorientado', '🌀', 'disorientation', 19, NOW(), NOW()),
  (gen_random_uuid(), 'frustrated', 'Frustrado', '😩', 'disorientation', 20, NOW(), NOW()),
  (gen_random_uuid(), 'indifferent', 'Indiferente', '😑', 'disorientation', 21, NOW(), NOW()),
  (gen_random_uuid(), 'euphoric', 'Eufórico', '🎉', 'high_intensity', 22, NOW(), NOW()),
  (gen_random_uuid(), 'terrified_panicky', 'Aterrado / Pánico', '😱', 'high_intensity', 23, NOW(), NOW()),
  (gen_random_uuid(), 'hostile', 'Hostil', '😠', 'high_intensity', 24, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
