const { createClient } = require("@supabase/supabase-js");
const { env } = require("./env");

// Uses the service_role key, which bypasses Row Level Security. That's fine
// here because Express — not the browser — is the only thing that talks to
// Supabase; requireAuth middleware (see ../middleware/auth.middleware.js)
// is still what enforces who can do what. Same trust boundary the app had
// with Prisma, just a different client library reaching the same Postgres
// database. Never send this key to the frontend.
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

module.exports = { supabase };
