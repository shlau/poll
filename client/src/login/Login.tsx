import { useState } from "react";
import "./Login.less";
import { TextField, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";

type action = "login" | "register";
function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const isValidInput = name && password;

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
      return userData;
    };
  };

  const registerMutation = useMutation({
    mutationFn: fetchUser("register"),
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const loginMutation = useMutation({
    mutationFn: fetchUser("login"),
    onSuccess: (data) => {
      console.log(data);
    },
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
          console.log("Register");
          registerMutation.mutate()
        }}
      >
        Register
      </Button>
      <Button
        variant="contained"
        disabled={!isValidInput}
        onClick={() => {
          console.log("Login");
          loginMutation.mutate()
        }}
      >
        Login
      </Button>
    </div>
  );
}
export default Login;
