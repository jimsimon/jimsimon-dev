import { getDatabase, initializeDatabase } from '../database/connection.js';
import { users } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  console.log('Initializing database...');
  await initializeDatabase();
  
  const db = getDatabase();
  
  const adminEmail = 'jim.j.simon@gmail.com';
  const adminPassword = 'admin123'; // You should change this!
  const adminName = 'Jim Simon';
  
  console.log('Checking if admin user already exists...');
  
  // Check if admin user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);
  
  if (existingUser) {
    console.log('Admin user already exists. Updating password...');
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await db
      .update(users)
      .set({
        password: hashedPassword,
        role: 'admin'
      })
      .where(eq(users.email, adminEmail));
    
    console.log('✅ Admin user password updated successfully!');
  } else {
    console.log('Creating new admin user...');
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await db
      .insert(users)
      .values({
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'admin'
      });
    
    console.log('✅ Admin user created successfully!');
  }
  
  console.log('');
  console.log('Admin Login Credentials:');
  console.log('------------------------');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Please change the password after your first login!');
  
  process.exit(0);
}

createAdminUser().catch((error) => {
  console.error('Error creating admin user:', error);
  process.exit(1);
});