import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface QuestionComment {
  id?: string;
  value: string;
  author: string;
}
function useComments(questionId: number) {
  const queryClient = useQueryClient();
  const queryKey = [`comments-${questionId}`];
  const getComments = async (): Promise<QuestionComment[]> => {
    console.log(queryKey);
    const response = await fetch(`/api/questions/${questionId}/comments`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };
  const commentsQuery = useQuery({
    queryKey,
    queryFn: getComments,
  });

  const createComment = async (
    comment: QuestionComment
  ): Promise<QuestionComment> => {
    const response = await fetch(`/api/questions/${questionId}/comments`, {
      method: "POST",
      body: JSON.stringify({ value: comment.value, author: comment.author }),
    });
    const data = await response.json();
    return data;
  };

  const onCommentMutation = async (newComment: QuestionComment) => {
    // When mutate is called:
    // Cancel any outgoing refetches
    // (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousComments = queryClient.getQueryData(queryKey);

    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, (old: QuestionComment[]) => {
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
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(queryKey, context?.previousComments);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { commentsQuery, createComment: createCommentMutation.mutate };
}
export default useComments;
