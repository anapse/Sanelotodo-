import fs from "fs";
import path from "path";

const questionsPath = path.resolve("./public/questions.json");
const data = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
const originalQuestions = data.normalQuestions;

console.log(`Clasificando con precisión las ${originalQuestions.length} preguntas normales...`);

// 1. DICCIONARIOS Y EXPRESIONES REGULARES DE ALTA PRECISIÓN

// EXPERT: Conocimiento hiperespecífico, fechas de parques/eventos oscuros, abreviaturas médicas, fobias raras, etc.
const EXPERT_PATTERNS = [
  /grados.*minutos.*latitud/i,
  /segundo más alto|tercer más alto/i,
  /términos médicos|lenguaje médico|término médico|abreviatura médica|médico, ¿qué es/i,
  /¿qué es un (cva|aka|ekg|ecg|tbi|mri|copd|gerd)/i,
  /¿qué es la .*fobia\b/i,
  /alektorofobia|aracnofobia|claustrofobia|acrofobia|cinofobia/i,
  /en qué año abrió|en qué año cerró|lema de /i,
  /indiana beach|seaworld|cedar point|six flags/i,
  /bat-hound|juez dredd|linterna verde|personaje secundario/i,
  /unificó el alto y el bajo egipto|primera colonia de ultramar/i,
  /¿qué significa la palabra "(hipopótamo|pingüino)"/i,
  /raza de caballo real|boca de algodón/i,
  /constante de planck|número cuántico|bosón de higgs|ciclo de krebs|glucólisis/i,
  /en qué año nació|en qué año murió|en qué fecha exacta/i,
  /tratado de tordesillas|tratado de utrecht|tratado de westfalia/i,
  /capital de (kazajistán|mongolia|madagascar|islandia|tuvalu|nauru|kiribati|palaos|vanuatu|eritrea|surinam|guyana|belice|bhután|yibuti|lesoto|suazilandia|comoras)/i,
  /estrecho de malaca|estrecho de ormuz|fosa de las marianas|golfo de adén/i,
  /¿cuál se encontraría a/i,
  /año de fundación de|en qué año se fundó/i
];

// HARD: Conocimiento especializado o secundario
const HARD_PATTERNS = [
  /en qué año (comenzó|terminó|fue coronado|se firmó|ocurrió|se descubrió|se libró)/i,
  /año en que|en qué década/i,
  /faraón|dinastía|emperador romano|guerras púnicas|batalla de|asedio de/i,
  /célula|mitocondria|ribosoma|adn|arn|ácido|enzima|proteína|hormona|tiroides/i,
  /tabla periódica|número atómico|elemento químico|isótopo|valencia|electronegatividad/i,
  /era geológica|jurásico|cretácico|triásico|paleozoico|cámbrico/i,
  /satélite de júpiter|satélite de saturno|titán|europa|ganímedes|calisto/i,
  /desierto de atacama|desierto de gobi|lago baikal|río yangtsé|fosa/i,
  /premio nobel|premio oscar|premio grammy|director de la película/i,
  /cuál de estos no|cuál no es|no pertenece|excepto|falso/i,
  /¿quién inventó el/i,
  /origen étnico de/i,
  /capital de (canadá|australia|afganistán|polonia|noruega|suecia|finlandia|turquía|grecia|irán|irak|pakistán|sudáfrica|nueva zelanda|marruecos|tailandia|vietnam|filipinas|corea del sur|arabia saudita)/i
];

// EASY: Conocimiento sumamente común y accesible para principiantes
const EASY_PATTERNS = [
  /capital (oficial )?de (francia|españa|italia|perú|alemania|japón|méxico|argentina|chile|colombia|estados unidos|inglaterra|reino unido|brasil|rusia|egipto|china|portugal|bélgica)/i,
  /océano más (extenso|grande|profundo)/i,
  /país más (grande|poblado|extenso)/i,
  /planeta más (cercano|grande|rojo|brillante)/i,
  /pirámides de giza|torre eiffel|coliseo|machu picchu|estatua de la libertad|gran muralla/i,
  /mezclar azul y amarillo|color primario|colores del arcoíris|de qué color es/i,
  /cuántos lados tiene un (triángulo|cuadrado|hexágono|pentágono|octógono|polígono)/i,
  /cuántos dientes tiene un ser humano/i,
  /cuántos huesos tiene el cuerpo/i,
  /cuántos días tiene un año|cuántos días tiene una semana/i,
  /cuántas horas tiene un día/i,
  /cuántos minutos tiene una hora/i,
  /órgano (principal )?de la respiración/i,
  /órgano que bombea la sangre/i,
  /río más largo del mundo/i,
  /montaña más alta del mundo|pico más alto/i,
  /dónde se puede encontrar el oso polar/i,
  /animal terrestre más rápido/i,
  /mamífero más grande/i,
  /anillos olímpicos|balón de fútbol|messi|maradona|pelé|cristiano/i,
  /don quijote|cervantes|romeo y julieta|shakespeare|mona lisa|leonardo da vinci/i,
  /planeta donde vivimos|satélite natural de la tierra|h2o/i,
  /gas que respiramos|oxígeno/i,
  /las nubes están formadas por/i,
  /termina el proverbio|refrán/i,
  /animal doméstico|sonido de|ladra|maúlla|relincha/i,
  /continente donde está/i,
  /idioma oficial de/i,
  /moneda oficial de/i,
  /instrumento musical que tiene 88 teclas|piano/i,
  /juegos olímpicos en la antigüedad/i,
  /luna no es del todo redonda/i
];

