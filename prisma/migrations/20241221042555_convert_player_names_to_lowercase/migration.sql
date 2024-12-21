-- First, create a temporary table to store the most recent entries for each player (case-insensitive)
CREATE TEMPORARY TABLE temp_player_cache AS
SELECT DISTINCT ON (LOWER("playerName"))
  id,
  "playerName",
  "guildName",
  "killFame",
  "deathFame",
  "pveTotal",
  "updatedAt",
  "hasDeepSearch"
FROM "PlayerCache"
ORDER BY LOWER("playerName"), "updatedAt" DESC;

-- Delete all entries from PlayerCache
DELETE FROM "PlayerCache";

-- Reinsert the data from the temporary table with lowercase player names
INSERT INTO "PlayerCache" (id, "playerName", "guildName", "killFame", "deathFame", "pveTotal", "updatedAt", "hasDeepSearch")
SELECT 
  id,
  LOWER("playerName"),
  "guildName",
  "killFame",
  "deathFame",
  "pveTotal",
  "updatedAt",
  "hasDeepSearch"
FROM temp_player_cache;

-- Drop the temporary table
DROP TABLE temp_player_cache;

-- Do the same for GuildHistory
CREATE TEMPORARY TABLE temp_guild_history AS
SELECT DISTINCT ON (LOWER("playerName"), "guildName", "eventDate")
  id,
  "playerName",
  "guildName",
  "eventDate"
FROM "GuildHistory"
ORDER BY LOWER("playerName"), "guildName", "eventDate";

-- Delete all entries from GuildHistory
DELETE FROM "GuildHistory";

-- Reinsert the data from the temporary table with lowercase player names
INSERT INTO "GuildHistory" (id, "playerName", "guildName", "eventDate")
SELECT 
  id,
  LOWER("playerName"),
  "guildName",
  "eventDate"
FROM temp_guild_history;

-- Drop the temporary table
DROP TABLE temp_guild_history;

-- Drop and recreate the unique index to ensure case-insensitive uniqueness
DROP INDEX IF EXISTS "PlayerCache_playerName_key";
CREATE UNIQUE INDEX "PlayerCache_playerName_key" ON "PlayerCache"("playerName");

-- Drop and recreate the index to ensure case-insensitive searching
DROP INDEX IF EXISTS "PlayerCache_playerName_idx";
CREATE INDEX "PlayerCache_playerName_idx" ON "PlayerCache"("playerName"); 