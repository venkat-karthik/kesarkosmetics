// Renamed to useFirebaseUser but kept as useSupabaseUser for backward compatibility
import { useAuth } from "../contexts/AuthContext";

export default function useSupabaseUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}
