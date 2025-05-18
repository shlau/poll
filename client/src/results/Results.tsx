import { useParams } from "react-router";
import useQuestions from "../poll/useQuestions";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, CircularProgress } from "@mui/material";

function Results() {
  let params = useParams();
  const { questions, pending, error } = useQuestions(params.pollId);
  if (error) {
    return <div>Error loading questions</div>;
  }
  if (pending) {
    return (
      <Box className="loading-container" sx={{ display: "flex" }}>
        <CircularProgress size="100px" />
      </Box>
    );
  }

  return (
    questions && (
      <div className="results-container">
        <BarChart
          xAxis={[
            {
              data: questions.map((q) => q.value),
            },
          ]}
          series={[
            {
              data: questions.map((q) => q.votes),
            },
          ]}
          height={400}
          width={1000}
        />
      </div>
    )
  );
}
export default Results;
