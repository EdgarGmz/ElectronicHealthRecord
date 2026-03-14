-- Relación N:M Psicólogo-Carreras: permitir que una carrera esté asignada a varios psicólogos.
-- Se elimina la restricción UNIQUE en career_id para que la misma carrera pueda asignarse a más de un psicólogo.
DROP INDEX IF EXISTS "psychologist_careers_career_id_key";
