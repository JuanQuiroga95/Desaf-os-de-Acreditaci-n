import "dotenv/config";
import { db } from "../src/lib/db";

async function main() {
  const users = await db.user.findMany();
  console.log("Users:", JSON.stringify(users, null, 2));

  const subjects = await db.subject.findMany({
    include: { challenges: true }
  });
  console.log("Subjects and Challenges:", JSON.stringify(subjects, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
