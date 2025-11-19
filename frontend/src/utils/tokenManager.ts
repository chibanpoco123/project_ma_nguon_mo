
export const tokenManager = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: Record<string, unknown>) => {
    localStorage.setItem("user", JSON.stringify(user));
  },
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("accessToken");
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (payload.exp as number) * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

export default tokenManager;
