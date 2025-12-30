import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Available roles: Admin, Manager, Team Lead, Developer, Viewer

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n📋 Current users and their roles:');
  console.log('=====================================');

  const users = db.prepare('SELECT id, name, email, role FROM users').all();
  users.forEach(user => {
    console.log(`ID: ${user.id} | ${user.name} (${user.email}) - Role: ${user.role}`);
  });

  console.log('\n💡 To change a user\'s role, run:');
  console.log('   node change-role.js <user_id> <new_role>');
  console.log('\n   Available roles: Admin, Manager, "Team Lead", Developer, Viewer');
  console.log('   Example: node change-role.js 1 Admin');
  console.log('   Example: node change-role.js 2 "Team Lead"\n');
} else if (args.length === 2) {
  const userId = args[0];
  const newRole = args[1];

  const validRoles = ['Admin', 'Manager', 'Team Lead', 'Developer', 'Viewer'];

  if (!validRoles.includes(newRole)) {
    console.error(`\n❌ Invalid role: ${newRole}`);
    console.log('   Valid roles are: Admin, Manager, "Team Lead", Developer, Viewer\n');
    process.exit(1);
  }

  // Check if user exists
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(userId);

  if (!user) {
    console.error(`\n❌ User with ID ${userId} not found\n`);
    process.exit(1);
  }

  console.log(`\n🔄 Changing role for user:`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Current Role: ${user.role}`);
  console.log(`   New Role: ${newRole}`);

  // Update role
  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newRole, userId);

  console.log('\n✅ Role updated successfully!');
  console.log('   Please log out and log back in to see the changes.\n');
} else {
  console.error('\n❌ Invalid arguments');
  console.log('   Usage: node change-role.js <user_id> <new_role>');
  console.log('   Or run without arguments to see all users\n');
  process.exit(1);
}

db.close();
