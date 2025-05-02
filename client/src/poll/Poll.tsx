import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface Question {
  id: string;
  value: string;
  votes: number;
}
interface PollData {
  id: string;
  name: string;
  questions: Question[];
}
function Poll() {
  let params = useParams();
  const [pollName, setPollName] = useState("");
  const [questions, setQuestions] = useState([] as Question[]);

  const toggleVote = async (checked: boolean, questionId: string) => {
    console.log(`check value: ${checked}, questionId: ${questionId}`);
    const response = await fetch(`/api/questions/${questionId}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    });
    const data = await response.json();
    setQuestions(
      questions.map((question) => {
        if (question.id === data.id) {
          return { ...data };
        }
        return question;
      })
    );
  };

  const getPollData = async (): Promise<PollData> => {
    const response = await fetch(`/api/polls/${params.pollId}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    getPollData()
      .then((data) => {
        setPollName(data.name);
        setQuestions(data.questions);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <h1>{pollName}</h1>
      <ul>
        {questions.map((question) => {
          return (
            <li key={question.id}>
              <div>{question.value}</div>
              <div>{question.votes}</div>
              <Checkbox
                onChange={(e) => toggleVote(e.target.checked, question.id)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default Poll;
