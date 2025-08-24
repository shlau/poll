import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Question } from "./useQuestions";

function useVotes(pollId?: string) {
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());

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

  const onVoteMutation = async (currentQuestion: Question) => {
    if (selectedQuestions.has(currentQuestion.id)) {
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
  };

  const toggleVoteMutation = useMutation({
    mutationFn: toggleVote,
    onMutate: onVoteMutation,
  });

  return {
    selectedQuestions,
    toggleVote: toggleVoteMutation.mutate,
  };
}
export default useVotes;
