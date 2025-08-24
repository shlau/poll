import { useQuery } from "@tanstack/react-query";

interface PollData {
  id: string;
  name: string;
}
function usePollData(pollId?: string) {
  const getPollData = async (): Promise<PollData> => {
    const response = await fetch(`/api/polls/${pollId}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  };
  const pollQuery = useQuery({ queryKey: ["poll", pollId], queryFn: getPollData });
  return pollQuery;
}
export default usePollData;
