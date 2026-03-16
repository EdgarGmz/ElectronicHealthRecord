-- Add category as nullable, widen code/name
ALTER TABLE "moods" ADD COLUMN "category" VARCHAR(30);
ALTER TABLE "moods" ALTER COLUMN "code" SET DATA TYPE VARCHAR(50);
ALTER TABLE "moods" ALTER COLUMN "name" SET DATA TYPE VARCHAR(150);

-- Backfill existing rows then make category required
UPDATE "moods" SET "category" = 'very_common' WHERE "category" IS NULL;
ALTER TABLE "moods" ALTER COLUMN "category" SET NOT NULL;

-- Replace with clinical classification (14 estados de ánimo)
DELETE FROM "moods";

INSERT INTO "moods" (id, code, name, emoji, category, display_order, created_at, updated_at) VALUES
  (gen_random_uuid(), 'anxious_apprehensive', 'Ansioso / Aprehensivo', '😰', 'very_common', 1, NOW(), NOW()),
  (gen_random_uuid(), 'down_dysthymic', 'Decaído / Distímico', '😔', 'very_common', 2, NOW(), NOW()),
  (gen_random_uuid(), 'stressed_overwhelmed', 'Estresado / Abrumado', '😫', 'very_common', 3, NOW(), NOW()),
  (gen_random_uuid(), 'irritable', 'Irritable', '😤', 'very_common', 4, NOW(), NOW()),
  (gen_random_uuid(), 'melancholic_nostalgic', 'Melancólico / Nostálgico', '🥹', 'common', 5, NOW(), NOW()),
  (gen_random_uuid(), 'insecure_hesitant', 'Inseguro / Dubitativo', '😕', 'common', 6, NOW(), NOW()),
  (gen_random_uuid(), 'ambivalent', 'Ambivalente', '⚖️', 'common', 7, NOW(), NOW()),
  (gen_random_uuid(), 'euthymic', 'Eutímico', '🙂', 'less_common', 8, NOW(), NOW()),
  (gen_random_uuid(), 'anhedonic', 'Anhedónico', '🫥', 'less_common', 9, NOW(), NOW()),
  (gen_random_uuid(), 'expansive_hypomanic', 'Expansivo / Hipomaníaco', '😄', 'less_common', 10, NOW(), NOW()),
  (gen_random_uuid(), 'dissociative', 'Disociativo', '🌫️', 'less_common', 11, NOW(), NOW()),
  (gen_random_uuid(), 'alexithymic', 'Alexitímico', '😐', 'rare', 12, NOW(), NOW()),
  (gen_random_uuid(), 'abulic', 'Abúlico', '😴', 'rare', 13, NOW(), NOW()),
  (gen_random_uuid(), 'ecstatic', 'Extático', '🤩', 'rare', 14, NOW(), NOW());
