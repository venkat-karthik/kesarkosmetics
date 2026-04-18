import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNavigate as useNav } from "react-router-dom";
import { toast } from "sonner";

// Register is now just the login page — Google handles both
const RegisterPage = () => {
  const navigate = useNavigate();
  React.useEffect(() => { navigate("/login", { replace: true }); }, []);
  return null;
};

export default RegisterPage;
