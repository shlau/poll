import { useEffect, useState } from "react";
import "./Polls.less";

interface PollsProps {
  token: string;
}

function Polls({ token }: PollsProps) {
  const [polls, setPolls] = useState([]);

  const getPolls = async () => {
    const response = await fetch(`/api/polls?token=${token}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    if (token) {
      getPolls().then((res) => {
        setPolls(res);
      });
    }
  }, [token]);

  return (
    <div>
      {polls.map((poll: any) => {
        return <div>{poll.name}</div>;
      })}
    </div>
  );
}
export default Polls;
