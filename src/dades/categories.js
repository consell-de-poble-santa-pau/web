// Vocabulari de categories del mapa. AQUEST FITXER MANA.
// Afegir una categoria = afegir una entrada aquí. No s'ha de tocar res més:
// ni el mapa, ni la llegenda, ni l'script de conversió.
//
// clau      → el valor que has d'escriure a <type> dins el GPX
// etiqueta  → com surt a la llegenda
// color     → color del marcador
// icona     → silueta blanca de dins, en un viewBox de 15x15
//
// Icones de Maki (Mapbox) i Temaki (OpenStreetMap), totes dues CC0 1.0
// (domini public, sense atribucio obligatoria). La cova esta dibuixada a ma.

export const CATEGORIES = {
  arbre: {
    etiqueta: 'Arbres monumentals',
    color: '#2E7D32',
    icona: 'M14 5.75c0 -0.69 -0.38 -1.32 -1 -1.61C12.95 3.49 12.4 3 11.75 3c-0.1 0 -0.2 0 -0.3 0c0 -0.66 -0.64 -1.15 -1.3 -1.09C9.9 2 9.65 2.11 9.46 2.25l0 0c0 -0.69 -0.56 -1.25 -1.25 -1.25S6.96 1.59 6.96 2.25C6.96 2.25 7 2.3 7 2.33C6.49 1.89 5.72 1.95 5.25 2.46C5.13 2.63 5 2.85 5 3C4.84 3 4.68 3 4.51 3C3.68 3 3 3.66 3 4.49C3 4.69 3 4.89 3.11 5C2.32 5.3 1.85 6.11 2 6.91C2.22 7.41 2.61 7.8 3.11 7.94c0.25 0.78 1.09 1.21 1.88 0.96C5.52 8.73 5.91 8.27 6 7.71C6.18 7.87 6.41 7.97 6.65 8v5L5 14h5l-1.6 -1v-2c0.74 -0.89 1.69 -1.58 2.77 -2c0.8 0.19 1.6 -0.31 1.79 -1.11C13 7.77 13 7.64 13 7.52c0 0 0 -0.11 0 -0.16C13.62 7 14 6.44 14 5.75zM8.4 10.25V6.82C8.67 7.3 9.18 7.6 9.73 7.6h0.25c0 0.44 0.22 0.85 0.57 1.12C9.76 9.09 9 9.62 8.4 10.25z',
  },
  cova: {
    etiqueta: 'Coves i avencs',
    color: '#4A4A4A',
    icona: 'M1.2 13 C1.2 5.8 4 2 7.5 2 C11 2 13.8 5.8 13.8 13 Z M9.6 13 C9.6 9.4 8.7 7.6 7.5 7.6 C6.3 7.6 5.4 9.4 5.4 13 Z',
  },
  ermita: {
    etiqueta: 'Ermites',
    color: '#7A5C9E',
    icona: 'M6,0.9552V4H3v3h3v8h3V7h3V4H9V1 c0-1-0.9776-1-0.9776-1H6.9887C6.9887,0,6,0,6,0.9552z',
  },
  font: {
    etiqueta: 'Fonts',
    color: '#1E7BB8',
    icona: 'M6,1A2,2,0,0,0,4,3V6.5a.5.5,0,0,0,.5.5h2A.5.5,0,0,0,7,6.5v-2A.5.5,0,0,1,7.5,4H14V1ZM7,15H4a.5.5,0,0,1-.48-.38L2,8.62a.5.5,0,0,1,.365-.606A.558.558,0,0,1,2.5,8h6a.5.5,0,0,1,.514.485A.47.47,0,0,1,9,8.62l-1.5,6A.5.5,0,0,1,7,15ZM3.65,11H7.36l.5-2H3.14Z',
  },
  habitatge: {
    etiqueta: 'Masies i habitatges',
    color: '#B5761F',
    icona: 'M2,13.7478c0,0.13807,0.11193,0.25,0.25,0.25h3.749v-3h3v3h3.749c0.13807,0,0.25-0.11193,0.25-0.25V7.9987H2 C2,7.9987,2,13.7478,2,13.7478z M13.93,6.5778l-0.9319-0.8189V2c0-0.55228-0.44771-1-1-1s-1,0.44772-1,1v2L7.6808,1.09 C7.5863,0.9897,7.42846,0.98478,7.3279,1.079L7.3169,1.09L1.0678,6.553C0.9734,6.65376,0.97856,6.81197,1.07932,6.90637 C1.12478,6.94896,1.18451,6.97304,1.2468,6.9739L3,6.9989h10.7468c0.13807,0.00046,0.25037-0.1111,0.25083-0.24917 C13.99784,6.68592,13.97365,6.62445,13.93,6.5779V6.5778z',
  },
  moli: {
    etiqueta: 'Molins',
    color: '#8A6D3B',
    icona: 'M4.83 0L3.83 1L6.5 3.67L7.17 2.33L4.83 0zM3.67 1.17L3.17 1.67L6 4.5L6.5 4L3.67 1.17zM11.67 1.17L8.83 4L9.33 4.5L12.17 1.67L11.67 1.17zM12.33 1.83L9.67 4.5L11 5.17L13.33 2.83L12.33 1.83zM7.67 3.17L4.55 6.28L4.33 6.17L2 8.5L3 9.5L4.27 8.23L4.23 8.6L3.17 9.67L3.67 10.17L4.09 9.74L3.67 13.33C2 13.67 1 15 1 15L14.33 15C14.33 15 13.33 13.67 11.67 13.33L11.33 10.5L11.5 10.33L11.29 10.16L11.24 9.74L11.67 10.17L12.17 9.67L11.1 8.6L10.83 6.33L7.67 3.17zM7.17 7L8.17 7L8.5 9L6.83 9L7.17 7z',
  },
  muntanya: {
    etiqueta: 'Cims i muntanyes',
    color: '#6B5B3E',
    icona: 'm7.5 1c-.3 0-.4.2-.6.4l-5.8 9.5c-.1.1-.1.3-.1.4 0 .5.4.7.7.7h11.6c.4 0 .7-.2.7-.7 0-.2 0-.2-.1-.4l-5.7-9.5c-.2-.2-.4-.4-.7-.4zm0 1.5 3.3 5.5h-.8l-1.5-1.5-1 1.5-1-1.5-1.5 1.5h-.9z',
  },
  pont: {
    etiqueta: 'Ponts',
    color: '#5E6C8A',
    icona: 'm0 6.84201v4.15799h2v-1c.036-1.08899.911-1.96399 2-1.99999 1.089.036 1.964.911 2 1.99999v1h3v-1c.036-1.08899.911-1.96399 2-1.99999 1.089.036 1.964.911 2 1.99999v1h2v-4.15799c-4.4-5.76-11.929-4.442-15 0zm9.5-3.108c.514.121 1.016.289 1.5.5v2.766h-1.5zm-.5-.1v3.366h-1.5v-3.494c.503 0 1.005.043 1.5.128zm-5.5.843c.48-.248.982-.451 1.5-.606v3.129h-1.5zm2 2.523v-3.27c.493-.115.995-.187 1.5-.215v3.485zm-2.5-2.256v2.256h-2.5c.676-.906 1.532-1.672 2.5-2.256zm8.5 2.256v-2.5l-.053-.053c1.202.603 2.247 1.477 3.053 2.553z',
  },
  volca: {
    etiqueta: 'Volcans',
    color: '#B03A2E',
    icona: 'M8.4844,1.0002 c-0.1464,0.005-0.2835,0.0731-0.375,0.1875L6.4492,3.2619L4.8438,1.7385C4.4079,1.3374,3.7599,1.893,4.0899,2.385l1.666,2.4004 C5.9472,5.061,6.3503,5.0737,6.5586,4.8108C6.7249,4.6009,7,4.133,7.5,4.133s0.7929,0.4907,0.9414,0.6777 c0.175,0.2204,0.4973,0.2531,0.7129,0.0723l1.668-1.4004c0.4408-0.3741,0.0006-1.0735-0.5273-0.8379L9,3.2268V1.5002 C9.0002,1.2179,8.7666,0.9915,8.4844,1.0002L8.4844,1.0002z M5,6.0002L2.0762,11.924C1.9993,12.0009,2,12.155,2,12.3088 c0,0.5385,0.3837,0.6914,0.6914,0.6914h9.6172c0.3846,0,0.6914-0.153,0.6914-0.6914c0-0.1538,0.0008-0.2309-0.0762-0.3848L10,6.0002 c-0.5,0-1,0.5-1,1v0.5c0,0.277-0.223,0.5-0.5,0.5S8,7.7772,8,7.5002v-0.5c0-0.2761-0.2238-0.5-0.5-0.5S7,6.7241,7,7.0002v2 c0,0.277-0.223,0.5-0.5,0.5S6,9.2772,6,9.0002v-2C6,6.5002,5.5,6.0002,5,6.0002z',
  },
  varis: {
    etiqueta: 'Varis',
    color: '#556B2F',
    icona: 'M14,7.5c0,3.5899-2.9101,6.5-6.5,6.5S1,11.0899,1,7.5S3.9101,1,7.5,1S14,3.9101,14,7.5z',
  },
};

// Sinonims tolerats a l'entrada. La clau es el que algu podria escriure
// al GPX; el valor, la categoria oficial. Amplia-ho lliurement.
export const SINONIMS = {
  arbre: 'arbre', arbres: 'arbre', 'arbre monumental': 'arbre', roure: 'arbre',
  cova: 'cova', coves: 'cova', avenc: 'cova', bauma: 'cova',
  ermita: 'ermita', ermites: 'ermita', esglesia: 'ermita', capella: 'ermita',
  font: 'font', fonts: 'font', 'water source': 'font', fontanella: 'font',
  habitatge: 'habitatge', habitatges: 'habitatge', masia: 'habitatge', masies: 'habitatge', mas: 'habitatge', casa: 'habitatge',
  moli: 'moli', molins: 'moli', molinos: 'moli', 'moli fariner': 'moli',
  muntanya: 'muntanya', muntanyes: 'muntanya', cim: 'muntanya', puig: 'muntanya', turo: 'muntanya',
  pont: 'pont', ponts: 'pont', palanca: 'pont',
  volca: 'volca', volcans: 'volca', craters: 'volca', crater: 'volca',
  varis: 'varis', altres: 'varis', divers: 'varis',
};