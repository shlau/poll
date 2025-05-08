import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Comment {
  id?: string;
  value: string;
  author: string;
}
function useComments(questionId: number) {
  const queryClient = useQueryClient();
  const getComments = async (): Promise<Comment[]> => {
    const response = await fetch(`/api/questions/${questionId}/comments`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };
  const commentsQuery = useQuery({
    queryKey: ["comments"],
    queryFn: getComments,
  });

  const createComment = async (comment: Comment): Promise<Comment> => {
    const response = await fetch(`/api/questions/${questionId}/comments`, {
      method: "POST",
      body: JSON.stringify({ value: comment.value, author: comment.author }),
    });
    const data = await response.json();
    return data;
  };

  const onCommentMutation = async (newComment: Comment) => {
    // When mutate is called:
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey: ["comments"] });

    // Snapshot the previous value
    const previousComments = queryClient.getQueryData(["comments"]);

    // Optimistically update to the new value
    queryClient.setQueryData(["comments"], (old: Comment[]) => {
      const tmpIdx = `${-1 * (old.length + 1)}`;
      return [...old, { ...newComment, id: tmpIdx }];
    });

    // Return a context object with the snapshotted value
    return { previousComments };
  };

  const createCommentMutation = useMutation({
    mutationFn: createComment,
    onMutate: onCommentMutation,
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (_err, _jnewTodo, context) => {
      queryClient.setQueryData(["comments"], context?.previousComments);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  return { commentsQuery, createComment: createCommentMutation.mutate };
}
export default useComments;
