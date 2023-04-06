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

const TrySearchCorreo = async (correo) => {
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
    (m) => m.email === correo && m.role === "STUDENT_ROLE"
  );

  if (!dato_usuario) return null;

  console.log(dato_usuario[0].reservedTimes.length);
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
  .addAnswer("gracias por la espera");

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
    (ctx, { fallBack }) => {
      let expReg = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      if (!expReg.test(ctx.body))
        return fallBack("Ingrese un correo valido porfavor:");
    }
  )
  .addAnswer(["Estamos revisando.."], null, async (ctx, { flowDynamic }) => {
    const data_2 = await TrySearchCorreo("bry4n_jos43@hotmail.com");

    if (data_2 === null) flowDynamic([{ body: "Ups! No estás registrado" }]);
    if (data_2 === false)
      flowDynamic([{ body: "No tienes reuniones agendadas" }]);

    if (data_2) {
      flowDynamic([
        { body: "✅ Si tienes reunión agendada!" },
        { body: "Información de reunión:" },
      ]);
    }
  })
  .addAnswer(["✅ fin"]);

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
    (ctx, { fallBack }) => {
      let expReg = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;

      if (!expReg.test(ctx.body))
        return fallBack("Ingrese un correo valido porfavor:");
    }
  )
  .addAnswer(["🎓 Por favor escribe tu carrera a la que postulas:"]);

//------------------------------------------------------------------------------------------------------------

const flowPrincipal = addKeyword(["hola", "alo", "1"])
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
