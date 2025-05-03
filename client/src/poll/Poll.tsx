import { Checkbox } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface Question {
  id: number;
  value: string;
  votes: number;
  checked: boolean;
}
interface PollData {
  id: string;
  name: string;
  questions: Question[];
}
function Poll() {
  let params = useParams();
  const [questions, setQuestions] = useState([] as Question[]);
  const [pollName, setPollName] = useState("");

  const toggleVote = async (checked: boolean, questionId: number) => {
    console.log(`check value: ${checked}, questionId: ${questionId}`);
    const response = await fetch(`/api/questions/${questionId}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    });
    const data = await response.json();
    const selectedQuestions: number[] = [];
    const updatedQuestions = questions.map((question) => {
      let newQuestion = { ...question };
      if (question.id === data.id) {
        newQuestion = { ...data, checked };
      }
      if (newQuestion.checked) {
        selectedQuestions.push(question.id);
      }
      return newQuestion;
    });
    if (params.pollId) {
      localStorage.setItem(params.pollId, JSON.stringify(selectedQuestions));
    }
    setQuestions(updatedQuestions);
  };

  const getPollData = async (): Promise<PollData> => {
    const response = await fetch(`/api/polls/${params.pollId}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };
  // const pollQuery = useQuery({ queryKey: ["poll"], queryFn: getPollData });

  useEffect(() => {
    getPollData()
      .then((data) => {
        let selectedQuestions: Set<number> | null = null;
        if (params.pollId) {
          const dataString = localStorage.getItem(params.pollId);
          if (dataString) {
            selectedQuestions = new Set(JSON.parse(dataString));
          }
        }

        const questionData = data.questions.map((question) => {
          const pollQuestion = { ...question, checked: false };
          if (selectedQuestions) {
            pollQuestion.checked = selectedQuestions.has(question.id);
          }
          return pollQuestion;
        });
        setPollName(data.name);
        setQuestions(questionData);
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
                onChange={() => toggleVote(!question.checked, question.id)}
                checked={question.checked}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default Poll;
