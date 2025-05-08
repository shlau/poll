import { Checkbox, IconButton } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router";
import "./Poll.less";
import usePollData from "./usePollData";
import useQuestions, { Question } from "./useQuestions";
import useVotes from "./useVotes";
import CommentIcon from "@mui/icons-material/Comment";
import Comments from "../comments/Comments";

function Poll() {
  let params = useParams();
  const [inputText, setInputText] = useState("");
  const [selectedQuestionComments, setSelectedQuestionComments] =
    useState<null | Question>(null);
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
      <div className="content">
        {selectedQuestionComments && (
          <Comments
            questionId={selectedQuestionComments?.id}
            questionValue={selectedQuestionComments?.value}
          ></Comments>
        )}
        <div className="questions-container">
          <div className="question-list-container">
            {questions?.map((q) => {
              return (
                <li key={q.id}>
                  <IconButton
                    aria-label="comment"
                    onClick={() =>
                      setSelectedQuestionComments((prev) => {
                        if (prev?.id === q.id) {
                          return null;
                        }
                        return q;
                      })
                    }
                  >
                    <CommentIcon />
                  </IconButton>
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
              ADD QUESTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Poll;
