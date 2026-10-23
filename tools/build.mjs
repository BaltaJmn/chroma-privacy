// Builds the Year in Pixels pages (printables and online maker) in en, es and pt, sitemap.xml and
// robots.txt. The pages are plain files committed to the repo; run this after changing a text here.
//
//   node tools/sheets.mjs && node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { YEAR, PAPER, LAYOUTS, mondayFirst, pdfName } from './sheets.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://color.baltajmn.dev'
const ANCHORS = JSON.parse(readFileSync(join(ROOT, 'yip/sheets/anchors.json'), 'utf8'))
const SIZES = JSON.parse(readFileSync(join(ROOT, 'yip/pdf/sizes.json'), 'utf8'))
const TODAY = new Date().toISOString().slice(0, 10)
// Cloudflare and browsers keep CSS and JS for a while: the URL changes when the file does.
const v = (p) => `${p}?v=${createHash('md5').update(readFileSync(join(ROOT, p))).digest('hex').slice(0, 8)}`

// Campaign tokens: the apps have no analytics, so the stores are the only place a web install shows up.
// App Store: `pt` is the provider token from App Store Connect > App Analytics > Campaigns. Without it
// Apple ignores `ct`, so it is left out until the token is known.
const APPLE_PT = '129564006' // provider ID of the developer account, as App Store Connect puts it in its campaign links
const play = (c) => `https://play.google.com/store/apps/details?id=com.baltajmn.color&referrer=${encodeURIComponent(`utm_source=color.baltajmn.dev&utm_medium=web&utm_campaign=${c}`)}`
const apple = (c) => `https://apps.apple.com/app/apple-store/id6819301462?${APPLE_PT ? `pt=${APPLE_PT}&` : ''}ct=${c}&mt=8`

const PAGES = {
  print: { en: '/year-in-pixels/', es: '/es/ano-en-pixeles/', pt: '/pt/ano-em-pixels/' },
  maker: { en: '/year-in-pixels/maker/', es: '/es/ano-en-pixeles/crear/', pt: '/pt/ano-em-pixels/criar/' },
}
const LOCALE = { en: 'en_US', es: 'es_ES', pt: 'pt_BR' }
const LANG_NAME = { en: 'English', es: 'Español', pt: 'Português' }

// Example palettes: [color, label] per idea. The labels are translated, the colors are shared.
const IDEA_COLORS = {
  mood: ['#E9C46A', '#81B29A', '#A9B8C2', '#5B8DB8', '#3D5A80'],
  weather: ['#F2CC8F', '#C9CED6', '#5B8DB8', '#F4F6F8', '#9DB4AB'],
  sleep: ['#3D5A80', '#5B8DB8', '#8FB3D9', '#F2CC8F', '#E07A5F'],
  place: ['#F2CC8F', '#8D99AE', '#E07A5F', '#5B8DB8', '#81B29A'],
  move: ['#3D5A80', '#81B29A', '#E07A5F', '#C9ADA7', '#E6E6E6'],
  energy: ['#E76F51', '#F4A261', '#E9C46A', '#A8DADC', '#6C757D'],
  sky: ['#F4A27A', '#E07A5F', '#C06C84', '#6C5B7B', '#355C7D'],
  photo: ['#F2BF94', '#9CC5B8', '#6E7FA6', '#7E8F5A', '#C9C3BA'],
}

