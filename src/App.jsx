import React from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function App() {
  const [nome, setNome] = React.useState("");
  const [data, setData] = React.useState("");
  const [horario, setHorario] = React.useState("");
  const [mensagem, setMensagem] = React.useState("");
  const [lista, setLista] = React.useState([]);

  const horariosSemana = [
    { horario: "14:00 às 14:30", limite: 1 },
    { horario: "14:30 às 15:00", limite: 1 },
    { horario: "20:00 às 20:30", limite: 1 },
  ];

  const horariosFimSemana = [
    { horario: "11:00 às 11:30", limite: 1 },
    { horario: "11:30 às 12:00", limite: 1 },
  ];

  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  React.useEffect(() => {
    carregarVisitas();
  }, []);

  async function carregarVisitas() {
    const querySnapshot = await getDocs(collection(db, "visitas"));

    const visitas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

  // 🔥 BLOQUEIO SEXTA A PARTIR DE 29/05/2026
  const verificarDisponibilidade = (
    horarioSelecionado,
    dataSelecionada
  ) => {

    const dataAtual = new Date(
      dataSelecionada + "T00:00:00"
    );

    const sextaBloqueada =
      dataAtual >= new Date("2026-05-29T00:00:00") &&
      dataAtual.getDay() === 5 &&
      (
        horarioSelecionado === "14:00 às 14:30" ||
        horarioSelecionado === "14:30 às 15:00"
      );

    if (sextaBloqueada) {
      return false;
    }

    const horarios = obterHorarios();

    const horarioInfo = horarios.find(
      (item) => item.horario === horarioSelecionado
    );

    if (!horarioInfo) return false;

    const quantidade = lista.filter(
      (item) =>
        item.data === dataSelecionada &&
        item.horario === horarioSelecionado
    ).length;

    return quantidade < horarioInfo.limite;
  };

  const salvarVisita = async (e) => {
    e.preventDefault();

    if (!nome || !data || !horario) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (!verificarDisponibilidade(horario, data)) {
      setMensagem(
        "Horário bloqueado para Adriana."
      );
      return;
    }

    const novaVisita = {
      nome,
      data,
      horario,
    };

    await addDoc(collection(db, "visitas"), novaVisita);

    await carregarVisitas();

    setMensagem("Visita agendada com sucesso.");

    setNome("");
    setData("");
    setHorario("");
  };

  // 📅 AGRUPAR POR DIA
  const agruparPorDia = () => {
    const agrupado = {};

    lista.forEach((item) => {
      const dataObj = new Date(item.data + "T00:00:00");
      const diaNome = diasSemana[dataObj.getDay()];

      if (!agrupado[diaNome]) {
        agrupado[diaNome] = [];
      }

      agrupado[diaNome].push(item);
    });

    return agrupado;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Agendamento de Visitas
        </h1>

        <form onSubmit={salvarVisita} className="space-y-4">

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

              const dataAtual = data
                ? new Date(data + "T00:00:00")
                : null;

              const sextaBloqueada =
                dataAtual &&
                dataAtual >= new Date("2026-05-29T00:00:00") &&
                dataAtual.getDay() === 5 &&
                (
                  item.horario === "14:00 às 14:30" ||
                  item.horario === "14:30 às 15:00"
                );

              const quantidade = lista.filter(
                (visita) =>
                  visita.data === data &&
                  visita.horario === item.horario
              ).length;

              const disponivel =
                quantidade < item.limite &&
                !sextaBloqueada;

              return (
                <option
                  key={item.horario}
                  value={item.horario}
                  disabled={!disponivel}
                >
                  {item.horario}

                  {!disponivel && !sextaBloqueada
                    ? " - LOTADO"
                    : ""}

                  {sextaBloqueada
                    ? " - Adriana"
                    : ""}
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
          <div className="mt-4 text-center font-bold">
            {mensagem}
          </div>
        )}

        {/* 📅 AGENDA SEMANAL */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Agenda da Semana
          </h2>

          {lista.length === 0 ? (
            <p>Nenhum agendamento ainda.</p>
          ) : (
            Object.entries(agruparPorDia()).map(([dia, itens]) => (
              <div key={dia} className="mb-4">
                <h3 className="font-bold text-lg mb-2">
                  {dia}
                </h3>

                {itens.map((item, index) => (
                  <div
                    key={index}
                    className="border p-2 rounded mb-2"
                  >
                    <strong>{item.nome}</strong>
                    <p>
                      {item.data} - {item.horario}
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}