function classifyQuestion(q) {
  const qText = q.question.toLowerCase();
  const qLen = q.question.length;
  const maxOptLen = Math.max(...q.options.map(o => o.length));

  // 1. Detección de EXPERT
  for (const regex of EXPERT_PATTERNS) {
    if (regex.test(qText)) return "expert";
  }

  // 2. Detección de EASY
  for (const regex of EASY_PATTERNS) {
    if (regex.test(qText)) return "easy";
  }

  // 3. Detección de HARD
  for (const regex of HARD_PATTERNS) {
    if (regex.test(qText)) return "hard";
  }

  // 4. Heurísticas por longitud y categoría
  if (qLen <= 50 && maxOptLen <= 15) {
    if (["Cultura General", "Perú", "Vida cotidiana", "Naturaleza"].includes(q.category)) {
      return "easy";
    }
  }

  if (qLen >= 120 || maxOptLen >= 35) {
    if (["Historia", "Ciencia"].includes(q.category)) {
      return "hard";
    }
  }

  // 5. Default para conocimientos estándar
  return "medium";
}

// Clasificar
const reclassified = originalQuestions.map(q => {
  const diff = classifyQuestion(q);
  return {
    ...q,
    difficulty: diff
  };
});

const easyList = reclassified.filter(q => q.difficulty === "easy");
const mediumList = reclassified.filter(q => q.difficulty === "medium");
const hardList = reclassified.filter(q => q.difficulty === "hard");
const expertList = reclassified.filter(q => q.difficulty === "expert");

console.log("\n==================================================");
console.log("DISTRIBUCIÓN FINAL DE DIFICULTAD");
console.log("==================================================");
console.log(`1. EASY (Fáciles):      ${easyList.length}`);
console.log(`2. MEDIUM (Medias):     ${mediumList.length}`);
console.log(`3. HARD (Difíciles):    ${hardList.length}`);
console.log(`4. EXPERT (Expertas):   ${expertList.length}`);
console.log(`TOTAL NORMAL:           ${reclassified.length}`);

// Ordenar dentro de cada grupo para garantizar que las preguntas más claras y directas encabecen cada nivel
easyList.sort((a, b) => a.question.length - b.question.length);
mediumList.sort((a, b) => a.question.length - b.question.length);
hardList.sort((a, b) => a.question.length - b.question.length);
expertList.sort((a, b) => a.question.length - b.question.length);

const orderedNormalQuestions = [
  ...easyList,
  ...mediumList,
  ...hardList,
  ...expertList
];

// Validación estricta
if (orderedNormalQuestions.length !== originalQuestions.length) {
  throw new Error("Error en total de preguntas");
}

const origMap = new Map(originalQuestions.map(q => [q.id, q]));
for (const q of orderedNormalQuestions) {
  const orig = origMap.get(q.id);
  if (!orig) throw new Error(`ID ${q.id} no existe en original`);
  if (q.question !== orig.question) throw new Error(`Pregunta alterada en ${q.id}`);
  if (q.correctIndex !== orig.correctIndex) throw new Error(`correctIndex alterado en ${q.id}`);
  if (q.options.length !== 4) throw new Error(`Opciones alteradas en ${q.id}`);
  for (let i = 0; i < 4; i++) {
    if (q.options[i] !== orig.options[i]) throw new Error(`Opción ${i} alterada en ${q.id}`);
  }
}

console.log(`✅ Integridad 100% verificada: ningún dato alterado.`);

const finalOutput = {
  metadata: {
    ...data.metadata,
    version: "2.3.0",
    description: "Banco oficial de ¿SABELOTODO? clasificado y ordenado físicamente por dificultad real: EASY -> MEDIUM -> HARD -> EXPERT",
    lastReclassified: new Date().toISOString(),
    distribution: {
      easy: easyList.length,
      medium: mediumList.length,
      hard: hardList.length,
      expert: expertList.length,
      total: orderedNormalQuestions.length
    }
  },
  normalQuestions: orderedNormalQuestions,
  bonusQuestions: data.bonusQuestions
};

fs.writeFileSync(questionsPath, JSON.stringify(finalOutput, null, 2), "utf-8");
console.log(`✅ Archivo actualizado en: ${questionsPath}`);

const distPath = path.resolve("./dist/questions.json");
if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, JSON.stringify(finalOutput, null, 2), "utf-8");
  console.log(`✅ Archivo sincronizado en: ${distPath}`);
}
