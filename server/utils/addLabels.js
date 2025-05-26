const API_URL = "http://localhost:4000/graphql";
const API_KEY =
  "user:gh.d8f8dde0-5302-401d-bc8c-73746bd3094a:ZyMA6fP8KKbdlS6WdPI1yg"; // якщо є авторизація (або прибери заголовок)

const labels = [
  { name: { en: "detective", uk: "детектив", pl: "detektyw" }, type: "GENRE" },
  { name: { en: "crime", uk: "кримінал", pl: "kryminał" }, type: "GENRE" },
  {
    name: {
      en: "classic detective",
      uk: "класичний детектив",
      pl: "klasyczny detektyw",
    },
    type: "GENRE",
  },
  {
    name: { en: "dystopia", uk: "антиутопія", pl: "antyutopia" },
    type: "GENRE",
  },

  {
    name: {
      en: "psychological thriller",
      uk: "психологічний трилер",
      pl: "thriller psychologiczny",
    },
    type: "GENRE",
  },
  { name: { en: "mystery", uk: "містика", pl: "misterium" }, type: "GENRE" },
  {
    name: {
      en: "historical",
      uk: "історичний роман",
      pl: "powieść historyczna",
    },
    type: "GENRE",
  },
  { name: { en: "manga", uk: "манґа", pl: "manga" }, type: "GENRE" },
  { name: { en: "thriller", uk: "трилер", pl: "thriller" }, type: "GENRE" },
  { name: { en: "murder", uk: "вбивство", pl: "morderstwo" }, type: "TAG" },
  {
    name: { en: "investigation", uk: "розслідування", pl: "śledztwo" },
    type: "TAG",
  },

  {
    name: { en: "body horror", uk: "тілесний жах", pl: "horror cielesny" },
    type: "TAG",
  },
  { name: { en: "fear", uk: "страх", pl: "strach" }, type: "TAG" },
  {
    name: { en: "experiment", uk: "експеримент", pl: "eksperyment" },
    type: "TAG",
  },
  {
    name: { en: "totalitarianism", uk: "тоталітаризм", pl: "totalitaryzm" },
    type: "TAG",
  },
  { name: { en: "war", uk: "війна", pl: "wojna" }, type: "TAG" },
  { name: { en: "trauma", uk: "травма", pl: "trauma" }, type: "TAG" },

  { name: { en: "grief", uk: "горе", pl: "żal" }, type: "TAG" },
  { name: { en: "darkness", uk: "темрява", pl: "ciemność" }, type: "TAG" },
  { name: { en: "revenge", uk: "помста", pl: "zemsta" }, type: "TAG" },
  {
    name: { en: "laboratory", uk: "лабораторія", pl: "laboratorium" },
    type: "TAG",
  },
  { name: { en: "front line", uk: "фронт", pl: "front" }, type: "TAG" },
  { name: { en: "friendship", uk: "дружба", pl: "przyjaźń" }, type: "TAG" },
  {
    name: { en: "melancholy", uk: "меланхолія", pl: "melancholia" },
    type: "TAG",
  },
  { name: { en: "paranoia", uk: "параноя", pl: "paranoja" }, type: "TAG" },
];

const createLabel = async (label) => {
  const query = `
    mutation CreateLabel($name: LabelNameInput!, $type: LabelType!) {
      createLabel(name: $name, type: $type) {
        id
        name { en uk pl }
        type
      }
    }
  `;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY, // або прибери, якщо не потрібен
    },
    body: JSON.stringify({
      query,
      variables: {
        name: label.name,
        type: label.type,
      },
    }),
  });

  const json = await res.json();
  if (json.errors) {
    console.error(`❌ Failed: ${label.name.en}`, json.errors[0].message);
  } else {
    console.log(`✅ Created: ${json.data.createLabel.name.en}`);
  }
};

(async () => {
  for (const label of labels) {
    await createLabel(label);
  }
})();
