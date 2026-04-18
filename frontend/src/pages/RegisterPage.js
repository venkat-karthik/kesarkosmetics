import React from "react";
import { useNavigate } from "react-router-dom";

// Register redirects to login — Google handles both sign-up and sign-in
const RegisterPage = () => {
  const navigate = useNavigate();
  React.useEffect(() => { navigate("/login", { replace: true }); }, [navigate]);
  return null;
};

export default RegisterPage;
