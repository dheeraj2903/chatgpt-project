import { Outlet, Navigate } from "react-router-dom";

const ProtectedWrapper = ({ user }) => {

  if (user === null) {
    return (
      <div className="page-loader">
        Checking session...
      </div>
    );
  }

  if (!user) {
  return <HomeGuestView />;
}


  return <Outlet context={{ user }} />;
};


export default ProtectedWrapper;
