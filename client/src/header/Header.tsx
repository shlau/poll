import { Button } from "@mui/material";
import "./Header.less";
import { useLocation, useNavigate } from "react-router";

interface HeaderProps {
  token: string;
}

function Header({ token }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.includes("login")) {
    return <></>
  }

  return (
    <div className="header-container">
      {token ? (
        <div>{token}</div>
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
