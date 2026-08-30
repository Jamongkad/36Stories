-- Preserve existing contact attribution after introducing the nullable fullName field.
UPDATE "Contact"
SET "fullName" = NULLIF(
  BTRIM(CONCAT_WS(' ', "firstName", "lastName")),
  ''
)
WHERE "fullName" IS NULL
  AND ("firstName" IS NOT NULL OR "lastName" IS NOT NULL);
