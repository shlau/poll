import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const createPoll = async () => {
    const response = await fetch("/api/poll", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const pollData = await response.json();
    navigate(`/poll/${pollData.id}`);
  };
  return (
    <div>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="contained" disabled={!name} onClick={createPoll}>
        Create new poll
      </Button>
    </div>
  );
}

export default Home;
