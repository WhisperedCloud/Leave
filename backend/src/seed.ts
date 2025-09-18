/**
 * Run: npm run seed
 * Seeds initial users with known passwords (hashed).
 */
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db";
import User from "./models/User";
import bcrypt from "bcryptjs";

const seed = async () => {
  await connectDB();

  const users = [
    { name: "Admin User", email: "admin@example.com", password: "AdminPass1!", role: "Admin" },
    { name: "HR User", email: "hr@example.com", password: "HrPass1!", role: "HR" },
    { name: "Manager User", email: "manager@example.com", password: "ManagerPass1!", role: "Manager" },
    { name: "Employee User", email: "employee@example.com", password: "EmployeePass1!", role: "Employee" },
    { name: "Intern User", email: "intern@example.com", password: "InternPass1!", role: "Intern" }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log("Skipping existing:", u.email);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, password: hashed, role: u.role as any });
    console.log("Created", u.email);
  }
  console.log("✅ Seeding complete");
  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
