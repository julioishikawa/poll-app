import { ChangeEvent, useEffect, useState } from "react";
import logo from "../public/favicon.png";
import { api } from "./services/api";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";
import { NewPollCard } from "./components/new-poll-card";
import { PollCard } from "./components/poll-card";

interface Note {
  id: string;
  date: Date;
  content: string;
}

interface Poll {
  id: string;
  date: Date;
  title: string;
  options: {
    id: string;
    title: string;
    score: number;
  }[];
}

export function App() {
  const [search, setSearch] = useState("");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [notes, setNotes] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem("notes");

    if (notesOnStorage) {
      return JSON.parse(notesOnStorage);
    }

    return [];
  });

  async function fetchPolls() {
    try {
      const response = await api.get("/polls");
      const pollsData = response.data;

      // Verifica se a resposta contém os dados das enquetes
      if (Array.isArray(pollsData)) {
        setPolls(pollsData);
      } else {
        console.error(
          "Resposta da API não contém dados de enquetes:",
          pollsData
        );
      }
    } catch (error) {
      console.error("Erro ao buscar enquetes:", error);
    }
  }

  function onNoteCreated(content: string) {
    const newNote: Note = {
      id: crypto.randomUUID(),
      date: new Date(),
      content,
    };

    const updatedNotes = [newNote, ...notes];

    setNotes(updatedNotes);

    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }

  function onNoteDeleted(id: string) {
    const updatedNotes = notes.filter((note) => note.id !== id);

    setNotes(updatedNotes);

    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }

  function onPollCreated(title: string, options: string[]) {
    const newPoll: Poll = {
      id: crypto.randomUUID(),
      date: new Date(),
      title,
      options: options.map((option) => ({
        id: crypto.randomUUID(),
        title: option,
        score: 0,
      })),
    };

    setPolls([newPoll, ...polls]);

    console.log("Nova enquete criada:");
    console.log("Pergunta:", title);
    console.log("Opções:", options);

    return newPoll.id;
  }

  function onPollVoted(id: string) {
    // Lógica para fechar o PollCard e voltar para a tela inicial
    console.log(`Usuário votou na enquete com ID ${id}`);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const filteredNotes =
    search !== ""
      ? notes.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : notes;

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <img src={logo} alt="NLW Expert" />

      <form className="w-full">
        <input
          type="text"
          placeholder="Busque em suas notas..."
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-state-500"
          onChange={handleSearch}
        />
      </form>

      <div className="h-px bg-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        <NewNoteCard onNoteCreated={onNoteCreated} />

        {filteredNotes.map((note) => (
          <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
        ))}
      </div>

      <div className="h-px bg-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        <NewPollCard onPollCreated={onPollCreated} />

        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            onVoteSubmit={() => onPollVoted(poll.id)}
          />
        ))}
      </div>
    </div>
  );
}
