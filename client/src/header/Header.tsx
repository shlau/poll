import { Button } from "@mui/material";
import "./Header.less";
import { useLocation, useNavigate } from "react-router";

interface HeaderProps {
  token: string;
  setToken: Function;
  setUserId: Function;
}

function Header({ token, setToken, setUserId }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.includes("login")) {
    return <></>;
  }

  return (
    <div className="header-container">
      <Button
        variant="contained"
        onClick={() => {
          navigate(`/`);
        }}
      >
        Home
      </Button>
      {token && (
        <Button
          variant="contained"
          onClick={() => {
            navigate(`/polls`);
          }}
        >
          My polls
        </Button>
      )}
      {token ? (
        <Button
          variant="contained"
          onClick={() => {
            localStorage.removeItem(`poll-user-token`);
            setToken("");
            setUserId("");
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
