const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportAllCollections() {
  const result = {};

  // List all root-level collections
  const collections = await db.listCollections();

  for (const colRef of collections) {
    const colName = colRef.id;
    result[colName] = [];

    const snapshot = await colRef.get();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Recursively fetch subcollections
      const subcollections = await doc.ref.listCollections();
      const subcollectionData = {};

      for (const subColRef of subcollections) {
        const subSnap = await subColRef.get();
        subcollectionData[subColRef.id] = subSnap.docs.map((d) => ({
          _id: d.id,
          ...d.data(),
        }));
      }

      result[colName].push({
        _id: doc.id,
        ...data,
        ...(Object.keys(subcollectionData).length > 0 ? { _subcollections: subcollectionData } : {}),
      });
    }

    console.log(`✓ ${colName}: ${snapshot.size} documents`);
  }

  return result;
}

function toMarkdown(data) {
  let md = "# Firebase Firestore — Full Database Export\n\n";
  md += `> Generated: ${new Date().toISOString()}\n\n`;
  md += "---\n\n";

  for (const [collection, docs] of Object.entries(data)) {
    md += `## Collection: \`${collection}\`\n\n`;
    md += `**${docs.length} document(s)**\n\n`;
    md += "```json\n";
    md += JSON.stringify(docs, null, 2);
    md += "\n```\n\n";
    md += "---\n\n";
  }

  return md;
}

(async () => {
  try {
    console.log("Connecting to Firestore...");
    const data = await exportAllCollections();

    const totalDocs = Object.values(data).reduce((sum, docs) => sum + docs.length, 0);
    console.log(`\nTotal: ${Object.keys(data).length} collections, ${totalDocs} documents`);

    const md = toMarkdown(data);
    const outPath = path.join(__dirname, "database-export.md");
    fs.writeFileSync(outPath, md, "utf8");

    console.log(`\nExported to: database-export.md`);
  } catch (err) {
    console.error("Export failed:", err.message);
    process.exit(1);
  }
})();
