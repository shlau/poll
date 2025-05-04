import { Checkbox } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import "./Poll.less";

interface Question {
  id: number;
  value: string;
  votes: number;
}
interface PollData {
  id: string;
  name: string;
}
function Poll() {
  let params = useParams();
  const [inputText, setInputText] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  // const [questions, setQuestions] = useState([] as Question[]);
  // const [pollName, setPollName] = useState("");
  useEffect(() => {
    if (params.pollId) {
      const dataString = localStorage.getItem(params.pollId);
      if (dataString) {
        setSelectedQuestions(new Set(Array.from(JSON.parse(dataString))));
      }
    }
  }, []);

  const queryClient = useQueryClient();
  const toggleVote = async (question: any) => {
    const checked = selectedQuestions.has(question.id);

    console.log(`check value: ${checked}, questionId: ${question.id}`);
    const response = await fetch(`/api/questions/${question.id}/vote`, {
      method: "PATCH",
      body: JSON.stringify({ checked }),
    });
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
    return data.sort((a: any, b: any) => a.id - b.id);
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
  const createQuestion = async () => {
    const response = await fetch(`/api/polls/${params.pollId}/questions`, {
      method: "POST",
      body: JSON.stringify({ value: inputText }),
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
  const onVoteMutation = async (currentQuestion: any) => {
    let checked = true;
    if (selectedQuestions.has(currentQuestion.id)) {
      checked = false;
      selectedQuestions.delete(currentQuestion.id);
    } else {
      selectedQuestions.add(currentQuestion.id);
    }
    if (params.pollId) {
      setSelectedQuestions(new Set(selectedQuestions));
      localStorage.setItem(params.pollId, JSON.stringify(selectedQuestions));
    }
    await queryClient.cancelQueries({ queryKey: ["questions"] });
    const previousQuestions = queryClient.getQueryData(["questions"]);
    queryClient.setQueryData(["questions"], (oldQuestions: any) => {
      const newQuestions = oldQuestions
        .map((question: any) => {
          let newQuestion = { ...question };
          if (currentQuestion.id === question.id) {
            newQuestion.votes = newQuestion.votes + (checked ? 1 : -1);
          }
          return newQuestion;
        })
        .sort((a: any, b: any) => a.id - b.id);
      return newQuestions;
    });
    return { previousQuestions };
  };

  const toggleVoteMutation = useMutation({
    mutationFn: toggleVote,
    onMutate: onVoteMutation,
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["questions"], context?.previousQuestions);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
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
    <div className="poll-container">
      <h1>{pollQuery.data?.name}</h1>
      <div className="question-container">
        {questionsQuery.data?.map((q) => {
          return (
            <li key={q.id}>
              <div>{q.id}</div>
              <div>{q.value}</div>
              <div>{q.votes}</div>
              <Checkbox
                checked={selectedQuestions.has(q.id)}
                onChange={() => {
                  toggleVoteMutation.mutate(q);
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
        <button onClick={() => createQuestionMutation.mutate()}>ADD</button>
      </div>
    </div>
  );
}
export default Poll;
