import { User, UserRole } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  {
    id: uuidv4(),
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    avatar: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    id: uuidv4(),
    name: 'Data Steward',
    email: 'steward@example.com',
    role: UserRole.DATA_STEWARD,
    avatar: 'https://i.pravatar.cc/150?u=steward',
  },
  {
    id: uuidv4(),
    name: 'Dynpro Team Member',
    email: 'dynpro@example.com',
    role: UserRole.DYNPRO_TEAM_MEMBER,
    avatar: 'https://i.pravatar.cc/150?u=dynpro',
  },
  {
    id: uuidv4(),
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: UserRole.VIEWER,
    avatar: 'https://i.pravatar.cc/150?u=viewer',
  },
  {
    id: uuidv4(),
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: UserRole.DATA_STEWARD,
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    id: uuidv4(),
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: UserRole.DYNPRO_TEAM_MEMBER,
    avatar: 'https://i.pravatar.cc/150?u=michael',
  },
  {
    id: uuidv4(),
    name: 'Jessica Williams',
    email: 'jessica@example.com',
    role: UserRole.DATA_STEWARD,
    avatar: 'https://i.pravatar.cc/150?u=jessica',
  },
];
