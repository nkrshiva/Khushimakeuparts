import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { identityResolutionService } from '../services/identity/IdentityResolutionService';
import type { TenantRole } from '../domain/tenant/types';
import type { ResolvedIdentity, ResolvedDestination } from '../domain/identity/types';

export interface TenantContextType {
  assignedClientId: string | null;
  role: TenantRole;
  isDeveloper: boolean;
  identity: ResolvedIdentity;
  destination: ResolvedDestination;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const LOCAL_ROLE_KEY = 'platform_admin_role';
const LOCAL_CLIENT_ID_KEY = 'platform_admin_assigned_tenant';
const LEGACY_ROLE_KEY = 'khushi_admin_role';
const LEGACY_CLIENT_ID_KEY = 'khushi_admin_client_id';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [assignedClientId, setAssignedClientId] = useState<string | null>(null);
  const [role, setRole] = useState<TenantRole>(null);
  const [identity, setIdentity] = useState<ResolvedIdentity>({ type: 'UNAUTHENTICATED' });
  const [destination, setDestination] = useState<ResolvedDestination>('AUTHENTICATION_REQUIRED');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolveTenantForUser = async (uid: string, email: string | null | undefined, emailVerified?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const resolutionResult = await identityResolutionService.resolve({
        uid,
        email,
        emailVerified,
      });

      const resolvedIdentity = resolutionResult.identity;
      const resolvedDest = resolutionResult.destination;

      setIdentity(resolvedIdentity);
      setDestination(resolvedDest);

      let mappedRole: TenantRole = null;
      let mappedClientId: string | null = null;

      switch (resolvedIdentity.type) {
        case 'MASTER_PLATFORM_ADMIN':
          mappedRole = 'developer';
          mappedClientId = null;
          break;
        case 'TENANT_OWNER':
          mappedRole = 'client';
          mappedClientId = resolvedIdentity.tenantId;
          break;
        case 'TENANT_EMPLOYEE':
          mappedRole = 'employee';
          mappedClientId = resolvedIdentity.tenantId;
          break;
        case 'NO_WORKSPACE':
        case 'UNAUTHENTICATED':
        default:
          mappedRole = null;
          mappedClientId = null;
          break;
      }

      setAssignedClientId(mappedClientId);
      setRole(mappedRole);

      try {
        if (mappedRole) localStorage.setItem(LOCAL_ROLE_KEY, mappedRole);
        if (mappedClientId) {
          localStorage.setItem(LOCAL_CLIENT_ID_KEY, mappedClientId);
        } else {
          localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
        }
      } catch {}

      setLoading(false);
      return { role: mappedRole, assignedClientId: mappedClientId, identity: resolvedIdentity, destination: resolvedDest };
    } catch (err: any) {
      const msg = err?.message || 'Failed to resolve tenant assignment';
      setError(msg);
      setLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      // Authoritative reset: unauthenticated session has zero role, identity or tenant assignment
      setAssignedClientId(null);
      setRole(null);
      setIdentity({ type: 'UNAUTHENTICATED' });
      setDestination('AUTHENTICATION_REQUIRED');
      try {
        localStorage.removeItem(LOCAL_ROLE_KEY);
        localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
        localStorage.removeItem(LEGACY_ROLE_KEY);
        localStorage.removeItem(LEGACY_CLIENT_ID_KEY);
      } catch {}
      setLoading(false);
      return;
    }

    resolveTenantForUser(user.uid, user.email, user.emailVerified).catch((err) => {
      if (isMounted) {
        console.warn('[TenantContext] User identity resolution warning:', err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshTenant = async () => {
    if (user) {
      await resolveTenantForUser(user.uid, user.email, user.emailVerified);
    }
  };

  const isDeveloper = role === 'developer';

  return (
    <TenantContext.Provider
      value={{
        assignedClientId,
        role,
        isDeveloper,
        identity,
        destination,
        loading,
        error,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
