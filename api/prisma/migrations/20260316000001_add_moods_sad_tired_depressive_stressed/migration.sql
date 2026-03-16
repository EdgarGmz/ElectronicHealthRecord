-- Triste, Cansado, Depresivo, Estresado (muy comunes)
INSERT INTO "moods" (id, code, name, emoji, category, display_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'sad', 'Triste', '😢', 'very_common', 5, NOW(), NOW()),
  (gen_random_uuid(), 'tired', 'Cansado', '😴', 'very_common', 6, NOW(), NOW()),
  (gen_random_uuid(), 'depressive', 'Depresivo', '🫠', 'very_common', 7, NOW(), NOW()),
  (gen_random_uuid(), 'stressed', 'Estresado', '😓', 'very_common', 8, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Renumber display_order for moods after the new ones (common 9–11, less_common 12–15, rare 16–18, etc.)
UPDATE "moods" SET display_order = 9  WHERE code = 'melancholic_nostalgic';
UPDATE "moods" SET display_order = 10 WHERE code = 'insecure_hesitant';
UPDATE "moods" SET display_order = 11 WHERE code = 'ambivalent';
UPDATE "moods" SET display_order = 12 WHERE code = 'euthymic';
UPDATE "moods" SET display_order = 13 WHERE code = 'anhedonic';
UPDATE "moods" SET display_order = 14 WHERE code = 'expansive_hypomanic';
UPDATE "moods" SET display_order = 15 WHERE code = 'dissociative';
UPDATE "moods" SET display_order = 16 WHERE code = 'alexithymic';
UPDATE "moods" SET display_order = 17 WHERE code = 'abulic';
UPDATE "moods" SET display_order = 18 WHERE code = 'ecstatic';
UPDATE "moods" SET display_order = 19 WHERE code = 'guilty';
UPDATE "moods" SET display_order = 20 WHERE code = 'ashamed';
UPDATE "moods" SET display_order = 21 WHERE code = 'resentful';
UPDATE "moods" SET display_order = 22 WHERE code = 'lonely';
UPDATE "moods" SET display_order = 23 WHERE code = 'lost_disoriented';
UPDATE "moods" SET display_order = 24 WHERE code = 'frustrated';
UPDATE "moods" SET display_order = 25 WHERE code = 'indifferent';
UPDATE "moods" SET display_order = 26 WHERE code = 'euphoric';
UPDATE "moods" SET display_order = 27 WHERE code = 'terrified_panicky';
UPDATE "moods" SET display_order = 28 WHERE code = 'hostile';
