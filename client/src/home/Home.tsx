import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";

function Home() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const createPoll = async () => {
    const response = await fetch("/api/polls", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const pollData = await response.json();
    return pollData;
  };

  const mutation = useMutation({
    mutationFn: createPoll,
    onSuccess: (data) => {
      navigate(`/polls/${data.id}`);
    },
  });

  return (
    <div>
      <TextField
        id="outlined-basic"
        label="Outlined"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button
        variant="contained"
        disabled={!name}
        onClick={() => {
          mutation.mutate();
        }}
      >
        Create new poll
      </Button>
    </div>
  );
}

export default Home;
