const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

const validRoles = ['admin', 'manager', 'team lead', 'developer', 'viewer'];

const changeUserRole = (email, newRole) => {
  if (!email || !newRole) {
    console.error('❌ Usage: node change-role.js <email> <role>');
    console.log('Available roles:', validRoles.join(', '));
    process.exit(1);
  }

  const roleLower = newRole.toLowerCase();
  if (!validRoles.includes(roleLower)) {
    console.error(`❌ Invalid role: ${newRole}`);
    console.log('Available roles:', validRoles.join(', '));
    process.exit(1);
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?')
      .run(roleLower, email);

    console.log(`✅ Successfully updated user role:`);
    console.log(`   Email: ${email}`);
    console.log(`   Old Role: ${user.role}`);
    console.log(`   New Role: ${roleLower}`);
  } catch (error) {
    console.error('❌ Error updating role:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
};

const email = process.argv[2];
const role = process.argv[3];

changeUserRole(email, role);
