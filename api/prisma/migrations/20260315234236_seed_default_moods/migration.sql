-- Seed default moods (insert only if table is empty)
INSERT INTO "moods" (id, code, name, emoji, display_order, created_at, updated_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'calm', 'Calmado', '😌', 1, NOW(), NOW()),
  (gen_random_uuid(), 'anxious', 'Ansioso', '😰', 2, NOW(), NOW()),
  (gen_random_uuid(), 'depressed', 'Triste/Deprimido', '😔', 3, NOW(), NOW()),
  (gen_random_uuid(), 'angry', 'Enojado', '😠', 4, NOW(), NOW()),
  (gen_random_uuid(), 'happy', 'Feliz', '😊', 5, NOW(), NOW()),
  (gen_random_uuid(), 'neutral', 'Neutral', '😐', 6, NOW(), NOW()),
  (gen_random_uuid(), 'irritable', 'Irritable', '😤', 7, NOW(), NOW()),
  (gen_random_uuid(), 'hopeful', 'Esperanzado', '🌟', 8, NOW(), NOW()),
  (gen_random_uuid(), 'tired', 'Cansado', '😴', 9, NOW(), NOW())
) AS v(id, code, name, emoji, display_order, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM "moods" LIMIT 1);
