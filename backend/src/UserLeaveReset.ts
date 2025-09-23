// UserLeaveReset.ts
import mongoose from "mongoose";
import User from "./models/User";
import RoleLeave from "./models/RoleLeave";

async function resetUserLeaves() {
  try {
    await mongoose.connect(
      "mongodb+srv://rockyeswar78_db_user:v2HDBj1p47KvU5rJ@cluster0.ijzroxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    const users = await User.find({});
    for (const user of users) {
      const roleData = await RoleLeave.findOne({ role: user.role });
      if (!roleData) continue;

      user.leaveBalance = {
        Normal: roleData.leaveBalance.Normal,
        Sick: roleData.leaveBalance.Sick,
        Emergency: roleData.leaveBalance.Emergency,
      };
      await user.save();
    }

    console.log("✅ All user leave balances reset to role defaults");
  } catch (err) {
    console.error("❌ Error resetting user leaves:", err);
  } finally {
    await mongoose.disconnect();
  }
}

resetUserLeaves();
