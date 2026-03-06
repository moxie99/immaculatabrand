import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function test() {
  console.log("MONGODB_URI:", process.env.MONGODB_URI);

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ connected to MongoDB");
  } catch (err) {
    console.error("❌ connection error:", err);
  }

  process.exit(0);
}

test();