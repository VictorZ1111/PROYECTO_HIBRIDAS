export const PROVINCIAS_ECUADOR = [
  "Azuay",
  "Bolívar",
  "Cañar",
  "Carchi",
  "Chimborazo",
  "Cotopaxi",
  "El Oro",
  "Esmeraldas",
  "Galápagos",
  "Guayas",
  "Imbabura",
  "Loja",
  "Los Ríos",
  "Manabí",
  "Morona Santiago",
  "Napo",
  "Orellana",
  "Pastaza",
  "Pichincha",
  "Santa Elena",
  "Santo Domingo de los Tsáchilas",
  "Sucumbíos",
  "Tungurahua",
  "Zamora Chinchipe",
];

export const CIUDADES_POR_PROVINCIA = {
  Azuay: ["Cuenca", "Gualaceo", "Paute", "Santa Isabel", "Sígsig"],
  Bolívar: ["Guaranda", "Caluma", "Chillanes", "Chimbo", "Echeandía", "San Miguel"],
  Cañar: ["Azogues", "Biblián", "Cañar", "Déleg", "El Tambo", "La Troncal"],
  Carchi: ["Tulcán", "Bolívar", "Espejo", "Mira", "Montúfar", "San Pedro de Huaca"],
  Chimborazo: ["Riobamba", "Alausí", "Chambo", "Chunchi", "Colta", "Guamote", "Guano"],
  Cotopaxi: ["Latacunga", "La Maná", "Pangua", "Pujilí", "Salcedo", "Saquisilí", "Sigchos"],
  "El Oro": ["Machala", "Arenillas", "Atahualpa", "Balsas", "El Guabo", "Huaquillas", "Pasaje", "Piñas", "Santa Rosa", "Zaruma"],
  Esmeraldas: ["Esmeraldas", "Atacames", "Eloy Alfaro", "Muisne", "Quinindé", "Rioverde", "San Lorenzo"],
  Galápagos: ["Puerto Baquerizo Moreno", "Puerto Ayora", "Puerto Villamil"],
  Guayas: ["Guayaquil", "Daule", "Durán", "Milagro", "Samborondón", "Playas", "Naranjal", "Salitre", "Yaguachi"],
  Imbabura: ["Ibarra", "Antonio Ante", "Cotacachi", "Otavalo", "Pimampiro", "Urcuquí"],
  Loja: ["Loja", "Calvas", "Catamayo", "Celica", "Macará", "Paltas", "Puyango", "Saraguro", "Zapotillo"],
  "Los Ríos": ["Babahoyo", "Baba", "Buena Fe", "Mocache", "Montalvo", "Palenque", "Quevedo", "Urdaneta", "Valencia", "Ventanas", "Vinces"],
  Manabí: ["Portoviejo", "Manta", "Montecristi", "Chone", "Jipijapa", "Jaramijó", "Rocafuerte", "Santa Ana", "Sucre", "Tosagua", "El Carmen", "Pedernales", "Puerto López"],
  "Morona Santiago": ["Macas", "Gualaquiza", "Limón Indanza", "Logroño", "Morona", "Palora", "Santiago", "Sucúa", "Taisha"],
  Napo: ["Tena", "Archidona", "Carlos Julio Arosemena Tola", "El Chaco", "Quijos"],
  Orellana: ["Francisco de Orellana", "Aguarico", "La Joya de los Sachas", "Loreto"],
  Pastaza: ["Puyo", "Arajuno", "Mera", "Santa Clara"],
  Pichincha: ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Pedro Vicente Maldonado", "Puerto Quito", "Rumiñahui", "San Miguel de los Bancos"],
  "Santa Elena": ["Santa Elena", "La Libertad", "Salinas"],
  "Santo Domingo de los Tsáchilas": ["Santo Domingo", "La Concordia"],
  Sucumbíos: ["Nueva Loja", "Cascales", "Cuyabeno", "Gonzalo Pizarro", "Lago Agrio", "Putumayo", "Shushufindi", "Sucumbíos"],
  Tungurahua: ["Ambato", "Baños de Agua Santa", "Cevallos", "Mocha", "Patate", "Pelileo", "Píllaro", "Quero", "Tisaleo"],
  "Zamora Chinchipe": ["Zamora", "Centinela del Cóndor", "Chinchipe", "El Pangui", "Nangaritza", "Palanda", "Paquisha", "Yacuambi", "Yantzaza"],
};

export function obtenerCiudadesPorProvincia(provincia) {
  if (!provincia || provincia === "Todos") {
    return [];
  }

  return CIUDADES_POR_PROVINCIA[provincia] || [];
}

export function normalizarUbicacion(valor = "") {
  return String(valor).trim().toLowerCase();
}
