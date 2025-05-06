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
  const pollData = usePollData(params.pollId);
  const { questions, createQuestion } = useQuestions(params.pollId);
  const { selectedQuestions, toggleVote } = useVotes(params.pollId);

  return (
    <div className="poll-container">
      <h1>{pollData?.name}</h1>
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
