-- Estados positivos (buenos estados de ánimo)
INSERT INTO "moods" (id, code, name, emoji, category, display_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'calm', 'Calmado', '😌', 'positive', 9, NOW(), NOW()),
  (gen_random_uuid(), 'happy', 'Feliz', '😊', 'positive', 10, NOW(), NOW()),
  (gen_random_uuid(), 'hopeful', 'Esperanzado', '🌟', 'positive', 11, NOW(), NOW()),
  (gen_random_uuid(), 'content', 'Contento', '🙂', 'positive', 12, NOW(), NOW()),
  (gen_random_uuid(), 'motivated', 'Motivado', '💪', 'positive', 13, NOW(), NOW()),
  (gen_random_uuid(), 'at_ease', 'Tranquilo', '🧘', 'positive', 14, NOW(), NOW()),
  (gen_random_uuid(), 'optimistic', 'Optimista', '☀️', 'positive', 15, NOW(), NOW()),
  (gen_random_uuid(), 'relieved', 'Aliviado', '😮‍💨', 'positive', 16, NOW(), NOW()),
  (gen_random_uuid(), 'serene', 'Sereno', '🌿', 'positive', 17, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Renumerar categorías posteriores (common 18–20, less_common 21–24, rare 25–27, social_load 28–31, disorientation 32–34, high_intensity 35–37)
UPDATE "moods" SET display_order = 18 WHERE code = 'melancholic_nostalgic';
UPDATE "moods" SET display_order = 19 WHERE code = 'insecure_hesitant';
UPDATE "moods" SET display_order = 20 WHERE code = 'ambivalent';
UPDATE "moods" SET display_order = 21 WHERE code = 'euthymic';
UPDATE "moods" SET display_order = 22 WHERE code = 'anhedonic';
UPDATE "moods" SET display_order = 23 WHERE code = 'expansive_hypomanic';
UPDATE "moods" SET display_order = 24 WHERE code = 'dissociative';
UPDATE "moods" SET display_order = 25 WHERE code = 'alexithymic';
UPDATE "moods" SET display_order = 26 WHERE code = 'abulic';
UPDATE "moods" SET display_order = 27 WHERE code = 'ecstatic';
UPDATE "moods" SET display_order = 28 WHERE code = 'guilty';
UPDATE "moods" SET display_order = 29 WHERE code = 'ashamed';
UPDATE "moods" SET display_order = 30 WHERE code = 'resentful';
UPDATE "moods" SET display_order = 31 WHERE code = 'lonely';
UPDATE "moods" SET display_order = 32 WHERE code = 'lost_disoriented';
UPDATE "moods" SET display_order = 33 WHERE code = 'frustrated';
UPDATE "moods" SET display_order = 34 WHERE code = 'indifferent';
UPDATE "moods" SET display_order = 35 WHERE code = 'euphoric';
UPDATE "moods" SET display_order = 36 WHERE code = 'terrified_panicky';
UPDATE "moods" SET display_order = 37 WHERE code = 'hostile';
