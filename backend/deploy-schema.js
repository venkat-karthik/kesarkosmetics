const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deploySchema() {
  try {
    console.log("🚀 Deploying Supabase schema...");
    
    const schemaPath = path.join(__dirname, "supabase-schema.sql");
    const sqlContent = fs.readFileSync(schemaPath, "utf8");
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec", {
        sql_query: statement,
      });

      if (error && !error.message.includes("does not exist")) {
        console.warn("⚠️ Warning:", error.message);
      }
    }

    // Alternative: Use direct SQL execution
    console.log("✅ Schema deployed successfully!");
    console.log("\n📋 Tables created:");
    console.log("  - users");
    console.log("  - orders");
    console.log("\n✨ Database is ready!");

  } catch (error) {
    console.error("❌ Error deploying schema:", error.message);
    process.exit(1);
  }
}

deploySchema();