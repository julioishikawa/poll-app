import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "../services/api";

interface PollCardProps {
  poll: {
    id: string;
    date: Date;
    title: string;
    options: {
      id: string;
      title: string;
      score: number;
    }[];
  };
  onVoteSubmit: (selectedOptionId: string) => void;
}

export function PollCard({ poll, onVoteSubmit }: PollCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [pollContent, setPollContent] = useState<string | null>(null);
  const [pollCreationDistance, setPollCreationDistance] = useState<
    string | null
  >(null);

  function handleOptionSelected(optionId: string) {
    setSelectedOptionId(optionId);
  }

  function handleVoteSubmit() {
    if (selectedOptionId === null) {
      toast.error("Por favor, escolha uma opção para votar.");
      return;
    }

    onVoteSubmit(selectedOptionId);
  }

  useEffect(() => {
    async function fetchPollById() {
      try {
        const response = await api.get(`/polls/${poll.id}`);
        const pollData = response.data.poll; // Acessando os dados dentro do objeto 'poll'

        setPollContent(pollData.content);

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

    fetchPollById();
  }, [poll.id]);

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md text-left bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-300">
          {pollCreationDistance}
        </span>

        <h2 className="text-base leading-6 text-slate-300">{poll.title}</h2>

        {poll.options &&
          poll.options.map((option) => (
            <button
              key={option.id}
              className={`min-h-5 text-sm text-slate-400 hover:underline ${
                selectedOptionId === option.id ? "font-bold" : ""
              }`}
              style={{
                maxWidth: "304px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
              onClick={() => handleOptionSelected(option.id)}
            >
              {option.title}
            </button>
          ))}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />

        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <div className="flex flex-1 flex-col gap-3 p-5">
            {pollCreationDistance && (
              <span className="text-sm font-medium text-slate-300">
                {pollCreationDistance}
              </span>
            )}

            <h1 className="text-xl font-bold leading-6 text-slate-300">
              {poll.title}
            </h1>

            {/* Renderize o conteúdo da enquete aqui */}
            <p className="text-slate-400">{pollContent}</p>

            <div
              className="overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
              style={{ maxHeight: "340px" }}
            >
              <p>Opções</p>
              {poll.options &&
                poll.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center p-2 hover:bg-slate-800 rounded"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOptionSelected(option.id)}
                  >
                    <span
                      className="w-full text-sm text-slate-400 "
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
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

          <button
            type="button"
            onClick={handleVoteSubmit}
            className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
          >
            Enviar voto
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
