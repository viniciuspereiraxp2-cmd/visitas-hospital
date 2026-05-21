import { useState, useEffect } from "react";

export default function App() {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [nome, setNome] = useState("");
  const [lista, setLista] = useState([]);

  // carregar dados salvos
  useEffect(() => {
    const dadosSalvos = JSON.parse(localStorage.getItem("lista")) || [];
    setLista(dadosSalvos);
  }, []);

  // salvar no localStorage sempre que mudar lista
  useEffect(() => {
    localStorage.setItem("lista", JSON.stringify(lista));
  }, [lista]);

  function verificarDisponibilidade(horarioSelecionado, dataSelecionada) {
    const diaSemana = new Date(dataSelecionada + "T00:00:00").getDay();

    // Sexta-feira bloqueada (Adriana)
    if (
      diaSemana === 5 &&
      (horarioSelecionado === "14:00 às 14:30" ||
        horarioSelecionado === "14:30 às 15:00")
    ) {
      return false;
    }

    return true;
  }

  function reservar() {
    if (!nome || !data || !horario) {
      alert("Preencha todos os campos");
      return;
    }

    if (!verificarDisponibilidade(horario, data)) {
      alert("Horário bloqueado para este dia");
      return;
    }

    const novaReserva = {
      nome,
      data,
      horario,
    };

    setLista([...lista, novaReserva]);

    setNome("");
    setData("");
    setHorario("");
  }

  return (
    <div style={{ padding: 20, maxWidth: 500 }}>
      <h1>Sistema de Reservas</h1>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br /><br />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <br /><br />

      <select value={horario} onChange={(e) => setHorario(e.target.value)}>
        <option value="">Selecione horário</option>
        <option value="14:00 às 14:30">14:00 às 14:30</option>
        <option value="14:30 às 15:00">14:30 às 15:00</option>
        <option value="15:00 às 15:30">15:00 às 15:30</option>
      </select>

      <br /><br />

      <button onClick={reservar}>Reservar</button>

      {/* 🔥 AGENDA SEM ERRO */}
      <div style={{ marginTop: 30 }}>
        <h2>Agenda de Reservas</h2>

        {lista.length === 0 ? (
          <p>Nenhuma reserva ainda.</p>
        ) : (
          lista.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>{item.nome}</strong>
              <p>
                {item.data} - {item.horario}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}