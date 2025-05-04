import { Checkbox } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

interface Question {
  id: number;
  value: string;
  votes: number;
  checked: boolean;
}
interface PollData {
  id: string;
  name: string;
}
function Poll() {
  let params = useParams();
  // const [questions, setQuestions] = useState([] as Question[]);
  // const [pollName, setPollName] = useState("");
  let selectedQuestions = new Set();
  useEffect(() => {
    if (params.pollId) {
      const dataString = localStorage.getItem(params.pollId);
      if (dataString) {
        selectedQuestions = new Set(JSON.parse(dataString));
      }
    }
  }, []);

  const queryClient = useQueryClient();
  const toggleVote = async (question: any) => {
    const newCheckedVal = !question.checked;
    console.log(`check value: ${newCheckedVal}, questionId: ${question.id}`);
    const response = await fetch(`/api/questions/${question.id}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ checked: newCheckedVal }),
    });
    if (newCheckedVal) {
      selectedQuestions.add(question.id);
    } else {
      selectedQuestions.delete(question.id);
    }
    if (params.pollId) {
      localStorage.setItem(params.pollId, JSON.stringify(selectedQuestions));
    }

    const data = await response.json();
    return data;
  };

  const getQuestions = async (): Promise<Question[]> => {
    const response = await fetch(`/api/polls/${params.pollId}/questions`, {
      method: "GET",
    });
    const data = await response.json();
    // let selectedQuestions: Set<number> | null = null;
    // if (params.pollId) {
    //   const dataString = localStorage.getItem(params.pollId);
    //   if (dataString) {
    //     selectedQuestions = new Set(JSON.parse(dataString));
    //   }
    // }
    // const questionData = data.questions.map((question: any) => {
    //   const pollQuestion = { ...question, checked: false };
    //   if (selectedQuestions) {
    //     pollQuestion.checked = selectedQuestions.has(question.id);
    //   }
    //   return pollQuestion;
    // });
    return data;
  };

  const getPollData = async (): Promise<PollData> => {
    const response = await fetch(`/api/polls/${params.pollId}`, {
      method: "GET",
    });
    const data = await response.json();
    // let selectedQuestions: Set<number> | null = null;
    // if (params.pollId) {
    //   const dataString = localStorage.getItem(params.pollId);
    //   if (dataString) {
    //     selectedQuestions = new Set(JSON.parse(dataString));
    //   }
    // }
    // const questionData = data.questions.map((question: any) => {
    //   const pollQuestion = { ...question, checked: false };
    //   if (selectedQuestions) {
    //     pollQuestion.checked = selectedQuestions.has(question.id);
    //   }
    //   return pollQuestion;
    // });
    return data;
  };
  const pollQuery = useQuery({ queryKey: ["poll"], queryFn: getPollData });
  const questionsQuery = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
  });
  // const onVoteMutation = async (currentQuestion: any) => {
  //   await queryClient.cancelQueries({ queryKey: ["questions"] });
  //   const previousQuestions = queryClient.getQueryData(["questions"]);
  //   queryClient.setQueryData(["questions"], (oldQuestions: any) => {
  //     const newCheckedVal = !currentQuestion.checked;
  //     return oldQuestions.map((question: any) => {
  //       let newQuestion = { ...question };
  //       if (currentQuestion.id === question.id) {
  //         newQuestion.votes = newQuestion.votes + (newCheckedVal ? 1 : -1);
  //       }
  //       return newQuestion;
  //     });
  //   });
  //   return { previousQuestions };
  // };

  // const voteMutation = useMutation({
  //   mutationFn: toggleVote,
  //   onMutate: onVoteMutation,
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["questions"] });
  //   },
  // });
  // useEffect(() => {
  //   getPollData()
  //     .then((data) => {
  //       let selectedQuestions: Set<number> | null = null;
  //       if (params.pollId) {
  //         const dataString = localStorage.getItem(params.pollId);
  //         if (dataString) {
  //           selectedQuestions = new Set(JSON.parse(dataString));
  //         }
  //       }

  //       const questionData = data.questions.map((question) => {
  //         const pollQuestion = { ...question, checked: false };
  //         if (selectedQuestions) {
  //           pollQuestion.checked = selectedQuestions.has(question.id);
  //         }
  //         return pollQuestion;
  //       });
  //       setPollName(data.name);
  //       setQuestions(questionData);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  return (
    <div>
      <h1>{pollQuery.data?.name}</h1>
      <div>
        {questionsQuery.data?.map((q) => {
          return (
            <li key={q.id}>
              <div>{q.id}</div>
              <div>{q.value}</div>
              <Checkbox></Checkbox>
            </li>
          );
        })}
      </div>
    </div>
  );
}
export default Poll;
