import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PollCardProps {
  poll: {
    id: string;
    date: Date;
    question: string;
    options: string[];
  };
  onPollDeleted: (id: string) => void;
}

export function PollCard({ poll, onPollDeleted }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const navigate = useNavigate();

  function handleOptionSelected(index: number) {
    setSelectedOption(index);
  }

  function handleCloseVoteWindow() {
    navigate("/", { replace: true }); // Navegar de volta para a página inicial
  }

  function handleVoteSubmit() {
    if (selectedOption === null) {
      toast.error("Por favor, escolha uma opção para votar.");
      return;
    }

    // Envie o voto para o banco de dados (implemente sua lógica de envio aqui)

    // Exemplo de console.log para demonstração
    console.log("Voto enviado:", poll.options[selectedOption]);

    handleCloseVoteWindow();

    toast.success("Voto enviado com sucesso!");
  }

  function handleDeleteClick() {
    onPollDeleted(poll.id);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md text-left bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-300">
          {formatDistanceToNow(poll.date, {
            locale: ptBR,
            addSuffix: true,
          })}
        </span>

        <h2 className="text-base leading-6 text-slate-300">{poll.question}</h2>

        {poll.options.map((option, index) => (
          <button
            key={index}
            className={`min-h-5 text-sm text-slate-400 hover:underline ${
              selectedOption === index ? "font-bold" : ""
            }`}
            style={{
              maxWidth: "304px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
            onClick={() => handleOptionSelected(index)}
          >
            {option}
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
            <span className="text-sm font-medium text-slate-300">
              {formatDistanceToNow(poll.date, {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>

            <h1 className="text-xl font-bold leading-6 text-slate-300">
              {poll.question}
            </h1>

            <div
              className="overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
              style={{ maxHeight: "340px" }}
            >
              <p>Opções</p>
              {poll.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-slate-800 rounded"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOptionSelected(index)}
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
                    {option}
                  </span>
                  <input
                    type="radio"
                    name="vote"
                    className="w-4 h-4"
                    checked={selectedOption === index}
                    onChange={() => handleOptionSelected(index)}
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

          <button
            type="button"
            onClick={handleDeleteClick}
            className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group"
          >
            Deseja{" "}
            <span className="text-red-400 group-hover:underline">
              apagar essa enquete
            </span>
            ?
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
