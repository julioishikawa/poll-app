import { useState, FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Mic, Trash } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

interface NewPollProps {
  onPollCreated: (question: string, options: string[]) => void;
}

const SpeechRecognitionAPI =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export function NewPollCard({ onPollCreated }: NewPollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isRecordingTitle, setIsRecordingTitle] = useState<boolean>(false);
  const [optionIndexRecording, setOptionIndexRecording] = useState<number>(-1);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  function handleAddOption() {
    setOptions([...options, ""]);
  }

  function handleRemoveOption(index: number) {
    // Verificar se a opção está sendo gravada
    if (index === optionIndexRecording) {
      toast.error(
        "Não é possível excluir a opção enquanto estiver sendo gravada por voz."
      );
    } else {
      // Remover a opção
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  }

  function handleSavePoll(event: FormEvent) {
    event.preventDefault();

    if (question === "" || options.some((option) => option === "")) {
      toast.error("Por favor, preencha todas as opções e a pergunta.");
      return;
    }

    try {
      onPollCreated(question, options);
      setQuestion("");
      setOptions(["", ""]);

      api.post("polls", {
        title: question,
        options,
      });

      toast.success("Enquete criada com sucesso!");
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao criar a nota:", error);
      toast.error(
        "Erro ao criar a nota. Por favor, tente novamente mais tarde."
      );
    }
  }

  const handleTitleRecognitionStart = () => {
    // Armazenar o valor atual do input
    const currentQuestion = question + " "; // Adiciona um espaço para separar o texto anterior do novo

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      const newQuestion = currentQuestion + transcription; // Adicionar ao valor armazenado
      setQuestion(newQuestion);
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
    };

    setIsRecordingTitle(true);
    setRecognition(recognition);
    recognition.start();
  };

  const handleOptionRecognitionStart = (index: number) => {
    // Armazenar o valor atual da opção
    const currentOption = options[index] + " "; // Adiciona um espaço para separar o texto anterior do novo

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      const newOptions = [...options];
      newOptions[index] = currentOption + transcription; // Adicionar ao valor armazenado
      setOptions(newOptions);
    };

    setOptionIndexRecording(index);
    setRecognition(recognition);
    recognition.start();
  };

  const handleTitleRecognitionToggle = () => {
    if (isRecordingTitle) {
      setIsRecordingTitle(false);
      recognition?.abort();
      setOptionIndexRecording(-1); // Resetar o índice de gravação de opção
    } else {
      // Cancelar a gravação da opção se estiver ocorrendo
      if (optionIndexRecording !== -1) {
        recognition?.abort();
        setOptionIndexRecording(-1);
      }
      handleTitleRecognitionStart();
    }
  };

  const handleOptionRecognitionToggle = (index: number) => {
    if (optionIndexRecording === index) {
      recognition?.abort();
      setOptionIndexRecording(-1); // Resetar o índice de gravação de opção
    } else {
      // Cancelar a gravação do título se estiver ocorrendo
      if (isRecordingTitle) {
        setIsRecordingTitle(false);
        recognition?.abort();
      }
      handleOptionRecognitionStart(index);
    }
  };

  function handleStopRecording() {
    if (recognition && recognition.continuous) {
      setIsRecordingTitle(false);
      recognition.stop();
      setRecognition(null);
      setOptionIndexRecording(-1);
    }
  }

  function handleCloseDialog() {
    setIsOpen(false);
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          handleStopRecording();
        }
      }}
    >
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
              <h2>Pergunta</h2>

              <div className="flex gap-4">
                <input
                  type="text"
                  className="w-full text-sm leading-6 p-1.5 text-slate-400 bg-slate-800 resize-none outline-none rounded-md"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  readOnly={isRecordingTitle}
                />
                <button
                  type="button"
                  onClick={handleTitleRecognitionToggle}
                  className={`text-sm text-lime-400 font-medium hover:text-lime-300 ${
                    isRecordingTitle ? "text-red-600" : ""
                  }`}
                >
                  {isRecordingTitle ? (
                    <div className="size-4 rounded-full bg-red-500 animate-pulse" />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
              </div>
            </div>

            <h2 className="px-5 pb-3">Opções</h2>
            <div className="flex flex-1 flex-col gap-4 px-5 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
              {options.map((option, index) => (
                <div key={index} className="flex space-x-4">
                  <input
                    type="text"
                    className="w-full text-sm leading-6 p-1.5 text-slate-400 bg-slate-800 resize-none outline-none rounded-md"
                    maxLength={50}
                    value={option}
                    onChange={(event) => {
                      const newOptions = [...options];
                      newOptions[index] = event.target.value;
                      setOptions(newOptions);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleOptionRecognitionToggle(index)}
                    className={`text-sm text-lime-400 font-medium hover:text-lime-300 ${
                      optionIndexRecording === index ? "text-red-600" : ""
                    }`}
                  >
                    {optionIndexRecording === index ? (
                      <div className="size-4 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <Mic size={16} />
                    )}
                  </button>

                  <button
                    className="text-red-600  hover:text-red-400"
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash size={16} />
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
