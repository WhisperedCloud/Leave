import mongoose from "mongoose";
import RoleLeave from "./models/RoleLeave";

const roles = [
  { role: "Admin", leaveBalance: { Normal: 0, Sick: 0, Emergency: 0 } },
  { role: "HR", leaveBalance: { Normal: 10, Sick: 8, Emergency: 5 } },
  { role: "Manager", leaveBalance: { Normal: 12, Sick: 6, Emergency: 4 } },
  { role: "Employee", leaveBalance: { Normal: 12, Sick: 6, Emergency: 3 } },
  { role: "Intern", leaveBalance: { Normal: 6, Sick: 3, Emergency: 2 } },
];

async function seed() {
  try {
    await mongoose.connect(
      "mongodb+srv://rockyeswar78_db_user:v2HDBj1p47KvU5rJ@cluster0.ijzroxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    for (const r of roles) {
      await RoleLeave.updateOne({ role: r.role }, { $set: r }, { upsert: true });
    }

    console.log("✅ RoleLeave seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding RoleLeave:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
