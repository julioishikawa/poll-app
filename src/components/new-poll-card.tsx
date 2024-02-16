import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { api } from "../services/api";

interface NewPollProps {
  onPollCreated: (question: string, options: string[]) => void;
}

export function NewPollCard({ onPollCreated }: NewPollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);

  function handleQuestionChanged(event: ChangeEvent<HTMLInputElement>) {
    setQuestion(event.target.value);
  }

  function handleOptionChanged(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newOptions = [...options];
    newOptions[index] = event.target.value;
    setOptions(newOptions);
  }

  function handleAddOption() {
    setOptions([...options, ""]);
  }

  function handleRemoveOption(index: number) {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  }

  function handleSavePoll() {
    if (question === "" || options.some((option) => option === "")) {
      toast.error("Por favor, preencha todas as opções e a pergunta.");
      return;
    }

    onPollCreated(question, options);

    setQuestion("");
    setOptions(["", ""]);

    api.post("polls", {
      title: question,
      options,
    });

    toast.success("Enquete criada com sucesso!");
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col gap-3 text-left bg-slate-700 p-5 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <button className="text-sm font-medium text-slate-200">
          Adicionar enquete
        </button>

        <p className="text-sm leading-6 text-slate-400">
          Crie uma enquete do seu jeito!
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className=" flex flex-1 flex-col h-full">
            <div className="flex flex-col gap-3 p-5">
              <label>Pergunta</label>
              <input
                type="text"
                className="text-sm leading-6 p-1.5 text-slate-400 bg-slate-800 resize-none outline-none rounded-md"
                value={question}
                onChange={handleQuestionChanged}
              />
            </div>

            <div className="flex flex-1 flex-col gap-4 px-5 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
              <label>Opções</label>
              {options.map((option, index) => (
                <div key={index} className="flex space-x-4">
                  <input
                    type="text"
                    className="w-full text-sm leading-6 p-1.5 text-slate-400 bg-slate-800 resize-none outline-none rounded-md"
                    maxLength={50}
                    value={option}
                    onChange={(event) => handleOptionChanged(index, event)}
                  />
                  <button
                    className="text-red-600  hover:text-red-400"
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mb-5 mx-auto"
                style={{ width: "130px" }}
                onClick={handleAddOption}
              >
                Adicionar opção
              </button>
            </div>

            <button
              type="button"
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
              onClick={handleSavePoll}
            >
              Salvar enquete
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
