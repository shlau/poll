import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Question {
  id: number;
  value: string;
  votes: number;
}

function useQuestions(pollId?: string) {
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const queryClient = useQueryClient();

  useEffect(() => {
    if (pollId) {
      const dataString = localStorage.getItem(pollId);
      if (dataString) {
        setSelectedQuestions(new Set(JSON.parse(dataString)));
      }
    }
  }, []);

  const toggleVote = async (question: Question) => {
    const checked = selectedQuestions.has(question.id);

    console.log(`check value: ${checked}, questionId: ${question.id}`);
    const response = await fetch(`/api/questions/${question.id}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    });
    if (pollId) {
      localStorage.setItem(
        pollId,
        JSON.stringify(Array.from(selectedQuestions))
      );
    }

    const data = await response.json();
    return data;
  };

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

  const onVoteMutation = async (currentQuestion: Question) => {
    let checked = true;
    if (selectedQuestions.has(currentQuestion.id)) {
      checked = false;
      selectedQuestions.delete(currentQuestion.id);
    } else {
      selectedQuestions.add(currentQuestion.id);
    }
    if (pollId) {
      localStorage.setItem(
        pollId,
        JSON.stringify(Array.from(selectedQuestions))
      );
      setSelectedQuestions(new Set(selectedQuestions));
    }
    await queryClient.cancelQueries({ queryKey: ["questions"] });
    const previousQuestions = queryClient.getQueryData(["questions"]);
    queryClient.setQueryData(["questions"], (oldQuestions: Question[]) => {
      const newQuestions = oldQuestions
        .map((question: Question) => {
          let newQuestion = { ...question };
          if (currentQuestion.id === question.id) {
            newQuestion.votes = newQuestion.votes + (checked ? 1 : -1);
          }
          return newQuestion;
        })
        .sort((a: Question, b: Question) => a.id - b.id);
      return newQuestions;
    });
    return { previousQuestions };
  };

  const toggleVoteMutation = useMutation({
    mutationFn: toggleVote,
    onMutate: onVoteMutation,
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["questions"], context?.previousQuestions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  return {
    questions: questionsQuery.data,
    selectedQuestions,
    toggleVote: toggleVoteMutation.mutate,
    createQuestion: createQuestionMutation.mutate,
  };
}
export default useQuestions;
