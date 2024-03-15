import { useState, useEffect } from "react";
import { api } from "../services/api";
import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { toast } from "sonner";

interface PollOption {
  id: string;
  title: string;
  score: number;
}

interface PollResultsProps {
  poll: {
    id: string;
    created_at: Date;
    title: string;
    options: PollOption[];
  };
  onChangeVote: (pollId: string) => void;
  onDelete: (pollId: string) => void;
}

export function PollCardResults({
  poll,
  onChangeVote,
  onDelete,
}: PollResultsProps) {
  const [pollData, setPollData] = useState<any>(null);

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar esta enquete?"
    );

    if (!confirmDelete) {
      return;
    }

    await api.delete(`/polls/${poll.id}`);
    toast.success("Enquete deletada com sucesso.");
    onDelete(poll.id);
  }

  function handleChangeVote(pollId: string) {
    if (onChangeVote && pollId) {
      onChangeVote(pollId);
    } else {
      toast.error("ID da enquete inválido");
    }
  }

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const response = await api.get(`/polls/${poll.id}`);
        const { poll: fetchedPollData } = response.data;

        setPollData(fetchedPollData);
      } catch (error) {
        console.error("Erro ao buscar a enquete:", error);
      }
    };

    fetchPollData();
  }, [poll.id]);

  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger className="w-full h-full rounded-md bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
          <span className="text-sm font-medium text-slate-300">
            {formatDistanceToNow(poll.created_at, {
              locale: ptBR,
              addSuffix: true,
            })}
          </span>

          <div className="max-w-[270px]">
            <h2 className="text-base leading-6 text-slate-300 truncate">
              {poll.title}
            </h2>
          </div>
          {pollData &&
            pollData.options &&
            pollData.options.map((option: PollOption) => (
              <div
                key={option.id}
                className={`min-h-5 w-full gap-3 text-left text-sm text-slate-400 hover:underline flex justify-between items-center`}
                tabIndex={-1}
              >
                <span className="w-48 inline-block truncate">
                  {option.title}{" "}
                </span>

                <span
                  className={`min-w-[60px] ${
                    option.score > 0 ? "font-bold" : ""
                  }`}
                >
                  {option.score} votos
                </span>
              </div>
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
              <span className="text-sm font-medium text-slate-300">
                {formatDistanceToNow(poll.created_at, {
                  locale: ptBR,
                  addSuffix: true,
                })}
              </span>

              <div>
                <h1 className="text-xl font-bold leading-6 text-slate-300 break-words">
                  Resultados da Enquete: {pollData?.title}
                </h1>
              </div>

              <div className="max-h-[340px] overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                <ul className="flex flex-col gap-3 pr-2">
                  {pollData &&
                    pollData.options &&
                    pollData.options.map(
                      (option: PollOption, index: number) => (
                        <li
                          className={`w-full gap-5 text-left flex justify-between items-center`}
                          key={index}
                        >
                          <span className="w-full inline-block truncate">
                            {option.title}
                          </span>

                          <span
                            className={`min-w-[60px] ${
                              option.score > 0 ? "font-bold" : ""
                            }`}
                          >
                            {option.score} votos
                          </span>
                        </li>
                      )
                    )}
                </ul>
              </div>
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-lime-500 text-white font-medium rounded hover:bg-lime-600"
                  onClick={() => handleChangeVote(poll.id)}
                >
                  Trocar Voto
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-whitefont-medium rounded hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Deletar Enquete
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
