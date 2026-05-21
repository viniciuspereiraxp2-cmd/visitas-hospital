import { useState } from "react";

export default function App() {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [nome, setNome] = useState("");
  const [lista, setLista] = useState([]);
  const [mensagem, setMensagem] = useState("");

  function verificarDisponibilidade(horarioSelecionado, dataSelecionada) {
    const diaSemana = new Date(dataSelecionada + "T00:00:00").getDay();

    // 🔴 BLOQUEIO SEXTA 14H ÀS 15H
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
      setMensagem("Preencha todos os campos");
      return;
    }

    if (!verificarDisponibilidade(horario, data)) {
      setMensagem("Horário bloqueado na sexta-feira (14h às 15h)");
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
    setMensagem("Reserva realizada com sucesso!");
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
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
        <option value="15:30 às 16:00">15:30 às 16:00</option>
      </select>

      <br /><br />

      <button onClick={reservar}>Reservar</button>

      {/* 🔵 MENSAGEM */}
      {mensagem && (
        <p style={{ marginTop: 10, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}

      {/* 🔥 AGENDA ABAIXO DO BOTÃO */}
      <div style={{ marginTop: 30 }}>
        <h2>Agenda de Reservas da Semana</h2>

        {lista.length === 0 ? (
          <p>Nenhuma reserva ainda.</p>
        ) : (
          <div>
            {lista.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <p><strong>{item.nome}</strong></p>
                <p>{item.data} - {item.horario}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}