import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";


export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token); // Decode JWT
    const currentTime = Date.now() / 1000; // Get current time in seconds
    return decoded.exp > currentTime; // Check if token is expired
  } catch (error) {
    return false; // Invalid token
  }
};

interface ProtectedRouteProps {
  element: JSX.Element;
}
const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const user = sessionStorage.getItem("user"); // Retrieve JWT token
  const token = user ? JSON.parse(user).token : null; // Parse
  return isTokenValid(token) ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
