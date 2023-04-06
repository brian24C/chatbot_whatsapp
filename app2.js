const axios = require("axios");

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

const flowSecundario = addKeyword(["2", "siguiente"]).addAnswer([
  "📄 Aquí tenemos el flujo secundario",
]);
//------------------------------------------------------------

const TrySearchEmaild = async (correo) => {
  const config = {
    method: "get",
    url: "https://appback-production.up.railway.app/api/v1/users/",
    headers: {
      accept: "application/json",
    },
  };
  //const { data } = await axios(config).then((u) => u.data);
  const { data } = await axios(config);

  const dato_usuario = data.users.filter(
    (m) => m.email === correo.toLowerCase() && m.role === "STUDENT_ROLE"
  );

  if (!dato_usuario || dato_usuario.length === 0) return false;
  return true;
};

//------------------------------------------------------------

const pruebaApi = async () => {
  const config = {
    method: "get",
    url: "https://appback-production.up.railway.app/api/v1/users/",
    headers: {
      accept: "application/json",
    },
  };
  //const { data } = await axios(config).then((u) => u.data);
  const { data } = await axios(config);
  const mappedData = data.users.map((m) => ({ body: m.email }));
  const firstFiveElements = mappedData.slice(0, 5);
  return firstFiveElements;
};

const TrySearchReserved = async (correo) => {
  const config = {
    method: "get",
    url: "https://appback-production.up.railway.app/api/v1/users/",
    headers: {
      accept: "application/json",
    },
  };

  const { data } = await axios(config);
  const dato_usuario = data.users.filter(
    (m) => m.email === correo.toLowerCase() && m.role === "STUDENT_ROLE"
  );

  if (!dato_usuario || dato_usuario.length === 0) return null;

  // if (dato_usuario[0].role === "MENTOR_ROLE") return undefined;

  //console.log(dato_usuario[0].reservedTimes.length);
  if (dato_usuario[0].reservedTimes.length === 0) return false;

  //se manda el objeto {datos...}
  return dato_usuario[0];
};

//------------------------------------------------------------

const flowPrueba = addKeyword(["p"])
  .addAnswer(
    "📄 Se están buscando los primeros 5 usuarios registrados...",
    null,
    async (ctx, { flowDynamic }) => {
      //flowDynamic([{ body: "jdfi" }, { body: "jidfdfd2" }]);

      const data_2 = await pruebaApi();
      flowDynamic(data_2);
    }
  )
  .addAnswer("gracias por la espera", { delay: 2000 });

const flowMas = addKeyword(["mas", "más"]).addAnswer(
  [
    "*Feeding Minds* es una *STARTUP* que ayuda a estudiantes a conectarlos con la educación superior mediante acompañamiento psicológico, técnicas de estudio y mentorías.",
    "\n📢 *Síguemos en nuestra RR.SS*",
    "\nNuestra página:",
    "https://feedingmindsperu.com/",
    "\nInstagram:",
    "https://www.instagram.com/feedingmindsperu/",
    "\nLinkdin:",
    "https://www.linkedin.com/company/78829231/admin/",
    "\nYoutube:",
    "https://www.youtube.com/@feedingminds7234",
    "\nFacebook:",
    "https://www.facebook.com/feedingmindsperu",
    "\n↩️ *1* Para regresar al inicio.",
  ],
  null,
  null
);

const flowMentores = addKeyword(["mentor"]).addAnswer(
  [
    "🙌 Aquí encontras a nuestros mentores:",
    "https://feedingminds.netlify.app/#/mentors",
    "\n↩️ *1* Para regresar al inicio.",
  ],
  null,
  null
);

