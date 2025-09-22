import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';

export async function createAdminUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  
  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({
    where: { username: 'admin' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return existingAdmin;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = userRepository.create({
    username: 'admin',
    email: 'admin@goldenhorse.com',
    password: hashedPassword,
    fullName: 'مدير النظام',
    role: UserRole.ADMIN,
    isActive: true,
  });

  await userRepository.save(adminUser);
  console.log('Admin user created successfully');
  console.log('Username: admin');
  console.log('Password: admin123');
  
  return adminUser;
}
