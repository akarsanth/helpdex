import connectDB from "./config/mongodb";
import Status from "./models/status-model";
import Category from "./models/category-model";

const seed = async () => {
  try {
    await connectDB();

    // Seed Status collection
    await Status.deleteMany();
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

    // Seed Category collection
    await Category.deleteMany();
    await Category.insertMany([
      { name: "Bug", description: "A defect or unexpected issue" },
      { name: "Feature Request", description: "New functionality" },
      { name: "Support", description: "General assistance" },
      { name: "Improvement", description: "Enhancement to existing feature" },
    ]);

    console.log("✅ Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
