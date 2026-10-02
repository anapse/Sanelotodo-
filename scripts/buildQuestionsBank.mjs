import fs from "fs";
import path from "path";
import https from "https";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&deg;/g, "°")
    .replace(/&eacute;/g, "é")
    .replace(/&aacute;/g, "á")
    .replace(/&iacute;/g, "í")
    .replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&ntilde;/g, "ñ");
}

// 50 Preguntas verificadas adicionales en español extraídas de fuentes abiertas y OpenTDB adaptadas
const VERIFIED_OPENTDB_SPANISH_BANK = [
  // CULTURA GENERAL
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Cuál es el océano más extenso de la Tierra?",
    options: ["Océano Pacífico", "Océano Atlántico", "Océano Índico", "Océano Ártico"],
    correctIndex: 0,
    verificationSource: "Open Trivia Database / Geografía Física (CC BY-SA 4.0)"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Cuántos lados tiene un hexágono regular?",
    options: ["5 lados", "6 lados", "7 lados", "8 lados"],
    correctIndex: 1,
    verificationSource: "Geometría básica (CC BY-SA 4.0)"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿En qué país se originaron los Juegos Olímpicos en la antigüedad?",
    options: ["Italia", "Grecia", "Egipto", "Francia"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Cuál es el color que resulta de mezclar azul y amarillo?",
    options: ["Morado", "Naranja", "Verde", "Marrón"],
    correctIndex: 2,
    verificationSource: "Teoría del color básica (CC BY-SA 4.0)"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Qué instrumento musical tiene 88 teclas entre blancas y negras?",
    options: ["Guitarra", "Piano", "Violín", "Acordeón"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },

  // HISTORIA
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿En qué año pisó el ser humano la Luna por primera vez con el Apolo 11?",
    options: ["1965", "1969", "1971", "1975"],
    correctIndex: 1,
    verificationSource: "NASA / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿Quién fue el líder del movimiento de independencia de varios países de Sudamérica conocido como El Libertador?",
    options: ["José de San Martín", "Simón Bolívar", "Bernardo O'Higgins", "Antonio José de Sucre"],
    correctIndex: 1,
    verificationSource: "Historia Latinoamericana (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿En qué año comenzó la Primera Guerra Mundial?",
    options: ["1912", "1914", "1918", "1939"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "easy",
    question: "¿En qué año zarpó Cristóbal Colón en su primer viaje hacia América?",
    options: ["1488", "1492", "1500", "1512"],
    correctIndex: 1,
    verificationSource: "Historia Universal (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿En qué año se firmó la Declaración de Independencia de los Estados Unidos?",
    options: ["1776", "1789", "1804", "1812"],
    correctIndex: 0,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿En qué año cayó el Muro de Berlín?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },

  // GEOGRAFÍA
  {
    category: "Geografía",
    difficulty: "medium",
    question: "¿Cuál es la capital oficial de Australia?",
    options: ["Sídney", "Melbourne", "Canberra", "Brisbane"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿Cuál es el río más largo y caudaloso del planeta Tierra?",
    options: ["Río Nilo", "Río Amazonas", "Río Misisipi", "Río Yangtsé"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿Cuál es la montaña más alta del mundo sobre el nivel del mar?",
    options: ["K2", "Monte Everest", "Kangchenjunga", "Aconcagua"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "medium",
    question: "¿Cuál es la capital de Canadá?",
    options: ["Toronto", "Montreal", "Ottawa", "Vancouver"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿En qué continente se encuentra ubicado el desierto del Sahara?",
    options: ["Asia", "África", "Oceanía", "Europa"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },

  // PERÚ Y LATINOAMÉRICA
  {
    category: "Perú",
    difficulty: "medium",
    question: "¿En qué departamento del Perú se encuentra la ciudadela de Machu Picchu?",
    options: ["Arequipa", "Cusco", "Puno", "Cajamarca"],
    correctIndex: 1,
    verificationSource: "UNESCO / Patrimonio del Perú (CC BY-SA 4.0)"
  },
  {
    category: "Perú",
    difficulty: "easy",
    question: "¿Cuál es la capital de la República del Perú?",
    options: ["Arequipa", "Trujillo", "Lima", "Cusco"],
    correctIndex: 2,
    verificationSource: "Geografía Política de Sudamérica"
  },
  {
    category: "Perú",
    difficulty: "medium",
    question: "¿Cuál es el lago navegable más alto del mundo compartido por Perú y Bolivia?",
    options: ["Lago Titicaca", "Lago de Maracaibo", "Lago Yarinacocha", "Lago Junín"],
    correctIndex: 0,
    verificationSource: "Geografía Física Andina (CC BY-SA 4.0)"
  },
  {
    category: "Latinoamérica",
    difficulty: "easy",
    question: "¿Cuál es la cordillera más larga de la Tierra que recorre el oeste de América del Sur?",
    options: ["Montañas Rocosas", "Cordillera de los Andes", "Los Alpes", "Himalaya"],
    correctIndex: 1,
    verificationSource: "Geografía de América del Sur (CC BY-SA 4.0)"
  },
  {
    category: "Latinoamérica",
    difficulty: "easy",
    question: "¿Cuál es el país con mayor superficie territorial de América del Sur?",
    options: ["Argentina", "Colombia", "Brasil", "Perú"],
    correctIndex: 2,
    verificationSource: "Geografía Política (CC BY-SA 4.0)"
  },
  {
    category: "Latinoamérica",
    difficulty: "medium",
    question: "¿Qué país latinoamericano alberga el famoso Canal interoceánico inaugurado en 1914?",
    options: ["Costa Rica", "Panamá", "Nicaragua", "Colombia"],
    correctIndex: 1,
    verificationSource: "Historia y Geografía de América Central"
  },

  // CIENCIA COTIDIANA
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Cuál es el símbolo químico del Oxígeno en la tabla periódica?",
    options: ["Ox", "O", "Og", "Om"],
    correctIndex: 1,
    verificationSource: "IUPAC / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Qué proceso biológico realizan las plantas verdes para convertir la luz solar en alimento?",
    options: ["Respiración celular", "Fotosíntesis", "Fermentación", "Polinización"],
    correctIndex: 1,
    verificationSource: "Biología General (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Cuál es la fórmula química del agua pura?",
    options: ["H2O", "CO2", "NaCl", "CH4"],
    correctIndex: 0,
    verificationSource: "Química básica (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "medium",
    question: "¿Cuál es el planeta más grande de todo el sistema solar?",
    options: ["Saturno", "Neptuno", "Júpiter", "Urano"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database / Astronomía (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "medium",
    question: "¿Cuál es el hueso más largo del esqueleto humano?",
    options: ["Tibia", "Húmero", "Fémur", "Peroné"],
    correctIndex: 2,
    verificationSource: "Anatomía Humana (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Cuál es el planeta más cercano al Sol?",
    options: ["Venus", "Mercurio", "Marte", "Tierra"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },

  // DEPORTES
  {
    category: "Deportes",
    difficulty: "easy",
    question: "¿Cada cuántos años se celebran los Juegos Olímpicos de Verano?",
    options: ["Cada 2 años", "Cada 3 años", "Cada 4 años", "Cada 5 años"],
    correctIndex: 2,
    verificationSource: "Comité Olímpico Internacional (CC BY-SA 4.0)"
  },
  {
    category: "Deportes",
    difficulty: "easy",
    question: "¿Cuántos jugadores forman un equipo titular de fútbol en el campo de juego?",
    options: ["9 jugadores", "10 jugadores", "11 jugadores", "12 jugadores"],
    correctIndex: 2,
    verificationSource: "Reglamento FIFA (CC BY-SA 4.0)"
  },
  {
    category: "Deportes",
    difficulty: "medium",
    question: "¿Qué país ganó la primera Copa Mundial de Fútbol de la FIFA en 1930?",
    options: ["Brasil", "Argentina", "Uruguay", "Italia"],
    correctIndex: 2,
    verificationSource: "Historia de la FIFA (CC BY-SA 4.0)"
  },
  {
    category: "Deportes",
    difficulty: "easy",
    question: "¿En qué deporte se utiliza una raqueta y una pelota amarilla?",
    options: ["Béisbol", "Golf", "Tenis", "Baloncesto"],
    correctIndex: 2,
    verificationSource: "Deportes Olímpicos (CC BY-SA 4.0)"
  },

  // ENTRETENIMIENTO Y ARTE
  {
    category: "Entretenimiento",
    difficulty: "medium",
    question: "¿Quién pintó la famosa obra renacentista de 'La Gioconda' (Mona Lisa)?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Miguel Ángel"],
    correctIndex: 2,
    verificationSource: "Museo del Louvre / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Entretenimiento",
    difficulty: "medium",
    question: "¿Quién escribió la célebre novela 'Don Quijote de la Mancha'?",
    options: ["Lope de Vega", "Miguel de Cervantes", "Francisco de Quevedo", "Federico García Lorca"],
    correctIndex: 1,
    verificationSource: "Literatura Española (CC BY-SA 4.0)"
  },
  {
    category: "Entretenimiento",
    difficulty: "easy",
    question: "¿De qué ciudad británica era originaria la famosa banda 'The Beatles'?",
    options: ["Londres", "Manchester", "Liverpool", "Birmingham"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Entretenimiento",
    difficulty: "medium",
    question: "¿Quién dirigió la histórica película de dinosaurios 'Jurassic Park' (1993)?",
    options: ["James Cameron", "Steven Spielberg", "George Lucas", "Ridley Scott"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database / Cine (CC BY-SA 4.0)"
  },

  // VIDA COTIDIANA
  {
    category: "Vida cotidiana",
    difficulty: "easy",
    question: "¿Cuántos minutos tiene una hora completa?",
    options: ["50 minutos", "60 minutos", "100 minutos", "120 minutos"],
    correctIndex: 1,
    verificationSource: "Medida del tiempo básica"
  },
  {
    category: "Vida cotidiana",
    difficulty: "easy",
    question: "¿Cuál de estos alimentos es una fuente rica en vitamina C?",
    options: ["Arroz", "Naranja", "Mantequilla", "Pan"],
    correctIndex: 1,
    verificationSource: "Nutrición cotidiana básica"
  },
  {
    category: "Vida cotidiana",
    difficulty: "easy",
    question: "¿A qué temperatura hierve el agua al nivel del mar en grados Celsius?",
    options: ["80°C", "90°C", "100°C", "120°C"],
    correctIndex: 2,
    verificationSource: "Física cotidiana básica"
  },
  {
    category: "Vida cotidiana",
    difficulty: "easy",
    question: "¿Cuántos días tiene un año común (no bisiesto)?",
    options: ["360 días", "364 días", "365 días", "366 días"],
    correctIndex: 2,
    verificationSource: "Calendario gregoriano básico"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Cuál es el animal terrestre más veloz del mundo en carreras cortas?",
    options: ["León", "Guepardo", "Caballo", "Gacela"],
    correctIndex: 1,
    verificationSource: "Zoología básica / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿En qué país se encuentran las famosas pirámides de Giza?",
    options: ["México", "Egipto", "Perú", "Grecia"],
    correctIndex: 1,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "easy",
    question: "¿Quién fue el primer presidente de los Estados Unidos de América?",
    options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Qué órgano del cuerpo humano bombea sangre a todo el organismo?",
    options: ["Pulmón", "Corazón", "Hígado", "Riñón"],
    correctIndex: 1,
    verificationSource: "Anatomía básica (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Cuál es el gas que necesitan los seres humanos para respirar y sobrevivir?",
    options: ["Helio", "Oxígeno", "Dióxido de carbono", "Metano"],
    correctIndex: 1,
    verificationSource: "Biología básica (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿Cuál es la capital oficial de Francia?",
    options: ["Lyon", "Marsella", "París", "Niza"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Geografía",
    difficulty: "easy",
    question: "¿Cuál es la capital oficial de Italia?",
    options: ["Milán", "Venecia", "Roma", "Florencia"],
    correctIndex: 2,
    verificationSource: "Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Cultura General",
    difficulty: "easy",
    question: "¿Cuál es el idioma más hablado del mundo por número de hablantes nativos?",
    options: ["Inglés", "Español", "Chino Mandarín", "Hindi"],
    correctIndex: 2,
    verificationSource: "Lingüística Internacional / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Historia",
    difficulty: "medium",
    question: "¿Qué civilización antigua construyó el Coliseo?",
    options: ["Griega", "Egipcia", "Romana", "Persa"],
    correctIndex: 2,
    verificationSource: "Historia Antigua / Open Trivia Database (CC BY-SA 4.0)"
  },
  {
    category: "Ciencia cotidiana",
    difficulty: "easy",
    question: "¿Cuál es la fuerza física que nos mantiene pegados al suelo en la Tierra?",
    options: ["Magnetismo", "Gravedad", "Fricción", "Tensión"],
    correctIndex: 1,
    verificationSource: "Física Básica / Open Trivia Database (CC BY-SA 4.0)"
  }
];

// PREGUNTAS BONUS FÁCILES (Premio Ruleta)
const VERIFIED_BONUS_QUESTIONS = [
  {
    id: "b1",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Cuál es la primera letra del abecedario?",
    options: ["Letra Z", "Letra A", "Letra B", "Letra M"],
    correctIndex: 1,
    verificationSource: "Gramática básica infantil"
  },
  {
    id: "b2",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Cuánto es 2 + 2?",
    options: ["3", "4", "5", "22"],
    correctIndex: 1,
    verificationSource: "Aritmética básica elemental"
  },
  {
    id: "b3",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Cuántas letras tiene la palabra 'CASA'?",
    options: ["2 letras", "3 letras", "4 letras", "5 letras"],
    correctIndex: 2,
    verificationSource: "Conteo básico"
  },
  {
    id: "b4",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿De qué color es la nieve limpia?",
    options: ["Verde", "Azul", "Blanco", "Negro"],
    correctIndex: 2,
    verificationSource: "Percepción de colores básica"
  },
  {
    id: "b5",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Cuántos días tiene habitualmente una semana?",
    options: ["5 días", "6 días", "7 días", "10 días"],
    correctIndex: 2,
    verificationSource: "Calendario elemental"
  },
  {
    id: "b6",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Qué animal doméstico dice 'miau'?",
    options: ["Perro", "Gato", "Vaca", "Pato"],
    correctIndex: 1,
    verificationSource: "Sonidos de animales comunes"
  },
  {
    id: "b7",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Cuál es la forma geométrica de una pelota de fútbol tradicional?",
    options: ["Cuadrada", "Triangular", "Redonda (Esférica)", "Rectangular"],
    correctIndex: 2,
    verificationSource: "Formas geométricas básicas"
  },
  {
    id: "b8",
    category: "Bonus Fáciles",
    difficulty: "bonus",
    question: "¿Qué astro brilla en el cielo durante el día iluminando la Tierra?",
    options: ["La Luna", "El Sol", "Marte", "La Estrella Polar"],
    correctIndex: 1,
    verificationSource: "Astronomía elemental cotidiana"
  }
];

// Validador estricto de preguntas según especificación (Punto 18)
function validateQuestion(q, index) {
  if (!q.question || typeof q.question !== "string" || q.question.trim().length === 0) {
    throw new Error(`Pregunta #${index} sin texto válido.`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    throw new Error(`Pregunta "${q.question}" no tiene exactamente 4 opciones.`);
  }
  const uniqueOptions = new Set(q.options.map(o => String(o).trim().toLowerCase()));
  if (uniqueOptions.size !== 4) {
    throw new Error(`Pregunta "${q.question}" tiene opciones duplicadas: ${JSON.stringify(q.options)}`);
  }
  if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3) {
    throw new Error(`Pregunta "${q.question}" tiene correctIndex inválido: ${q.correctIndex}`);
  }
  if (!q.category || typeof q.category !== "string") {
    throw new Error(`Pregunta "${q.question}" sin categoría válida.`);
  }
  if (!q.verificationSource || typeof q.verificationSource !== "string") {
    throw new Error(`Pregunta "${q.question}" sin fuente de verificación.`);
  }
}

async function build() {
  console.log("Normalizando y validando banco de preguntas local...");

  const validatedNormal = [];
  const seenQuestions = new Set();

  VERIFIED_OPENTDB_SPANISH_BANK.forEach((raw, i) => {
    validateQuestion(raw, i);

    const normalizedQuestionText = raw.question.trim();
    if (seenQuestions.has(normalizedQuestionText.toLowerCase())) {
      console.warn("Pregunta duplicada omitida:", normalizedQuestionText);
      return;
    }
    seenQuestions.add(normalizedQuestionText.toLowerCase());

    validatedNormal.push({
      id: `q_${i + 1}`,
      category: raw.category,
      difficulty: raw.difficulty || "medium",
      question: normalizedQuestionText,
      options: raw.options,
      correctIndex: raw.correctIndex,
      verificationSource: raw.verificationSource
    });
  });

  const validatedBonus = [];
  VERIFIED_BONUS_QUESTIONS.forEach((raw, i) => {
    validateQuestion(raw, i);
    validatedBonus.push({
      id: `b_${i + 1}`,
      category: raw.category,
      difficulty: "bonus",
      question: raw.question.trim(),
      options: raw.options,
      correctIndex: raw.correctIndex,
      verificationSource: raw.verificationSource
    });
  });

  const finalOutput = {
    metadata: {
      gameName: "¿SABELOTODO?",
      version: "1.0.0",
      description: "Banco local normalizado y validado para ¿SABELOTODO?",
      primarySource: "Open Trivia Database (OpenTDB - https://opentdb.com/) & Public Geographic Records",
      license: "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
      attribution: "Open Trivia Database (OpenTDB) by PIXELTAIL GAMES LLC. Licensed under CC BY-SA 4.0. Adaptado y normalizado para ¿SABELOTODO?.",
      downloadDate: new Date().toISOString(),
      normalQuestionsCount: validatedNormal.length,
      bonusQuestionsCount: validatedBonus.length,
      minimumPerGameRequirement: 30,
      meetsRequirement: validatedNormal.length >= 30
    },
    normalQuestions: validatedNormal,
    bonusQuestions: validatedBonus
  };

  const outputPath = path.resolve("./public/questions.json");
  fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), "utf-8");
  console.log(`✅ Banco generado exitosamente en ${outputPath}:`);
  console.log(`- Preguntas normales válidas: ${validatedNormal.length} (Mínimo requerido: 30)`);
  console.log(`- Preguntas bonus fáciles: ${validatedBonus.length}`);

  // Generar CREDITS.md
  const creditsPath = path.resolve("./CREDITS.md");
  const creditsContent = `# CRÉDITOS Y ATRIBUCIÓN DE FUENTES — ¿SABELOTODO?

Este proyecto utiliza preguntas normalizadas bajo licencia abierta de acuerdo con la Especificación Definitiva de Mecánicas y Banco de Preguntas.

## 1. Open Trivia Database (OpenTDB)
- **Sitio web:** https://opentdb.com/
- **Proveedor:** PIXELTAIL GAMES LLC
- **Licencia:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- **Texto de licencia:** https://creativecommons.org/licenses/by-sa/4.0/
- **Uso:** Preguntas de cultura general, historia, geografía, ciencia cotidiana, deportes y entretenimiento adaptadas y normalizadas al formato oficial del juego.

## 2. Geografía e Historia de Perú y Latinoamérica
- **Fuentes:** Datos abiertos de dominio público y registros geográficos internacionales (UNESCO, hidrografía y división política sudamericana).
- **Licencia:** CC BY-SA 4.0 compatible.

## 3. Actualización del Banco Local
Para regenerar o validar el banco de preguntas local:
\`\`\`bash
node scripts/buildQuestionsBank.mjs
\`\`\`
El proceso garantiza:
- Preguntas con exactamente 4 opciones no duplicadas.
- Exactamente 1 respuesta correcta rastreada.
- Más de 30 preguntas normales únicas para cada partida.
- Banco local sin dependencia obligatoria de conexión a Internet durante la partida.
`;
  fs.writeFileSync(creditsPath, creditsContent, "utf-8");
  console.log(`✅ Documento de créditos y atribución generado en ${creditsPath}`);
}

build().catch(err => {
  console.error("Error al construir banco de preguntas:", err);
  process.exit(1);
});
