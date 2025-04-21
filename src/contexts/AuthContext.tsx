import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery } from "@connectrpc/connect-query";
import { getUser, getAdmin } from "shopnexus-protobuf-gen-ts";
import {
  GetAdminResponse,
  GetUserResponse,
} from "shopnexus-protobuf-gen-ts/pb/account/v1/account_pb";

interface AuthContextType {
  user: GetUserResponse | undefined;
  admin: GetAdminResponse | undefined;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  admin: undefined,
  isAdmin: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    data: user,
    isError: isUserError,
    isLoading: isUserLoading,
  } = useQuery(getUser);
  const { data: admin, isLoading: isAdminLoading } = useQuery(
    getAdmin,
    {},
    {
      enabled: isUserError,
    }
  );

  useEffect(() => {
    if (user) {
      setIsAdmin(false);
    }
    if (admin) {
      setIsAdmin(true);
    }
    setLoading(isUserLoading || isAdminLoading);
  }, [user, admin, isUserLoading, isAdminLoading]);

  const contextValue = useMemo(
    () => ({ user, admin, isAdmin, loading }),
    [user, admin, isAdmin, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
