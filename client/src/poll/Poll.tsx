import { Checkbox } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router";
import "./Poll.less";
import usePollData from "./usePollData";
import useQuestions from "./useQuestions";
import useVotes from "./useVotes";

function Poll() {
  let params = useParams();
  const [inputText, setInputText] = useState("");
  const { data, isError, isPending } = usePollData(params.pollId);
  const { questions, createQuestion } = useQuestions(params.pollId);
  const { selectedQuestions, toggleVote } = useVotes(params.pollId);

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <div> An error occured</div>;
  }

  return (
    <div className="poll-container">
      <h1>{data?.name}</h1>
      <div className="question-container">
        {questions?.map((q) => {
          return (
            <li key={q.id}>
              <div>{q.id}</div>
              <div>{q.value}</div>
              <Checkbox
                checked={selectedQuestions.has(q.id)}
                onChange={() => {
                  toggleVote(q);
                }}
              ></Checkbox>
            </li>
          );
        })}
      </div>
      <div className="new-question-container">
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
        <button onClick={() => createQuestion({ value: inputText })}>
          ADD
        </button>
      </div>
    </div>
  );
}
export default Poll;
