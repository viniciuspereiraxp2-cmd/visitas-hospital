import React from "react";

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

//JavaScript

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

export default function SistemaVisitas() {
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

  const [nome, setNome] = React.useState("");
  const [data, setData] = React.useState("");
  const [horario, setHorario] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const [lista, setLista] = React.useState([]);

  React.useEffect(() => {
    const visitas = JSON.parse(localStorage.getItem("visitas")) || [];
    setLista(visitas);
  }, []);

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
        item.data === data && item.horario === horarioSelecionado
    ).length;

    return quantidade < horarioInfo.limite;
  };

  const salvarVisita = async (e) => {
    e.preventDefault();

    if (!nome || !data || !horario) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (!verificarDisponibilidade(horario)) {
      setMensagem(
        "Este horário já está reservado. Escolha outro horário ou outra data."
      );
      return;
    }

    const novaVisita = {
      nome,
      data,
      horario,
    };

    const novaLista = [...lista, novaVisita];

await addDoc(collection(db, "visitas"), novaVisita);
    setLista(novaLista);

    setMensagem("Visita agendada com sucesso.");

    setNome("");
    setData("");
    setHorario("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-2xl p-6">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-2">
          Agendamento de Visitas
        </h1>

        <p className="text-center text-gray-600 mb-6">
          Reserve um horário para visita.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
          <h2 className="font-bold mb-3 text-blue-700">
            Horários disponíveis
          </h2>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              Segunda a sexta → 14h às 14h30 (1 pessoa)
            </li>
            <li>
              Segunda a sexta → 14h30 às 15h (1 pessoa)
            </li>
            <li>
              Segunda a sexta → 20h às 20h30 (máximo 1 pessoa)
            </li>
            <li>
              Sábado e domingo → 11h às 11h30 (1 pessoa)
            </li>
            <li>
              Sábado e domingo → 11h30 às 12h (1 pessoa)
            </li>
          </ul>
        </div>

        <form onSubmit={salvarVisita} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border rounded-2xl p-3"
              placeholder="Digite o nome"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Data da visita
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                setHorario("");
              }}
              className="w-full border rounded-2xl p-3"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Horário</label>
            <select
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full border rounded-2xl p-3"
            >
              <option value="">Selecione</option>

              {obterHorarios().map((item) => {
                const quantidade = lista.filter(
                  (visita) =>
                    visita.data === data &&
                    visita.horario === item.horario
                ).length;

                const disponivel = quantidade < item.limite;

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
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-bold py-3 rounded-2xl"
          >
            Reservar visita
          </button>
        </form>

        {mensagem && (
          <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-2xl text-center font-medium">
            {mensagem}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Reservas realizadas
          </h2>

          {lista.length === 0 ? (
            <p className="text-gray-500">Nenhuma reserva cadastrada.</p>
          ) : (
            <div className="space-y-3">
              {lista.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{item.nome}</p>
                    <p className="text-sm text-gray-600">
                      {item.data} - {item.horario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        </div>
    </div>
  );
}