const T = {
  en: {
    print: {
      title: `Year in Pixels ${YEAR} Printable: Free PDF, A4 and US Letter`,
      desc: `Free year in pixels ${YEAR} templates to print: classic grid, month by month, or with a color key. PDF in A4 and US Letter, no sign-up. Or fill it in online.`,
      h1: 'Year in Pixels',
      lede: `Three free year in pixels printables for ${YEAR}, one square for every day. Color in one each night for how the day went: a mood, the weather, the sky.`,
      layout: 'Layout',
      layouts: { classic: 'Classic grid', months: 'Month by month', key: 'With color key' },
      paper: 'Paper',
      papers: { a4: 'A4', letter: 'US Letter' },
      download: 'Download PDF',
      meta: (kb) => `1 page, ${kb} KB. Print at 100% (actual size).`,
      alt: (l, p) => `Preview of the Year in Pixels ${YEAR} template: ${l}, ${p}`,
      notes: {
        classic: [['months', 'One column per month'], ['days', 'One row per day, 1 to 31'], ['blank', `No February 29: ${YEAR} isn't a leap year`]],
        months: [['monthName', 'Each month in its own calendar block'], ['weekdays', { a4: 'Weeks start on Monday', letter: 'Weeks start on Sunday' }], ['jan1', `January 1, ${YEAR} is a Friday`]],
        key: [['months', 'The same grid: a column per month'], ['blank', "Days that don't exist stay blank"], ['key', 'Write what each color means']],
      },
      makerH: 'Prefer to color it on screen?',
      makerP: 'The online maker has the same grid. Name your colors, tap a day to paint it, and come back tomorrow: it stays saved in this browser. Export the year as a PNG whenever you like.',
      makerBtn: 'Open the online maker',
      keyDemo: [['Great', 41], ['Good', 102], ['Okay', 77], ['Low', 23], ['Rough', 9]],
      keyDemoNote: 'Example key',
      appH: 'Or pick the color from a photo',
      appP1: 'Chroma is a year in pixels for your phone. Take one photo a day; Chroma finds its colors, you pick one, and it lands on your grid with a name.',
      appP2: `By December 31, your ${YEAR} can be 365 colors you actually saw. No list of moods to pick from, no ads, and your photos stay on your phone.`,
      appAlt: 'Chroma on iPhone: a sunset photo and the peach color picked from it',
      ideasH: 'Year in pixels ideas: what each color can mean',
      ideasP: 'Pick one thing to track and give it 4 to 6 colors. Fewer colors make the patterns easier to see.',
      ideas: [
        ['mood', 'Mood', 'The classic: one color for how the day felt.', ['Great', 'Good', 'Okay', 'Low', 'Rough']],
        ['weather', 'Weather', 'Easy to remember at night, and fun to compare with next year.', ['Sun', 'Clouds', 'Rain', 'Snow', 'Wind']],
        ['sleep', 'Sleep', 'Hours slept the night before.', ['8 h+', '7 h', '6 h', '5 h', 'Less']],
        ['place', 'Where you were', 'Where most of the day happened.', ['Home', 'Work or school', 'Out', 'Traveling', 'Nature']],
        ['move', 'Movement', 'What your body did today.', ['Gym', 'Walk', 'Sport', 'Stretching', 'Rest']],
        ['energy', 'Energy', 'How much you had left at the end of the day.', ['Full', 'Good', 'Half', 'Low', 'Empty']],
        ['sky', 'The sky at sunset', 'The color of the sky when you looked up.', ['Peach', 'Coral', 'Rose', 'Violet', 'Blue']],
        ['photo', 'A photo a day', 'The color of something you saw. This is the one Chroma is built around.', ['Peach', 'Sea glass', 'Dusk', 'Moss', 'Fog']],
      ],
      stepsH: 'How to make a year in pixels',
      steps: [
        ['Print the template', 'Pick a layout and paper size above. In the print dialog, choose 100% or Actual size so the squares stay even.'],
        ['Choose your colors', "Decide what you are tracking and give each value a color in the key. Use pens or pencils you'll still have in December."],
        ['Color one square a day', 'Same time each night; just before bed works. Missed a few days? Fill them in from memory or leave them blank.'],
        ['Look back once a month', 'After a few weeks the patterns show: runs of good weeks, how winter compares with spring.'],
      ],
      filesH: `All the ${YEAR} templates`,
      filesP: 'Free to print for yourself, your class or your family. One page each, PDF.',
    },
    maker: {
      title: `Year in Pixels Maker: Color Your ${YEAR} Online, Free`,
      desc: 'Make your year in pixels online: name your colors, tap a day to paint it, export a PNG. Free, no sign-up, saved only in your browser.',
      h1: 'Year in Pixels maker',
      howH: 'How the maker works',
      how: [
        ['Your key is your brush', 'Each color in the key has a meaning. Choose one, then tap days to paint them; tap a day again to clear it. Change a color and every day with it changes too.'],
        ['It stays in this browser', "Nothing is uploaded and there's no account. Your year is saved on this device, in this browser, until you clear the year or your browsing data."],
        ['Export it as an image', 'Export PNG draws your year and your key on white, ready to share or print.'],
      ],
      paperLink: `Prefer paper? Print the ${YEAR} templates`,
      appH: 'Tired of remembering?',
      appP: 'In Chroma, you take a photo a day, pick one of its colors, and your year fills in on your phone.',
    },
    ui: {
      prev: 'Previous year', next: 'Next year', undo: 'Undo', export: 'Export PNG', clear: 'Clear year',
      key: 'Color key', add: 'Add a color', eraser: 'Eraser', placeholder: 'What does it mean?',
      remove: 'Remove', change: 'Change color', days: ['day', 'days'],
      confirmRemove: 'Remove "{name}"? Every day painted with that color will be cleared.',
      confirmClear: 'Clear every day of {year}? Your color key stays.',
      hint: 'Pick a color in the key, then tap a day. Tap it again to clear it.',
      help: 'Keyboard: arrow keys move between days, Enter paints, 1 to 9 pick a color. Ctrl or Cmd + Z undoes.',
      saved: 'Saved in this browser only. Clearing your browsing data erases it.',
      noStorage: "This browser isn't saving: export a PNG before you leave.",
      empty: 'empty', grid: 'Year grid, one column per month',
      defaults: ['Great', 'Good', 'Okay', 'Low', 'Rough'],
      untitled: 'Untitled',
      sheetTitle: 'Year in Pixels',
      file: 'year-in-pixels',
    },
    nav: { print: 'Printables', maker: 'Online maker', privacy: 'Privacy' },
    footer: 'Chroma: Color Year in Pixels, by Baltasar Jiménez.',
  },
  es: {
    print: {
      title: `Año en píxeles ${YEAR}: plantilla en PDF para imprimir gratis`,
      desc: `Plantillas gratis del año en píxeles ${YEAR} (year in pixels): rejilla clásica, por meses o con leyenda. PDF en A4 y carta, sin registro. O rellénalo online.`,
      h1: 'Año en píxeles',
      lede: `Tres plantillas gratis del año en píxeles para ${YEAR}, un cuadrado por cada día. Colorea uno cada noche según cómo fue el día: tu estado de ánimo, el tiempo, el cielo.`,
      layout: 'Diseño',
      layouts: { classic: 'Rejilla clásica', months: 'Por meses', key: 'Con leyenda' },
      paper: 'Papel',
      papers: { a4: 'A4', letter: 'Carta' },
      download: 'Descargar PDF',
      meta: (kb) => `1 página, ${kb} KB. Imprime al 100 % (tamaño real).`,
      alt: (l, p) => `Vista previa de la plantilla del año en píxeles ${YEAR}: ${l}, ${p}`,
      notes: {
        classic: [['months', 'Una columna por mes'], ['days', 'Una fila por día, del 1 al 31'], ['blank', `Sin 29 de febrero: ${YEAR} no es bisiesto`]],
        months: [['monthName', 'Cada mes en su propio bloque de calendario'], ['weekdays', { a4: 'La semana empieza en lunes', letter: 'La semana empieza en domingo' }], ['jan1', `El 1 de enero de ${YEAR} es viernes`]],
        key: [['months', 'La misma rejilla: una columna por mes'], ['blank', 'Los días que no existen quedan en blanco'], ['key', 'Escribe qué significa cada color']],
      },
      makerH: '¿Prefieres colorearlo en pantalla?',
      makerP: 'El creador online tiene la misma rejilla. Pon nombre a tus colores, toca un día para pintarlo y vuelve mañana: se queda guardado en este navegador. Exporta el año como PNG cuando quieras.',
      makerBtn: 'Abrir el creador online',
      keyDemo: [['Genial', 41], ['Bien', 102], ['Normal', 77], ['Bajo', 23], ['Mal', 9]],
      keyDemoNote: 'Leyenda de ejemplo',
      appH: 'O elige el color a partir de una foto',
      appP1: 'Chroma es un año en píxeles para el móvil. Haz una foto al día: Chroma extrae sus colores, tú eliges uno y queda en tu rejilla con su nombre.',
      appP2: `El 31 de diciembre, tu ${YEAR} puede ser 365 colores que viste de verdad. Sin lista de estados de ánimo, sin anuncios, y tus fotos no salen del móvil.`,
      appAlt: 'Chroma en el iPhone: una foto de un atardecer y el color melocotón sacado de ella',
      ideasH: 'Ideas para tu año en píxeles: qué puede significar cada color',
      ideasP: 'Elige una sola cosa y dale de 4 a 6 colores. Con menos colores se ven mejor los patrones.',
      ideas: [
        ['mood', 'Estado de ánimo', 'El clásico: un color para cómo fue el día.', ['Genial', 'Bien', 'Normal', 'Bajo', 'Mal']],
        ['weather', 'El tiempo', 'Fácil de recordar por la noche, y curioso de comparar con el año siguiente.', ['Sol', 'Nubes', 'Lluvia', 'Nieve', 'Viento']],
        ['sleep', 'Sueño', 'Las horas que dormiste la noche anterior.', ['8 h o más', '7 h', '6 h', '5 h', 'Menos']],
        ['place', 'Dónde estuviste', 'Dónde pasaste casi todo el día.', ['Casa', 'Trabajo o clase', 'Fuera', 'De viaje', 'Naturaleza']],
        ['move', 'Movimiento', 'Qué hizo tu cuerpo hoy.', ['Gimnasio', 'Paseo', 'Deporte', 'Estiramientos', 'Descanso']],
        ['energy', 'Energía', 'Cuánta te quedaba al final del día.', ['Llena', 'Bien', 'Media', 'Poca', 'Vacía']],
        ['sky', 'El cielo al atardecer', 'El color del cielo cuando levantaste la vista.', ['Melocotón', 'Coral', 'Rosa', 'Violeta', 'Azul']],
        ['photo', 'Una foto al día', 'El color de algo que viste. Es la idea en la que se basa Chroma.', ['Melocotón', 'Vidrio de mar', 'Anochecer', 'Musgo', 'Niebla']],
      ],
      stepsH: 'Cómo hacer un año en píxeles',
      steps: [
        ['Imprime la plantilla', 'Elige diseño y papel arriba. En el cuadro de impresión, marca 100 % o Tamaño real para que los cuadrados salgan iguales.'],
        ['Elige tus colores', 'Decide qué vas a registrar y dale un color a cada valor en la leyenda. Usa rotuladores o lápices que sigas teniendo en diciembre.'],
        ['Colorea un cuadrado al día', 'A la misma hora cada noche; justo antes de dormir funciona. ¿Se te pasaron unos días? Rellénalos de memoria o déjalos en blanco.'],
        ['Mira atrás una vez al mes', 'A las pocas semanas aparecen los patrones: rachas de semanas buenas, cómo es el invierno frente a la primavera.'],
      ],
      filesH: `Todas las plantillas de ${YEAR}`,
      filesP: 'Gratis para imprimir en casa, en clase o en familia. Una página cada una, en PDF.',
    },
    maker: {
      title: `Año en píxeles online: crea y colorea tu ${YEAR} gratis`,
      desc: 'Haz tu año en píxeles (year in pixels) online: nombra tus colores, toca un día para pintarlo y exporta un PNG. Gratis, sin registro, solo en tu navegador.',
      h1: 'Creador de año en píxeles',
      howH: 'Cómo funciona',
      how: [
        ['Tu leyenda es tu pincel', 'Cada color de la leyenda significa algo. Elige uno y toca los días para pintarlos; tócalos otra vez para borrarlos. Si cambias un color, cambian con él todos sus días.'],
        ['Se queda en este navegador', 'No se sube nada y no hay cuenta. Tu año se guarda en este dispositivo, en este navegador, hasta que lo borres tú o borres los datos de navegación.'],
        ['Expórtalo como imagen', 'Exportar PNG dibuja tu año y tu leyenda sobre blanco, para compartirlo o imprimirlo.'],
      ],
      paperLink: `¿Prefieres papel? Imprime las plantillas de ${YEAR}`,
      appH: '¿Te cuesta acordarte?',
      appP: 'En Chroma haces una foto al día, eliges uno de sus colores y tu año se va rellenando en el móvil.',
    },
    ui: {
      prev: 'Año anterior', next: 'Año siguiente', undo: 'Deshacer', export: 'Exportar PNG', clear: 'Borrar el año',
      key: 'Leyenda', add: 'Añadir un color', eraser: 'Goma', placeholder: '¿Qué significa?',
      remove: 'Quitar', change: 'Cambiar color', days: ['día', 'días'],
      confirmRemove: '¿Quitar "{name}"? Se borrarán todos los días pintados con ese color.',
      confirmClear: '¿Borrar todos los días de {year}? La leyenda se queda.',
      hint: 'Elige un color en la leyenda y toca un día. Tócalo otra vez para borrarlo.',
      help: 'Teclado: las flechas te mueven entre días, Intro pinta, las teclas del 1 al 9 eligen el color. Ctrl o Cmd + Z deshace.',
      saved: 'Guardado solo en este navegador. Si borras los datos de navegación, se pierde.',
      noStorage: 'Este navegador no está guardando: exporta un PNG antes de salir.',
      empty: 'vacío', grid: 'Rejilla del año, una columna por mes',
      defaults: ['Genial', 'Bien', 'Normal', 'Bajo', 'Mal'],
      untitled: 'Sin nombre',
      sheetTitle: 'Año en píxeles',
      file: 'ano-en-pixeles',
    },
    nav: { print: 'Plantillas', maker: 'Creador online', privacy: 'Privacidad' },
    footer: 'Chroma: Color Year in Pixels, de Baltasar Jiménez.',
  },
  pt: {
    print: {
      title: `Ano em pixels ${YEAR} para imprimir: PDF grátis com legenda`,
      desc: `Modelos grátis do ano em pixels ${YEAR} (year in pixels): grade clássica, por mês ou com legenda de cores. PDF em A4 e carta, sem cadastro. Ou preencha online.`,
      h1: 'Ano em pixels',
      lede: `Três modelos grátis de ano em pixels para ${YEAR}, um quadradinho para cada dia. Pinte um toda noite conforme o dia que você teve: o humor, o tempo, o céu.`,
      layout: 'Modelo',
      layouts: { classic: 'Grade clássica', months: 'Por mês', key: 'Com legenda' },
      paper: 'Papel',
      papers: { a4: 'A4', letter: 'Carta' },
      download: 'Baixar PDF',
      meta: (kb) => `1 página, ${kb} KB. Imprima em 100% (tamanho real).`,
      alt: (l, p) => `Prévia do modelo de ano em pixels ${YEAR}: ${l}, ${p}`,
      notes: {
        classic: [['months', 'Uma coluna por mês'], ['days', 'Uma linha por dia, de 1 a 31'], ['blank', `Sem 29 de fevereiro: ${YEAR} não é bissexto`]],
        months: [['monthName', 'Cada mês no seu próprio bloco de calendário'], ['weekdays', { a4: 'A semana começa no domingo', letter: 'A semana começa no domingo' }], ['jan1', `1º de janeiro de ${YEAR} é uma sexta-feira`]],
        key: [['months', 'A mesma grade: uma coluna por mês'], ['blank', 'Os dias que não existem ficam em branco'], ['key', 'Escreva o que cada cor significa']],
      },
      makerH: 'Prefere pintar na tela?',
      makerP: 'O criador online tem a mesma grade. Dê nome às suas cores, toque num dia para pintar e volte amanhã: fica salvo neste navegador. Exporte o ano como PNG quando quiser.',
      makerBtn: 'Abrir o criador online',
      keyDemo: [['Ótimo', 41], ['Bom', 102], ['Normal', 77], ['Pra baixo', 23], ['Ruim', 9]],
      keyDemoNote: 'Legenda de exemplo',
      appH: 'Ou escolha a cor a partir de uma foto',
      appP1: 'O Chroma é um ano em pixels no celular. Tire uma foto por dia: o Chroma encontra as cores dela, você escolhe uma e ela entra na sua grade com um nome.',
      appP2: `Em 31 de dezembro, seu ${YEAR} pode ser 365 cores que você viu de verdade. Sem lista de humores para escolher, sem anúncios, e suas fotos não saem do celular.`,
      appAlt: 'Chroma no iPhone: uma foto do pôr do sol e a cor pêssego tirada dela',
      ideasH: 'Ideias de ano em pixels: o que cada cor pode significar',
      ideasP: 'Escolha uma coisa só e dê a ela de 4 a 6 cores. Com menos cores, os padrões aparecem mais.',
      ideas: [
        ['mood', 'Humor', 'O clássico: uma cor para como foi o dia.', ['Ótimo', 'Bom', 'Normal', 'Pra baixo', 'Ruim']],
        ['weather', 'O tempo', 'Fácil de lembrar à noite, e divertido de comparar com o ano seguinte.', ['Sol', 'Nublado', 'Chuva', 'Frio', 'Vento']],
        ['sleep', 'Sono', 'Quantas horas você dormiu na noite anterior.', ['8 h ou mais', '7 h', '6 h', '5 h', 'Menos']],
        ['place', 'Onde você estava', 'Onde você passou a maior parte do dia.', ['Casa', 'Trabalho ou aula', 'Rua', 'Viagem', 'Natureza']],
        ['move', 'Movimento', 'O que o seu corpo fez hoje.', ['Academia', 'Caminhada', 'Esporte', 'Alongamento', 'Descanso']],
        ['energy', 'Energia', 'Quanto sobrou no fim do dia.', ['Cheia', 'Boa', 'Média', 'Pouca', 'Vazia']],
        ['sky', 'O céu no pôr do sol', 'A cor do céu quando você olhou para cima.', ['Pêssego', 'Coral', 'Rosa', 'Violeta', 'Azul']],
        ['photo', 'Uma foto por dia', 'A cor de algo que você viu. É a ideia em que o Chroma se baseia.', ['Pêssego', 'Vidro do mar', 'Anoitecer', 'Musgo', 'Névoa']],
      ],
      stepsH: 'Como fazer um ano em pixels',
      steps: [
        ['Imprima o modelo', 'Escolha o modelo e o papel acima. Na janela de impressão, marque 100% ou Tamanho real para os quadradinhos saírem iguais.'],
        ['Escolha suas cores', 'Decida o que vai acompanhar e dê uma cor a cada valor na legenda. Use canetas ou lápis que você ainda vai ter em dezembro.'],
        ['Pinte um quadradinho por dia', 'Sempre no mesmo horário à noite; logo antes de dormir funciona. Pulou uns dias? Preencha de memória ou deixe em branco.'],
        ['Olhe para trás uma vez por mês', 'Depois de algumas semanas os padrões aparecem: sequências de semanas boas, como o inverno se compara ao verão.'],
      ],
      filesH: `Todos os modelos de ${YEAR}`,
      filesP: 'Grátis para imprimir em casa, na escola ou em família. Uma página cada, em PDF.',
    },
    maker: {
      title: `Ano em pixels online: crie e pinte seu ${YEAR} grátis`,
      desc: 'Faça seu ano em pixels (year in pixels) online: dê nome às cores, toque num dia para pintar e exporte um PNG. Grátis, sem cadastro, salvo só no seu navegador.',
      h1: 'Criador de ano em pixels',
      howH: 'Como funciona',
      how: [
        ['Sua legenda é o seu pincel', 'Cada cor da legenda significa algo. Escolha uma e toque nos dias para pintar; toque de novo para apagar. Se você mudar uma cor, todos os dias dela mudam junto.'],
        ['Fica neste navegador', 'Nada é enviado e não há conta. Seu ano fica salvo neste aparelho, neste navegador, até você apagar ou limpar os dados de navegação.'],
        ['Exporte como imagem', 'Exportar PNG desenha seu ano e sua legenda sobre fundo branco, pronto para compartilhar ou imprimir.'],
      ],
      paperLink: `Prefere papel? Imprima os modelos de ${YEAR}`,
      appH: 'Cansou de lembrar?',
      appP: 'No Chroma, você tira uma foto por dia, escolhe uma das cores dela e seu ano vai se preenchendo no celular.',
    },
    ui: {
      prev: 'Ano anterior', next: 'Próximo ano', undo: 'Desfazer', export: 'Exportar PNG', clear: 'Apagar o ano',
      key: 'Legenda', add: 'Adicionar uma cor', eraser: 'Borracha', placeholder: 'O que significa?',
      remove: 'Remover', change: 'Mudar a cor', days: ['dia', 'dias'],
      confirmRemove: 'Remover "{name}"? Todos os dias pintados com essa cor serão apagados.',
      confirmClear: 'Apagar todos os dias de {year}? A legenda fica.',
      hint: 'Escolha uma cor na legenda e toque num dia. Toque de novo para apagar.',
      help: 'Teclado: as setas se movem entre os dias, Enter pinta, as teclas de 1 a 9 escolhem a cor. Ctrl ou Cmd + Z desfaz.',
      saved: 'Salvo só neste navegador. Se você limpar os dados de navegação, ele se perde.',
      noStorage: 'Este navegador não está salvando: exporte um PNG antes de sair.',
      empty: 'vazio', grid: 'Grade do ano, uma coluna por mês',
      defaults: ['Ótimo', 'Bom', 'Normal', 'Pra baixo', 'Ruim'],
      untitled: 'Sem nome',
      sheetTitle: 'Ano em pixels',
      file: 'ano-em-pixels',
    },
    nav: { print: 'Modelos', maker: 'Criador online', privacy: 'Privacidade' },
    footer: 'Chroma: Color Year in Pixels, de Baltasar Jiménez.',
  },
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const kb = (n) => Math.round(n / 1024)
const ICON = {
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5"/></svg>',
}

function head(lang, kind, t) {
  const url = SITE + PAGES[kind][lang]
  const alts = Object.keys(PAGES[kind]).map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE + PAGES[kind][l]}">`).join('\n')
  const og = `${SITE}/yip/og/${kind}-${lang}.png`
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<link rel="canonical" href="${url}">
${alts}
<link rel="alternate" hreflang="x-default" href="${SITE + PAGES[kind].en}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Chroma">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F1F1F1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E0E0E" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/yip/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/yip/icon-180.png">
<link rel="stylesheet" href="${v('/yip/yip.css')}">`
}

function header(lang, kind) {
  const t = T[lang]
  const langs = Object.keys(PAGES[kind]).map((l) =>
    `<a href="${PAGES[kind][l]}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ''}><span aria-hidden="true">${l.toUpperCase()}</span><span class="sr">${LANG_NAME[l]}</span></a>`).join('')
  return `<header class="wrap top">
<a class="brand" href="${PAGES.print[lang]}"><img src="/yip/icon.svg" alt="" width="28" height="28">Chroma</a>
<nav aria-label="Chroma">
<a href="${PAGES.print[lang]}"${kind === 'print' ? ' aria-current="page"' : ''}>${t.nav.print}</a>
<a href="${PAGES.maker[lang]}"${kind === 'maker' ? ' aria-current="page"' : ''}>${t.nav.maker}</a>
<span class="langs">${langs}</span>
</nav>
</header>`
}

