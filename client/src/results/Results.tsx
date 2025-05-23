import { useParams } from "react-router";
import useQuestions from "../poll/useQuestions";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, CircularProgress, useTheme } from "@mui/material";
import "./Results.less";
import { chartsTooltipClasses } from "@mui/x-charts";

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

  const theme = useTheme();

  return (
    questions && (
      <div className="results-container">
        <BarChart
          dataset={questions as any}
          yAxis={[{ scaleType: "band", dataKey: "value", width: 300 }]}
          series={[
            {
              dataKey: "votes",
              label: "Votes",
              color: theme.palette.primary.light,
            },
          ]}
          layout="horizontal"
          slotProps={{
            tooltip: {
              sx: {
                [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.table} caption`]:
                  {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                    width: "500px !important",
                    maxHeight: "200px",
                  },
              },
            },
          }}
        />
      </div>
    )
  );
}
export default Results;
