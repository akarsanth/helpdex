import mongoose from "mongoose";
import Status from "./models/status-model";
import Category from "./models/category-model";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

// Connect to your MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(async () => {
    console.log("MongoDB connected");

    // Seed statuses
    await Status.deleteMany({});
    await Status.insertMany([
      { name: "Open", description: "Ticket is newly created" },
      { name: "Acknowledged", description: "Acknowledged by a team member" },
      { name: "Assigned", description: "Assigned to a developer" },
      { name: "In Progress", description: "Work is being done" },
      { name: "Pending QA", description: "Awaiting QA verification" },
      { name: "Resolved", description: "Developer resolved the issue" },
      { name: "Closed", description: "Issue confirmed and closed" },
      { name: "Reopened", description: "Reopened after being closed" },
    ]);

    // Seed categories
    await Category.deleteMany({});
    await Category.insertMany([
      { name: "Bug", description: "A defect or unexpected issue" },
      { name: "Feature Request", description: "New functionality" },
      { name: "Support", description: "General assistance" },
      { name: "Improvement", description: "Enhancement to existing feature" },
    ]);

    console.log("Seeding complete");
    process.exit();
  })
  .catch((err) => {
    console.error("Error connecting to DB", err);
    process.exit(1);
  });
