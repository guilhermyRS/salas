const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'room_management',
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Função auxiliar para processar dias_semana
const processDiasSemana = (dias_semana) => {
  if (typeof dias_semana === 'string') {
    try {
      return JSON.parse(dias_semana);
    } catch (error) {
      return Array.isArray(dias_semana) ? dias_semana : [dias_semana];
    }
  }
  return Array.isArray(dias_semana) ? dias_semana : [];
};

// Rota GET - Buscar todas as salas
app.get('/api/rooms', (req, res) => {
  const query = 'SELECT * FROM rooms ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar salas:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    
    const processedResults = results.map(room => {
      try {
        return {
          ...room,
          dias_semana: processDiasSemana(room.dias_semana),
          status: Boolean(room.status)
        };
      } catch (error) {
        console.error('Erro ao processar sala:', error);
        return {
          ...room,
          dias_semana: [],
          status: true
        };
      }
    });
    
    res.json(processedResults);
  });
});

const requestCache = new Map();

// Rota POST - Criar sala
app.post('/api/rooms', (req, res) => {
  console.log('Dados recebidos:', req.body);
  
  // Criar uma chave única baseada nos dados da sala
  const requestKey = JSON.stringify(req.body);
  const now = Date.now();
  
  // Verificar se existe uma requisição idêntica recente (dentro de 2 segundos)
  if (requestCache.has(requestKey)) {
    const lastRequest = requestCache.get(requestKey);
    if (now - lastRequest < 2000) { // 2 segundos
      console.log('Requisição duplicada detectada e ignorada');
      return res.status(200).json({ 
        message: 'Sala já está sendo processada' 
      });
    }
  }
  
  // Armazenar a requisição no cache
  requestCache.set(requestKey, now);
  
  // Limpar entradas antigas do cache (mais de 5 segundos)
  for (const [key, timestamp] of requestCache.entries()) {
    if (now - timestamp > 5000) {
      requestCache.delete(key);
    }
  }

  const {
    unidade,
    curso,
    periodo,
    disciplina,
    docente,
    dias_semana,
    turno,
    sala_aula,
    status
  } = req.body;

  // Garante que dias_semana seja um JSON válido
  const processedDiasSemana = JSON.stringify(Array.isArray(dias_semana) ? dias_semana : []);

  const query = `
    INSERT INTO rooms 
    (unidade, curso, periodo, disciplina, docente, dias_semana, turno, sala_aula, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [unidade, curso, periodo, disciplina, docente, processedDiasSemana, turno, sala_aula, status || true],
    (err, result) => {
      if (err) {
        console.error('Erro ao criar sala:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ 
        id: result.insertId,
        message: 'Sala criada com sucesso' 
      });
    }
  );
});


// Rota PUT - Atualizar sala
app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const {
    unidade,
    curso,
    periodo,
    disciplina,
    docente,
    dias_semana,
    turno,
    sala_aula,
    status
  } = req.body;

  // Garante que dias_semana seja um JSON válido
  const processedDiasSemana = JSON.stringify(Array.isArray(dias_semana) ? dias_semana : []);

  const query = `
    UPDATE rooms 
    SET unidade = ?, 
        curso = ?, 
        periodo = ?, 
        disciplina = ?, 
        docente = ?, 
        dias_semana = ?, 
        turno = ?, 
        sala_aula = ?,
        status = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [unidade, curso, periodo, disciplina, docente, processedDiasSemana, turno, sala_aula, status, id],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar sala:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Sala atualizada com sucesso' });
    }
  );
});

// Rota PUT - Atualizar status
app.put('/api/rooms/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = 'UPDATE rooms SET status = ? WHERE id = ?';

  db.query(query, [status, id], (err) => {
    if (err) {
      console.error('Erro ao atualizar status:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Status atualizado com sucesso' });
  });
});

// Rota DELETE - Excluir sala
app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM rooms WHERE id = ?';

  db.query(query, [id], (err) => {
    if (err) {
      console.error('Erro ao excluir sala:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Sala excluída com sucesso' });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});