import { useEffect, useState } from "react";
import useComments, { QuestionComment } from "./useComments";
import "./Comments.less";
import { useQueryClient } from "@tanstack/react-query";

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
    return <span>Loading...</span>;
  }

  if (commentsQuery.isError) {
    return <div> An error occured</div>;
  }

  return (
    <div className="comments-container">
      <div>{questionId}</div>
      <div>{questionValue}</div>
      <ul>
        {commentsQuery.data?.map((comment) => {
          return (
            <li key={comment.id}>
              {comment.author}:{comment.value}
            </li>
          );
        })}
      </ul>
      <div className="create-comment-inputs">
        <input
          type="text"
          value={author}
          placeholder="Username"
          onChange={(e) => {
            setAuthor(e.target.value);
          }}
        />
        <input
          placeholder="Comment"
          type="text"
          value={commentValue}
          onChange={(e) => {
            setCommentValue(e.target.value);
          }}
        />
        <button
          onClick={() => handleCreateComment({ value: commentValue, author })}
        >
          ADD COMMENT
        </button>
      </div>
    </div>
  );
}
export default Comments;
