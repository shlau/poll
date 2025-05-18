import { useEffect, useState } from "react";
import useComments, { QuestionComment } from "./useComments";
import "./Comments.less";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";

interface CommentsProps {
  questionId: number;
  questionValue: string;
}

function Comments({ questionId, questionValue }: CommentsProps) {
  const { commentsQuery, createComment } = useComments(questionId);
  const [author, setAuthor] = useState("");
  const [commentValue, setCommentValue] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthor("");
    setCommentValue("");
    queryClient.setQueryData(
      [`comments-${questionId}`],
      (old: Comment[]) => old
    );
  }, [questionId]);

  const handleCreateComment = (newComment: QuestionComment) => {
    createComment(newComment);
    setAuthor("");
    setCommentValue("");
  };

  if (commentsQuery.isPending) {
    // return <span>Loading...</span>;
    return (
      <Box className="loading-container" sx={{ display: "flex" }}>
        <CircularProgress size="100px"/>
      </Box>
    );
  }

  if (commentsQuery.isError) {
    return <div> An error occured</div>;
  }

  return (
    <div className="comments-container">
      <Typography variant="h5">{questionValue}</Typography>
      <div className="comments-content">
        <ul>
          {commentsQuery.data?.map((comment) => {
            return (
              <li className="comment-wrapper" key={comment.id}>
                <div className="comment-author">{comment.author}:</div>
                <div className="comment-value">{comment.value}</div>
              </li>
            );
          })}
        </ul>
        <div className="create-comment-inputs">
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <TextField
            id="outlined-basic"
            label="Comment"
            variant="outlined"
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={!(commentValue && author)}
            onClick={() => handleCreateComment({ value: commentValue, author })}
          >
            Add a comment
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Comments;
