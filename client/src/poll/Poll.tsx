import { useParams } from "react-router";

function Poll() {
  let params = useParams();
  console.log(params);
  return <div>{params.pollId}</div>;
}
export default Poll;
