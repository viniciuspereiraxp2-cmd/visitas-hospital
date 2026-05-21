```javascript
import React from "react";

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzFEnWx3SyOwuIGeDkqo6iHN0kFND_qPA",
  authDomain: "visitas-hospital-web.firebaseapp.com",
  projectId: "visitas-hospital-web",
  storageBucket: "visitas-hospital-web.firebasestorage.app",
  messagingSenderId: "935263770851",
  appId: "1:935263770851:web:34666ddf3feb3f18b38dd6",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default function App() {
  const [nome, setNome] = React.useState("");
  const [data, setData] = React.useState("");
  const [horario, setHorario] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const [lista, setLista] = React.useState([]);

  const horariosSemana = [
    {
      horario: "14:00 às 14:30",
      limite: 1,
    },
    {
      horario: "14:30 às 15:00",
      limite: 1,
    },
    {
      horario: "20:00 às 20:30",
      limite: 1,
    },
  ];

  const horariosFimSemana = [
    {
      horario: "11:00 às 11:30",
      limite: 1,
    },
    {
      horario: "11:30 às 12:00",
      limite: 1,
    },
  ];

  React.useEffect(() => {
    carregarVisitas();
  }, []);

  async function carregarVisitas() {
    const querySnapshot = await getDocs(collection(db, "visitas"));

    const visitas = [];

    querySnapshot.forEach((doc) => {
      visitas.push(doc.data());
    });

    setLista(visitas);
  }

  const obterHorarios = () => {
    if (!data) return [];

    const dia = new Date(data + "T00:00:00").getDay();

    if (dia === 0 || dia === 6) {
      return horariosFimSemana;
    }

    return horariosSemana;
  };

  const verificarDisponibilidade = (horarioSelecionado) => {
    const horarios = obterHorarios();

    const horarioInfo = horarios.find(
      (item) => item.horario === horarioSelecionado
    );

    if (!horarioInfo) return false;

    const quantidade = lista.filter(
      (item) =>
        item.data === data &&
        item.horario === horarioSelecionado
    ).length;

    return quantidade < horarioInfo.limite;
  };

  const diaSemana = new Date(data + "T00:00:00").getDay();

// Sexta-feira = 5
if (
  diaSemana === 5 &&
  (
    horarioSelecionado === "14:00 às 14:30" ||
    horarioSelecionado === "14:30 às 15:00"
  )
) {
  return false;
}

  const salvarVisita = async (e) => {
    e.preventDefault();

    if (!nome || !data || !horario) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (!verificarDisponibilidade(horario)) {
      setMensagem("Horário já reservado.");
      return;
    }

    const novaVisita = {
      nome,
      data,
      horario,
    };

    await addDoc(collection(db, "visitas"), novaVisita);

    setLista([...lista, novaVisita]);

    setMensagem("Visita agendada com sucesso.");

    setNome("");
    setData("");
    setHorario("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Agendamento de Visitas
        </h1>

        <form
          onSubmit={salvarVisita}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="date"
            value={data}
            onChange={(e) => {
              setData(e.target.value);
              setHorario("");
            }}
            className="w-full border p-3 rounded-xl"
          />

          <select
            value={horario}
            onChange={(e) => setHorario(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">
              Selecione o horário
            </option>

            {obterHorarios().map((item) => {
              const quantidade = lista.filter(
                (visita) =>
                  visita.data === data &&
                  visita.horario === item.horario
              ).length;

              const disponivel =
                quantidade < item.limite;

              return (
                <option
                  key={item.horario}
                  value={item.horario}
                  disabled={!disponivel}
                >
                  {item.horario}
                  {!disponivel ? " - LOTADO" : ""}
                </option>
              );
            })}
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            Reservar
          </button>
        </form>

        {mensagem && (
  <div className="mt-8">
    <h2 className="text-2xl font-bold mb-4">
      Agenda de Reservas
    </h2>

    {lista.length === 0 ? (
      <p>Nenhuma reserva ainda.</p>
    ) : (
      <div className="space-y-3">
        {lista.map((item, index) => (
          <div key={index} className="border p-3 rounded-xl">
            <p className="font-bold">{item.nome}</p>
            <p>{item.data} - {item.horario}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}