import { useParams } from "react-router";
import useQuestions from "../poll/useQuestions";

function Results() {
  let params = useParams();
  const { questions } = useQuestions(params.pollId);

  return (
    <div>
      {questions?.map((q) => {
        return (
          <div>
            <p>{q.value}</p>
            <p>{q.votes}</p>
          </div>
        );
      })}
    </div>
  );
}
export default Results;
