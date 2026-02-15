import { Navigate } from "react-router-dom";

const GuestWrapper = ({ user, children }) => {
  // Agar logged in hai → login/register block
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestWrapper;