function stores(campaign) {
  return `<div class="stores">
<a class="btn" data-store="play" href="${esc(play(campaign))}">Google Play ${ICON.arrow}</a>
<a class="btn" data-store="apple" href="${esc(apple(campaign))}">App Store ${ICON.arrow}</a>
</div>`
}

// Each phone sees only its own store, like the invitation page; a computer sees both.
const STORE_JS = `<script>(function(){var u=navigator.userAgent||"",a=/Android/i.test(u),i=/iPhone|iPad|iPod/i.test(u)||(/Macintosh/i.test(u)&&navigator.maxTouchPoints>1);document.querySelectorAll("[data-store]").forEach(function(e){if((a&&e.dataset.store==="apple")||(i&&e.dataset.store==="play"))e.hidden=true})})()</script>`

// A visitor who arrives with utm_* (a social post, a newsletter) takes that origin to the store instead of
// the page's own web campaign, so the consoles tell the channels apart. Values are cut to [a-z0-9_-], 40 chars.
const UTM_JS = `<script>(function(){var q=new URLSearchParams(location.search),c=function(v){return(v||"").toLowerCase().replace(/[^a-z0-9_-]/g,"").slice(0,40)},s=c(q.get("utm_source"));if(!s)return;var m=c(q.get("utm_medium"))||"referral",n=c(q.get("utm_campaign"))||"none";
document.querySelectorAll('[data-store="play"]').forEach(function(e){var x=new URL(e.href);x.searchParams.set("referrer","utm_source="+s+"&utm_medium="+m+"&utm_campaign="+n);e.href=x});
document.querySelectorAll('[data-store="apple"]').forEach(function(e){var x=new URL(e.href);x.searchParams.set("ct",(s+"-"+n).slice(0,40));e.href=x})})()</script>`


