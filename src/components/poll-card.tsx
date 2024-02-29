import { useState, useEffect } from "react";
import { api } from "../services/api";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";

interface PollCardProps {
  poll: {
    id: string;
    created_at: Date;
    title: string;
    options: {
      id: string;
      title: string;
    }[];
  };
  onVoteSubmitted: (id: string) => void;
}

export function PollCard({ poll, onVoteSubmitted }: PollCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [pollCreationDistance, setPollCreationDistance] = useState<string>("");
  const [voteSubmitted, setVoteSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previousVotedOptionId, setPreviousVotedOptionId] =
    useState<string>("");

  function handleOptionSelected(optionId: string) {
    setSelectedOptionId(optionId);
    if (optionId !== previousVotedOptionId) {
      setVoteSubmitted(false);
    } else {
      setVoteSubmitted(true);
    }
  }

  async function handleVoteSubmit() {
    if (!selectedOptionId) {
      toast.error("Você precisa escolher uma opção para votar na enquete.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/polls/${poll.id}/votes`, {
        pollOptionId: selectedOptionId,
      });

      const setCookieHeader = response.headers["set-cookie"];

      if (typeof setCookieHeader === "string") {
        document.cookie = setCookieHeader;
      }

      toast.success("Voto enviado com sucesso.");
      onVoteSubmitted(poll.id);
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        toast.error("Você já votou nesta enquete.");
      } else {
        console.error("Erro ao enviar o voto:", error);
        toast.error(
          "Erro ao enviar o voto. Por favor, tente novamente mais tarde."
        );
      }
    } finally {
      setIsSubmitting(false);
      setPreviousVotedOptionId(selectedOptionId);
    }
  }

  useEffect(() => {
    async function fetchPollDistanceById() {
      try {
        const response = await api.get(`/polls/${poll.id}`);
        const pollData = response.data.poll;

        if (pollData.date) {
          const distance = formatDistanceToNow(new Date(pollData.date), {
            locale: ptBR,
            addSuffix: true,
          });
          setPollCreationDistance(distance);
        }
      } catch (error) {
        console.error("Erro ao buscar a enquete:", error);
      }
    }

    fetchPollDistanceById();
  }, [poll.id]);

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-300">
          {pollCreationDistance}
        </span>

        <div className="max-w-[270px]">
          <h2 className="text-base leading-6 text-slate-300 truncate">
            {poll.title}
          </h2>
        </div>

        {poll.options &&
          poll.options.map((option) => (
            <button
              key={option.id}
              className={`min-h-5 max-w-full text-left text-sm text-slate-400 hover:underline truncate ${
                selectedOptionId === option.id ? "font-bold" : ""
              }`}
              onClick={() => handleOptionSelected(option.id)}
              tabIndex={-1}
            >
              {option.title}
            </button>
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
                {poll.title}
              </h1>
            </div>

            <div>
              <h2 className="mb-3">Opções</h2>
              <div className="max-h-[340px] flex flex-1 flex-col pr-2 gap-3 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                {poll.options &&
                  poll.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center p-2 bg-slate-800 hover:bg-slate-900 rounded"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOptionSelected(option.id)}
                    >
                      <span className="w-full text-sm text-slate-400 ">
                        {option.title}
                      </span>
                      <input
                        type="radio"
                        name="vote"
                        className="w-4 h-4"
                        checked={selectedOptionId === option.id}
                        onChange={() => handleOptionSelected(option.id)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {isSubmitting ? (
            <button
              type="button"
              disabled
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500 cursor-not-allowed"
            >
              Enviando voto...
            </button>
          ) : (
            <button
              type="button"
              onClick={handleVoteSubmit}
              disabled={voteSubmitted}
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
            >
              Enviar voto
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
