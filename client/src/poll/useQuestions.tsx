import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Question {
  id: number;
  value: string;
  votes: number;
}

function useQuestions(pollId?: string) {
  const queryClient = useQueryClient();
  const getQuestions = async (): Promise<Question[]> => {
    const response = await fetch(`/api/polls/${pollId}/questions`, {
      method: "GET",
    });
    const data = await response.json();
    return data.sort((a: Question, b: Question) => a.id - b.id);
  };

  const questionsQuery = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });

  const createQuestion = async (question: { value: string }) => {
    const response = await fetch(`/api/polls/${pollId}/questions`, {
      method: "POST",
      body: JSON.stringify(question),
    });
    const data = await response.json();
    return data;
  };

  const createQuestionMutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    questions: questionsQuery.data,
    createQuestion: createQuestionMutation.mutate,
  };
}
export default useQuestions;
