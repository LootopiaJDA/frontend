import { useAuth } from '../context/AuthContext';
import { User } from '../constants/types';

export type GuardStatus = 'loading' | 'unauthenticated' | 'ready';

export function useRoleGuard(): { status: GuardStatus; user: User | null } {
  const { user, loading } = useAuth();
  if (loading) return { status: 'loading', user: null };
  if (!user) return { status: 'unauthenticated', user: null };
  return { status: 'ready', user };
}
