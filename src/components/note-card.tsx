import * as Dialog from "@radix-ui/react-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";
import { useState } from "react";

interface NoteCardProps {
  note: {
    id: string;
    created_at: Date;
    text: string;
  };
}

export function NoteCard({ note }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(note.text);

  async function handleUpdate() {
    try {
      await api.put(`/notes/${note.id}`, { text: editedText });
      toast.success("Nota editada com sucesso.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Ocorreu um erro ao editar a nota.");
    }
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja deletar esta nota?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/notes/${note.id}`);
      toast.success("Nota deletada com sucesso.");
    } catch (error) {
      toast.error("Ocorreu um erro ao deletar a nota.");
    }
  }

  function handleCloseNote() {
    setIsEditing(false);
  }

  return (
    <Dialog.Root onOpenChange={handleCloseNote}>
      <Dialog.Trigger className="rounded-md text-left bg-slate-800 flex flex-col p-5 gap-3 overflow-hidden relative hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-300">
          {formatDistanceToNow(note.created_at, {
            locale: ptBR,
            addSuffix: true,
          })}
        </span>

        <p
          className="text-sm leading-6 text-slate-400 "
          style={{
            maxWidth: "304px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {note.text}
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <div className="flex flex-1 flex-col gap-3 py-5 pl-5 pr-3">
            <span className="text-sm font-medium text-slate-300">
              {formatDistanceToNow(note.created_at, {
                locale: ptBR,
                addSuffix: true,
              })}
            </span>

            {isEditing ? (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-full text-sm leading-6 text-slate-400 bg-transparent outline-none resize-none pr-2 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent"
              />
            ) : (
              <textarea className="w-full h-full text-sm leading-6 text-slate-400 bg-transparent outline-none resize-none pr-2 overflow-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                {note.text}
              </textarea>
            )}
          </div>

          {!isEditing && (
            <button
              type="button"
              className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
              onClick={() => setIsEditing(true)}
            >
              Editar nota
            </button>
          )}

          {isEditing && (
            <div className="flex justify-center">
              <button
                type="button"
                className="w-full bg-lime-400 py-3 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                onClick={handleUpdate}
              >
                Salvar
              </button>
              <button
                type="button"
                className="w-full bg-red-500 py-3 text-center text-sm text-red-100 outline-none font-medium hover:bg-red-600"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="w-full bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group"
          >
            Deseja{" "}
            <span className="text-red-400 group-hover:underline">
              apagar essa nota
            </span>
            ?
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