const flowReunion = addKeyword(["ver"])
  .addAnswer(
    [
      "✉️ Escribe tu correo para revisar nuestros registros",
      "\n↩️ *1* Para regresar al inicio.",
    ],
    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      let expReg = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      if (ctx.body === "1") return fallBack("...");
      if (!expReg.test(ctx.body))
        return fallBack("Ingrese un correo valido porfavor:");

      flowDynamic([
        {
          body: "Estamos buscando ...",
        },
      ]);

      const data_2 = await TrySearchReserved(ctx.body);
      console.log({ data_2: typeof data_2, data: data_2 });

      if (data_2 === null)
        flowDynamic([
          {
            body: "Ups! No estás registrado. \nIngresa a https://feedingminds.netlify.app/#/mentors y registrate",
          },
        ]);
      // if (data_2 === "MENTOR_ROLE")
      //   flowDynamic([
      //     {
      //       body: "Estás registrado como mentor!. Ingresa a https://feedingminds.netlify.app/#/mentors y registrate como estudiante para poder agendar reuniones.",
      //     },
      //   ]);
      if (data_2 === false)
        flowDynamic([{ body: "No tienes reuniones agendadas" }]);

      if (data_2) {
        flowDynamic([
          { body: "✅ Si tienes reunión agendada!" },
          { body: "Información de reunión:" },
        ]);
      }
    }
  )
  .addAnswer("fin", { delay: 3500 });

//------------------------------------------------------------------------------------------------------------

// const flowCarreras = addKeyword([
//   "carreras",
//   "carrera",
//   "ca",
//   "carrer",
//   "carr",
// ]).addAnswer(
//   [
//     "ADMINISTRACIÓN, INGENERÍA AMBIENTAL, ING DE MINAS...",
//     ,
//     "Escribe `continuar` para seguir con el proceso",
//   ],
//   null,
//   null,
//   null
// );

// const flowContinuarCarrera = addKeyword("continuar").addAnswer(
//   [
//     "😎 Por favor escribe tu carrera a la que postulas:",
//     "👉 *carreras* para que que conozcas que carreras tenemos.",
//     ,
//   ],
//   null,
//   null,
//   null
// );

const flowAgendar = addKeyword(["agendar"])
  .addAnswer(
    [
      "✉️ Por favor escribe tu correo electrónico:",
      "\n↩️ *1* Para regresar al inicio.",
    ],

    { capture: true },
    async (ctx, { fallBack, flowDynamic }) => {
      let expReg = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      if (ctx.body === "1") return fallBack("...");

      if (!expReg.test(ctx.body))
        return fallBack("Ingrese un correo valido porfavor:");

      flowDynamic([
        {
          body: "Espere un momento ...",
        },
      ]);

      const data_2 = await TrySearchEmaild(ctx.body);
      console.log(ctx.body);
      console.log(data_2);
      if (!data_2)
        flowDynamic([
          {
            body: "Ups! No estás registrado como Estudiante en nuestra página. \nIngresa a https://feedingminds.netlify.app/#/mentors y registrate como *estudiante* para poder agendar un reunión.",
          },
        ]);
      if (data_2)
        flowDynamic([
          {
            body: "Vemos que estás registrado! Porfavor ingresa a esta página y logeate para agendar una reunión con tu mentor favorito:\nhttps://feedingminds.netlify.app/#/login ",
          },
        ]);
    }
  )
  .addAnswer("🎓 termina proceso.");

//------------------------------------------------------------------------------------------------------------

const flowPrincipal = addKeyword([EVENTS.WELCOME, "1"])
  .addAnswer("🙌 Hola bienvenido a *Feeding Minds!* ⚡")
  .addAnswer(
    [
      "👇 te comparto la siguiente información de interes:",
      "\n➡️ *mas* para que que conozcas más sobre nosotros ",
      "➡️ *mentor*  para ver los mentores disponibles",
      "➡️ *agendar* para que agendes una reunión",
      "➡️ *ver* para que puedas ver si tienes alguna reunión agendada",
      "➡️ *p* para probar",
    ],
    null,
    null,
    [flowMas, flowMentores, flowAgendar, flowReunion, flowPrueba]
  );

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
