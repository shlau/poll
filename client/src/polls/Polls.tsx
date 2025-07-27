import { useEffect, useState } from "react";
import "./Polls.less";
import { useNavigate } from "react-router";

interface PollsProps {
  token: string;
}

function Polls({ token }: PollsProps) {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

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

  const goToPoll = (pollId: number) => {
    console.log(pollId)
    navigate(`/polls/${pollId}`);
  };

  return (
    <div>
      {polls.map((poll: any) => {
        return (
          <div onClick={() => goToPoll(poll.id)} key={poll.id}>
            {poll.name}
          </div>
        );
      })}
    </div>
  );
}
export default Polls;