function footer(lang) {
  const t = T[lang]
  return `<footer><div class="wrap"><span>${esc(t.footer)}</span><nav aria-label="${esc(t.nav.privacy)}">
<a href="${PAGES.print[lang]}">${t.nav.print}</a><a href="${PAGES.maker[lang]}">${t.nav.maker}</a><a href="/">${t.nav.privacy}</a></nav></div></footer>`
}

const appJson = (lang) => ({
  '@type': 'MobileApplication',
  name: 'Chroma: Color Year in Pixels',
  operatingSystem: 'Android, iOS',
  applicationCategory: 'LifestyleApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  installUrl: play(`yip-ld-${lang}`),
  sameAs: ['https://play.google.com/store/apps/details?id=com.baltajmn.color', 'https://apps.apple.com/app/id6819301462'],
})

function printPage(lang) {
  const t = T[lang].print
  const notesFor = (layout, paper) => t.notes[layout].map(([a, text]) => {
    const [x, y] = ANCHORS[`${lang}-${layout}-${paper}`][a]
    return { x, y, text: typeof text === 'string' ? text : text[paper] }
  })
  const file = (layout, paper) => ({ href: `/yip/pdf/${pdfName(lang, layout, paper)}`, name: pdfName(lang, layout, paper), kb: kb(SIZES[pdfName(lang, layout, paper)]) })
  const data = {}
  for (const l of LAYOUTS) for (const p of Object.keys(PAPER)) data[`${l}-${p}`] = { ...file(l, p), svg: `/yip/sheets/${lang}-${l}-${p}.svg`, notes: notesFor(l, p), alt: t.alt(t.layouts[l], t.papers[p]), ratio: `${PAPER[p].w} / ${PAPER[p].h}`, meta: t.meta(file(l, p).kb) }
  // A4 in the page; the script switches to Letter where Letter is the paper in the shops.
  const first = data['classic-a4']
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      appJson(lang),
      {
        '@type': 'HowTo',
        name: t.stepsH,
        inLanguage: lang,
        tool: [{ '@type': 'HowToTool', name: 'Printer' }, { '@type': 'HowToTool', name: 'Colored pens or pencils' }],
        step: t.steps.map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })),
      },
    ],
  }
  const seg = (name, legend, opts, checked) => `<fieldset class="seg"><legend>${esc(legend)}</legend><div class="opts">${Object.entries(opts).map(([v, label]) =>
    `<label><input type="radio" name="${name}" value="${v}"${v === checked ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset>`
  const dots = (notes) => notes.map((n, i) => `<span class="dot" style="--x:${n.x}%;--y:${n.y}%" aria-hidden="true">${i + 1}</span>`).join('')
  const notes = (ns) => ns.map((n) => `<li style="--x:${n.x}%;--y:${n.y}%"><span>${esc(n.text)}</span></li>`).join('')
  const ideas = t.ideas.map(([id, name, text, labels]) => `<li><h3>${esc(name)}</h3><p>${esc(text)}</p><ul class="pal">${labels.map((label, i) =>
    `<li><i style="background:${IDEA_COLORS[id][i]}"></i>${esc(label)}</li>`).join('')}</ul></li>`).join('\n')
  const demo = t.keyDemo.map(([label, n], i) => `<li><i style="background:${IDEA_COLORS.mood[i]}"></i>${esc(label)}<small>${n}</small></li>`).join('')
  const files = LAYOUTS.map((l) => `<tr><td>${esc(t.layouts[l])}</td>${Object.keys(PAPER).map((p) => {
    const f = file(l, p)
    return `<td><a href="${f.href}" download="${f.name}">${esc(t.papers[p])}</a> <small>${f.kb} KB</small></td>`
  }).join('')}</tr>`).join('\n')
  const shot = `/yip/img/app-${lang}.webp`
  return `${head(lang, 'print', t)}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
${header(lang, 'print')}
<main>
<section class="wrap hero">
<div class="hero-copy">
<h1>${esc(t.h1)} <span class="numeral">${YEAR}</span></h1>
<p class="lede">${esc(t.lede)}</p>
<form id="pick">
${seg('layout', t.layout, t.layouts, 'classic')}
${seg('paper', t.paper, t.papers, 'a4')}
<a class="btn primary" id="dl" href="${first.href}" download="${first.name}">${ICON.download}${esc(t.download)}</a>
<p class="note dl-meta" id="meta">${esc(first.meta)}</p>
</form>
</div>
<div class="sheet-col">
<figure class="sheet" id="sheet">
<span class="paper" id="paper" style="aspect-ratio:${first.ratio}"><img id="svg" src="${first.svg}" alt="${esc(first.alt)}" width="420" height="594" fetchpriority="high"><span id="dots">${dots(first.notes)}</span></span>
<ol class="notes" id="notes">${notes(first.notes)}</ol>
</figure>
</div>
</section>

<section class="band"><div class="wrap split">
<div>
<h2>${esc(t.makerH)}</h2>
<p>${esc(t.makerP)}</p>
<p><a class="btn" href="${PAGES.maker[lang]}">${esc(t.makerBtn)} ${ICON.arrow}</a></p>
</div>
<figure style="margin:0"><ul class="keydemo" aria-label="${esc(t.keyDemoNote)}">${demo}</ul><figcaption class="note" style="margin:10px 20px 0">${esc(t.keyDemoNote)}</figcaption></figure>
</div></section>

<section class="band"><div class="wrap split">
<div>
<h2>${esc(t.appH)}</h2>
<p>${esc(t.appP1)}</p>
<p>${esc(t.appP2)}</p>
${stores(`yip-print-${lang}`)}
</div>
<img class="phone" src="${shot}" alt="${esc(t.appAlt)}" width="720" height="1321" loading="lazy">
</div></section>

<section class="band"><div class="wrap">
<h2>${esc(t.ideasH)}</h2>
<p>${esc(t.ideasP)}</p>
<ul class="ideas">
${ideas}
</ul>
</div></section>

<section class="band"><div class="wrap">
<h2>${esc(t.stepsH)}</h2>
<ol class="steps">${t.steps.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
</div></section>

<section class="band"><div class="wrap">
<h2>${esc(t.filesH)}</h2>
<p>${esc(t.filesP)}</p>
<table class="files"><thead><tr><th scope="col">${esc(t.layout)}</th>${Object.keys(PAPER).map((p) => `<th scope="col">${esc(t.papers[p])}</th>`).join('')}</tr></thead>
<tbody>
${files}
</tbody></table>
</div></section>
</main>
${footer(lang)}
<script>(function(){var D=${JSON.stringify(data)};var f=document.getElementById("pick"),img=document.getElementById("svg"),paper=document.getElementById("paper"),a=document.getElementById("dl"),meta=document.getElementById("meta"),dots=document.getElementById("dots"),notes=document.getElementById("notes");
function e(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
function show(){var d=D[f.layout.value+"-"+f.paper.value];img.src=d.svg;img.alt=d.alt;paper.style.aspectRatio=d.ratio;a.href=d.href;a.setAttribute("download",d.name);meta.textContent=d.meta;
dots.innerHTML=d.notes.map(function(n,i){return '<span class="dot" style="--x:'+n.x+'%;--y:'+n.y+'%" aria-hidden="true">'+(i+1)+"</span>"}).join("");
notes.innerHTML=d.notes.map(function(n){return '<li style="--x:'+n.x+'%;--y:'+n.y+'%"><span>'+e(n.text)+"</span></li>"}).join("")}
f.addEventListener("change",show);var r=((navigator.language||"").split("-")[1]||"").toUpperCase();if(${JSON.stringify(['US','CA','MX','PH','CL','CO','VE','GT','CR','PA','DO','SV','HN','NI','PR'])}.indexOf(r)>=0)f.paper.value="letter";if(f.layout.value!=="classic"||f.paper.value!=="a4")show()})()</script>
${UTM_JS}
${STORE_JS}
</body>
</html>
`
}

function makerPage(lang) {
  const t = T[lang].maker
  const ui = T[lang].ui
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: t.h1,
        url: SITE + PAGES.maker[lang],
        inLanguage: lang,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      },
      appJson(lang),
    ],
  }
  const svgI = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14.5 6-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9.5 6 6 6-6 6"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9.5a5 5 0 0 1 0 10H11"/></svg>',
    clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7h15M10 11v6m4-6v6M6.5 7l.8 12a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8l.8-12M9.5 7V4.5h5V7"/></svg>',
  }
  return `${head(lang, 'maker', t)}
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/json" id="t">${JSON.stringify({ lang, ...ui })}</script>
<script src="${v('/yip/maker.js')}" defer></script>
</head>
<body>
${header(lang, 'maker')}
<main>
<section class="wrap tool" aria-labelledby="h1">
<div class="tool-head">
<div class="yearbar">
<button class="icon-btn" id="prev" type="button" aria-label="${esc(ui.prev)}">${svgI.prev}</button>
<output id="year" aria-live="polite">${YEAR}</output>
<button class="icon-btn" id="next" type="button" aria-label="${esc(ui.next)}">${svgI.next}</button>
</div>
<h1 id="h1">${esc(t.h1)}</h1>
<div class="actions">
<button class="icon-btn" id="undo" type="button" aria-label="${esc(ui.undo)}" title="${esc(ui.undo)}" disabled>${svgI.undo}</button>
<button class="icon-btn" id="clear" type="button" aria-label="${esc(ui.clear)}" title="${esc(ui.clear)}">${svgI.clear}</button>
<button class="btn primary" id="export" type="button">${ICON.download}${esc(ui.export)}</button>
</div>
</div>
<div class="work">
<div class="card">
<div class="yg" id="grid" role="group" aria-label="${esc(ui.grid)}" aria-describedby="help"></div>
<p class="status" id="status">${esc(ui.hint)}</p>
</div>
<div class="card key">
<h2 id="keyh">${esc(ui.key)}</h2>
<ol id="key" aria-labelledby="keyh"></ol>
<button class="btn add" id="add" type="button">${esc(ui.add)}</button>
<p class="help" id="help">${esc(ui.help)}</p>
<p class="help" id="saved">${esc(ui.saved)}</p>
</div>
</div>
<div class="strip" id="strip" aria-hidden="true"></div>
<p class="sr" id="live" aria-live="polite"></p>
<noscript><p>JavaScript is needed for the maker. <a href="${PAGES.print[lang]}">${esc(t.paperLink)}</a></p></noscript>
</section>

<section class="band"><div class="wrap">
<h2>${esc(t.howH)}</h2>
<ol class="steps" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${t.how.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
<p style="margin-top:32px"><a href="${PAGES.print[lang]}">${esc(t.paperLink)}</a></p>
</div></section>

<section class="band"><div class="wrap split">
<div>
<h2>${esc(t.appH)}</h2>
<p>${esc(t.appP)}</p>
${stores(`yip-maker-${lang}`)}
</div>
<img class="phone" src="/yip/img/app-${lang}.webp" alt="${esc(T[lang].print.appAlt)}" width="720" height="1321" loading="lazy">
</div></section>
</main>
${footer(lang)}
${UTM_JS}
${STORE_JS}
</body>
</html>
`
}

for (const lang of Object.keys(T)) {
  for (const [kind, fn] of [['print', printPage], ['maker', makerPage]]) {
    const dir = join(ROOT, PAGES[kind][lang])
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), fn(lang))
  }
}

// sitemap.xml with the language alternates of each page, and the policy pages as they are.
const urls = []
for (const kind of Object.keys(PAGES)) {
  for (const lang of Object.keys(PAGES[kind])) {
    const alts = Object.keys(PAGES[kind]).map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE + PAGES[kind][l]}"/>`).join('') +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE + PAGES[kind].en}"/>`
    urls.push(`<url><loc>${SITE + PAGES[kind][lang]}</loc><lastmod>${TODAY}</lastmod>${alts}</url>`)
  }
}
for (const p of ['/', '/terms.html', '/delete.html']) urls.push(`<url><loc>${SITE + p}</loc></url>`)
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`)
writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
console.log('ok')
