import { useEffect, useState, ChangeEvent } from "react";
import logo from "./assets/logo-nlw-expert.svg";
import { api } from "./services/api";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";
import { NewPollCard } from "./components/new-poll-card";
import { PollCard } from "./components/poll-card";
import { PollCardResults } from "./components/poll-card-results";

interface Note {
  id: string;
  created_at: Date;
  text: string;
}

interface Poll {
  id: string;
  created_at: Date;
  title: string;
  options: {
    id: string;
    title: string;
    score: number;
  }[];
}

export function App() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [pollResultsVisible, setPollResultsVisible] = useState<{
    [key: string]: boolean;
  }>({});
  const filteredNotes =
    search !== ""
      ? notes.filter((note) =>
          note.text.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : notes;

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  async function fetchNotes() {
    try {
      const res = await api.get("/notes");
      const notesData: Note[] = res.data;

      notesData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotes(notesData);
    } catch (e) {
      console.error("Error fetching notes:", e);
    }
  }

  async function fetchPolls() {
    try {
      const res = await api.get("/polls");
      const pollsData: Poll[] = res.data;

      pollsData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPolls(pollsData);
    } catch (e) {
      console.error("Erro ao buscar as enquetes:", e);
    }
  }

  function handleNoteCreated(text: string) {
    const newNote: Note = {
      id: crypto.randomUUID(),
      created_at: new Date(),
      text,
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setTimeout(fetchNotes, 100);
  }

  function handleRemoveNote(noteId: string) {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  }

  function handlePollCreated(title: string, options: string[]) {
    const newPoll: Poll = {
      id: crypto.randomUUID(),
      created_at: new Date(),
      title,
      options: options.map((option, index) => ({
        id: index.toString(),
        title: option,
        score: 0,
      })),
    };

    setPolls((prevPolls) => [newPoll, ...prevPolls]);
    setTimeout(fetchPolls, 100);
  }

  function handleRemovePoll(pollId: string) {
    setPolls((prevPolls) => prevPolls.filter((poll) => poll.id !== pollId));
  }

  function handleVoteSubmitted(pollId: string) {
    const updatedVotedPolls = [...votedPolls, pollId];
    setVotedPolls(updatedVotedPolls);
    localStorage.setItem("votedPolls", JSON.stringify(updatedVotedPolls));
    setPollResultsVisible({ ...pollResultsVisible, [pollId]: true });
  }

  function handleChangeVote(pollId: string) {
    setPollResultsVisible({ ...pollResultsVisible, [pollId]: false });
  }

  useEffect(() => {
    fetchNotes();
    fetchPolls();
  }, []);

  useEffect(() => {
    async function fetchVotedPolls() {
      try {
        const res = await api.get("/polls");
        const pollsData: Poll[] = res.data;

        pollsData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setPolls(pollsData);

        const votedPollsFromStorage = localStorage.getItem("votedPolls");
        if (votedPollsFromStorage) {
          const votedPolls: string[] = JSON.parse(votedPollsFromStorage);
          setVotedPolls(votedPolls);

          const updatedPollResultsVisible = { ...pollResultsVisible };
          votedPolls.forEach((votedPollId) => {
            updatedPollResultsVisible[votedPollId] = true;
          });
          setPollResultsVisible(updatedPollResultsVisible);
        }
      } catch (e) {
        console.error("Erro ao buscar as enquetes:", e);
      }
    }

    fetchVotedPolls();
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
        <NewNoteCard onNoteCreated={handleNoteCreated} />

        {filteredNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onUpdate={fetchNotes}
            onDelete={handleRemoveNote}
          />
        ))}
      </div>

      <div className="h-px bg-slate-700" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        <NewPollCard onPollCreated={handlePollCreated} />

        {polls.map((poll) => (
          <div
            className="grid grid-cols-1 gap-6 auto-rows-[250px]"
            key={poll.id}
          >
            {pollResultsVisible[poll.id] ? (
              <PollCardResults
                poll={poll}
                onChangeVote={() => handleChangeVote(poll.id)}
                onDelete={handleRemovePoll}
              />
            ) : (
              <PollCard
                poll={poll}
                onVoteSubmitted={() => handleVoteSubmitted(poll.id)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
