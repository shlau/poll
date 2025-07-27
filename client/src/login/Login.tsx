import { useState } from "react";
import "./Login.less";
import { TextField, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

type action = "login" | "register";
interface LoginProps {
  setToken: Function;
  setUserId: Function;
}

interface UserData {
  token: string;
  name: string;
  id: number;
}

function Login({ setToken, setUserId }: LoginProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const isValidInput = name && password;

  const navigate = useNavigate();

  const fetchUser = (actionType: action) => {
    let url = "/api";
    if (actionType === "login") {
      url = url + "/login";
    } else {
      url = url + "/users";
    }
    return async () => {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ name, password }),
      });
      const userData = await response.json();
      localStorage.setItem(`poll-user-token`, userData.token);
      localStorage.setItem(`poll-user-id`, userData.id);
      return userData;
    };
  };

  const onFetchUserSuccess = (data: UserData) => {
    setToken(data.token);
    setUserId(data.id)
    navigate("/");
  };

  const registerMutation = useMutation({
    mutationFn: fetchUser("register"),
    onSuccess: onFetchUserSuccess,
  });

  const loginMutation = useMutation({
    mutationFn: fetchUser("login"),
    onSuccess: onFetchUserSuccess,
  });

  return (
    <div className="login-container">
      <TextField
        id="outlined-basic"
        label="Username"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        id="outlined-basic"
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        disabled={!isValidInput}
        onClick={() => {
          registerMutation.mutate();
        }}
      >
        Register
      </Button>
      <Button
        variant="contained"
        disabled={!isValidInput}
        onClick={() => {
          loginMutation.mutate();
        }}
      >
        Login
      </Button>
    </div>
  );
}
export default Login;
