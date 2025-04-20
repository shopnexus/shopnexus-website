import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery } from "@connectrpc/connect-query";
import { getUser, getAdmin } from "shopnexus-protobuf-gen-ts";
import { GetUserResponse } from "shopnexus-protobuf-gen-ts/pb/account/v1/account_pb";

interface AuthContextType {
  user: GetUserResponse | undefined;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isAdmin: false,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: user, isError: isUserError } = useQuery(getUser);
  const { data: admin } = useQuery(
    getAdmin,
    {},
    {
      enabled: isUserError,
    }
  );

  useEffect(() => {
    if (user) {
      setIsAdmin(false);
      setLoading(false);
    }
    if (admin) {
      setIsAdmin(true);
      setLoading(false);
    }
  }, [user, admin]);

  const contextValue = useMemo(
    () => ({ user, isAdmin, loading }),
    [user, isAdmin, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
