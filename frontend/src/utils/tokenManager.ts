// ✅ Token Manager Utility
export const tokenManager = {
  // Lưu tokens
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  // Lấy access token
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  // Lấy refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  // Lấy user info
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Lưu user info
  setUser: (user: Record<string, unknown>) => {
    localStorage.setItem("user", JSON.stringify(user));
  },

  // Clear all tokens
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem("accessToken");
  },

  // Check token expiry (basic check)
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
