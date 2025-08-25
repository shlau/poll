import {
  Button,
  Checkbox,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./Poll.less";
import usePollData from "./usePollData";
import useQuestions, { Question } from "./useQuestions";
import useVotes from "./useVotes";
import CommentIcon from "@mui/icons-material/Comment";
import Comments from "../comments/Comments";
import UploadWidget from "../UploadWidget";

function Poll() {
  let params = useParams();
  const [inputText, setInputText] = useState("");
  const [selectedQuestionComments, setSelectedQuestionComments] =
    useState<null | Question>(null);
  const { data, isError, isPending } = usePollData(params.pollId);
  const { questions, createQuestion } = useQuestions(params.pollId);
  const { selectedQuestions, toggleVote } = useVotes(params.pollId);
  const navigate = useNavigate();

  if (isPending) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <div> An error occured</div>;
  }

  const getImageUrl = (questionId: number): string => {
    return `https://res.cloudinary.com/${
      import.meta.env.VITE_IMAGE_CLOUD_NAME
    }/image/upload/polls/${params.pollId}/questions/${questionId}.png`;
  };

  return (
    <div className="poll-container">
      <div
        className={`comments-section ${
          selectedQuestionComments ? "visible" : "hidden"
        }`}
      >
        {selectedQuestionComments && (
          <Comments
            questionId={selectedQuestionComments?.id}
            questionValue={selectedQuestionComments?.value}
          ></Comments>
        )}
      </div>
      <div className="questions-section">
        <Typography variant="h3">{data?.name}</Typography>
        <div className="content">
          <div className="questions-container">
            <div className="question-list-container">
              {questions?.map((q) => {
                return (
                  <li key={q.id}>
                    <div className="question-content">
                      <UploadWidget questionId={q.id} pollId={params.pollId} />
                      <img
                        // @ts-ignore
                        src={getImageUrl(q.id)}
                        alt="upload an image"
                      />
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
                      <Tooltip title={q.value}>
                        <Typography variant="body1">{q.value}</Typography>
                      </Tooltip>
                    </div>
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
              <TextField
                id="outlined-basic"
                label="Enter your question"
                variant="outlined"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={!inputText}
                onClick={() => {
                  createQuestion({ value: inputText });
                }}
              >
                Add Question
              </Button>
            </div>
          </div>
        </div>
        <div className="footer">
          <Button
            onClick={() => {
              navigate(`/`);
            }}
            variant="contained"
          >
            Homepage
          </Button>
          <Button
            onClick={() => {
              navigate(`/polls/${data.id}/results`);
            }}
            variant="contained"
          >
            View results
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Poll;
