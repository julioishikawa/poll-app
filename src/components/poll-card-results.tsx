import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { useWebSocket } from "../hooks/web-socket-provider";

interface PollResultsProps {
  poll: {
    id: string;
    date: Date;
    title: string;
    options: {
      id: string;
      title: string;
    }[];
  };
}

const MAX_RECONNECTION_ATTEMPTS = 5; // Máximo de tentativas de reconexão
const RECONNECT_INTERVAL = 1000; // Intervalo inicial de reconexão em milissegundos

export function PollCardResults({ poll }: PollResultsProps) {
  const [pollData, setPollData] = useState<any>(null);
  const [pollCreationDistance, setPollCreationDistance] = useState<string>("");
  const [results, setResults] = useState<
    { pollOptionId: string; votes: number }[]
  >([]);
  const wsURL = useWebSocket(poll.id);
  const [reconnectionAttempts, setReconnectionAttempts] = useState<number>(0);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(wsURL);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setReconnectionAttempts(0); // Zerar o número de tentativas de reconexão após a conexão bem-sucedida
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received WebSocket message", message);
      setResults((prevResults) => {
        const updatedResults = prevResults.map((result) => {
          if (result.pollOptionId === message.pollOptionId) {
            return {
              ...result,
              votes: message.votes,
            };
          }
          return result;
        });
        return updatedResults;
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Tentar reconectar após um intervalo de tempo determinado
      if (reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
        const reconnectTimeout =
          Math.pow(2, reconnectionAttempts) * RECONNECT_INTERVAL;
        setTimeout(connectWebSocket, reconnectTimeout);
        setReconnectionAttempts((prevAttempts) => prevAttempts + 1);
      } else {
        console.error("Reached maximum reconnection attempts");
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed, reopening...");
      // Tentar reconectar imediatamente
      connectWebSocket();
    };

    return () => {
      ws.close();
    };
  }, [wsURL, reconnectionAttempts]);

  useEffect(() => {
    async function fetchPollData() {
      try {
        const response = await api.get(`/polls/${poll.id}`);
        const pollData = response.data.poll;

        if (pollData.date) {
          const distance = formatDistanceToNow(new Date(pollData.date), {
            locale: ptBR,
            addSuffix: true,
          });
          setPollCreationDistance(distance);
          setPollData(pollData);
        }
      } catch (error) {
        console.error("Erro ao buscar a enquete:", error);
      }
    }

    fetchPollData();
  }, [poll.id]);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger className="w-full h-full rounded-md bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
          <span className="text-sm font-medium text-slate-300">
            {pollCreationDistance}
          </span>

          <div className="max-w-[300px]">
            <h2 className="text-base leading-6 text-slate-300 truncate">
              {poll.title}
            </h2>
          </div>

          {poll.options &&
            poll.options.map((option) => (
              <span
                key={option.id}
                className={`min-h-5 max-w-full text-left text-sm text-slate-400 hover:underline truncate ${
                  option.id ? "font-bold" : ""
                }`}
                tabIndex={-1}
              >
                {option.title}:{" "}
                {results.find((result) => result.pollOptionId === option.id)
                  ?.votes ?? 0}{" "}
                votos
              </span>
            ))}

          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="inset-0 fixed bg-black/50" />

          <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[550px] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
            <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5" />
            </Dialog.Close>

            <div className="flex flex-1 flex-col gap-4 p-5">
              {pollCreationDistance && (
                <span className="text-sm font-medium text-slate-300">
                  {pollCreationDistance}
                </span>
              )}

              <div className="max-w-[500px]">
                <h1 className="text-xl font-bold leading-6 text-slate-300 break-words">
                  Resultados da Enquete: {pollData?.title}
                </h1>
              </div>

              <div>
                <ul>
                  {poll.options.map((option, index) => (
                    <li key={index}>
                      {option.title}:{" "}
                      {results.find(
                        (result) => result.pollOptionId === option.id
                      )?.votes ?? 0}{" "}
                      votos
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
