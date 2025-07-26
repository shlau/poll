import { Button } from "@mui/material";
import "./Header.less";
import { useLocation, useNavigate } from "react-router";

interface HeaderProps {
  token: string;
  setToken: Function
}

function Header({ token, setToken }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.includes("login")) {
    return <></>
  }

  return (
    <div className="header-container">
      {token ? (
        <Button
          variant="contained"
          onClick={() => {
            setToken("")
          }}
        >
          Logout
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={() => {
            navigate(`/login`);
          }}
        >
          Login
        </Button>
      )}
    </div>
  );
}

export default Header;
