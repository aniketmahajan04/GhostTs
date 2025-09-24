import config from "./src/config/config.json";
import sqlQuery from "./database/queries.sql";
// import emailTemplate from "./templates/email-Template.html";
// import readme from "./docs/README.md";
import { formatDate, generateId } from "@/lib/utils"; // working

console.log("=== Loader Tests ===");
// Test JSON loader
console.log("1. JSON Config:", config);
console.log("   Port:", config.port);
console.log("   Database:", config.database.host);

//Test SQL loader
console.log("2. SQL Query:", sqlQuery.trim());

// Test HTML loader
// console.log("3. Email template length:", emailTemplate.length, "characters");
// console.log("   Contains 'Welcome':", emailTemplate.includes("Welcome"));

// Test Markdown loader
// console.log("4. README content:", readme.substring(0, 50) + "...");

// Test path mapping
console.log("5. Path mapping test:");
console.log("   Today's date:", formatDate(new Date()));
console.log("   Generated ID:", generateId());

console.log("=== All Loaders Working! ===");
