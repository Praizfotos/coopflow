import { pool } from "./connection";

const seedData = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO organizations (id, name, description, owner_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
      ["org-seed-001", "Demo Cooperative Organization", "A demo organization for CoopFlow", "seed-owner-001"]
    );

    await client.query(
      "INSERT INTO cooperatives (id, organization_id, name, description, settings) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
      ["coop-seed-001", "org-seed-001", "Demo Savings Cooperative", "A demo cooperative for testing CoopFlow", '{"max_members": 100, "require_approval": true}']
    );

    await client.query(
      "INSERT INTO members (id, cooperative_id, organization_id, user_id, name, email, wallet_address, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING",
      ["member-seed-001", "coop-seed-001", "org-seed-001", "seed-user-001", "Admin User", "admin@coopflow.io", "GAAZI4T6S6Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q4Q", "Administrator", "Active"]
    );

    await client.query(
      "INSERT INTO treasuries (cooperative_id, asset, balance) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
      ["coop-seed-001", "XLM", "1000000"]
    );

    await client.query("COMMIT");
    console.log("Database seeded successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    client.release();
  }
};

seedData().then(() => {
  pool.end();
  process.exit(0);
});