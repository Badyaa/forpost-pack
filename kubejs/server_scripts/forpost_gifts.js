// Форпост: подарки игрокам от владельца сервера (выдаются один раз, когда игрок в сети).
// Сейчас: Kirka1004 — книга «Нефтяная вышка — полевой гайд» + сообщение в чат всем игрокам.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var MAT = '§8[MAT]§r '
var OIL_PAGES = [
  "{\"text\": \"\", \"extra\": [{\"text\": \"НЕФТЯНАЯ\\nВЫШКА\\n\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"Полевой гайд для Kirka1004.\\n\\nГде вышка, кто её охраняет, что там забрать и зачем.\\n\\n\", \"color\": \"black\"}, {\"text\": \"Листай дальше или жми на главу в оглавлении.\", \"color\": \"dark_gray\", \"italic\": true}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОГЛАВЛЕНИЕ\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\nЧто это\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"4\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 4\"}}, {\"text\": \"\\nИстория\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"5\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 5\"}}, {\"text\": \"\\nЧто случилось\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"7\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 7\"}}, {\"text\": \"\\nЗачем она нам\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"9\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 9\"}}, {\"text\": \"\\nКак дойти\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"11\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 11\"}}, {\"text\": \"\\nОхрана\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"12\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 12\"}}, {\"text\": \"\\nГлавное: детали\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"14\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 14\"}}, {\"text\": \"\\nЗачем детали\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"16\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 16\"}}, {\"text\": \"\\nОружейка\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"18\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 18\"}}, {\"text\": \"\\nГородок\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"20\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 20\"}}, {\"text\": \"\\nНефть\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"21\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 21\"}}, {\"text\": \"\\nКвесты\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"22\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 22\"}}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОГЛАВЛЕНИЕ\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\nСоветы\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"24\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 24\"}}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЧТО ЭТО\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nНефтяная вышка —\\nброшенная станция\\nпереработки нефти.\\nЗдесь детали для\\nглавы квестов «Под\\nдавлением», оружие и\\nприпасы.\", \"color\": \"black\"}, {\"text\": \"\\nОхраняется. Иди\\nвдвоём, днём, с\\nоружием, едой и\\nводой.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ИСТОРИЯ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nБуровую станцию\\n«Глубина-3»\\nпостроили первые\\nколонисты Талоса,\\nзадолго до\\n«Рассвета-7».\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Сканеры нашли нефть\\nна самом дне\\nпланеты. Станция\\nкачала её,\\nперегоняла в\\nтопливо и пластик и\\nснабжала города\\nвокруг.\", \"color\": \"black\"}, {\"text\": \"\\nЗдесь жила целая\\nсмена: спальни,\\nкухни, офисы, своя\\nохрана и оружейка.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЧТО СЛУЧИЛОСЬ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКогда пришли\\nпыльные бури и жара,\\nколония начала\\nэвакуацию. Последний\\nчелнок ушёл без\\nсмены «Глубины-3».\", \"color\": \"black\"}, {\"text\": \"\\nОставшиеся держали\\nоборону, сколько\\nмогли. Теперь они\\nбродят по станции —\\nпесчаные зомби в\\nрабочих робах.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Перегонные\\nустановки разбиты,\\nбарокамера\\nразворочена, но\\nдетали ещё можно\\nспасти.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЗАЧЕМ ОНА НАМ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nMAT: «Пластик — ключ\\nк печатным платам.\\nПлаты — ключ к\\nракете. Ракета —\\nключ к Земле».\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Без перегонки нефти\\nнет пластика,\\nтоплива и смазки.\\nВышка —\\nединственное место\\nна Талосе, где\\nостались детали\\nперегонной\\nустановки и\\nбарокамеры.\", \"color\": \"black\"}, {\"text\": \"\\nВосстановишь её —\\nоткроешь путь к\\nтехнологиям и домой.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"КАК ДОЙТИ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nОт вашей базы около\\n200 блоков на восток\\nи 100 на юг.\", \"color\": \"black\"}, {\"text\": \"\\nЦентр вышки: X −2008,\\nZ 2124.\", \"color\": \"black\"}, {\"text\": \"\\nКоординаты видно по\\nF3 или на карте.\", \"color\": \"black\"}, {\"text\": \"\\nКвест «Дорога к\\nвышке» засчитается\\nсам, когда подойдёшь.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОХРАНА\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\n20 спаунеров:\\nпесчаные зомби,\\nзомби-пиглины, 2\\nифрита (север Z 2068\\nи юг Z 2180), зомби,\\nпещерный паук.\", \"color\": \"black\"}, {\"text\": \"\\nИфриты стреляют\\nогнём — к ним не\\nподходи первым.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Спаунер можно\\nсломать киркой —\\nтогда мобы там\\nбольше не появятся.\\nФакелы рядом тоже\\nмешают ему.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ГЛАВНОЕ: ДЕТАЛИ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nВосточный край,\\nнаверху (X −1955, Z\\n2118, высота 67–71):\\nповреждённые\\nперегонные\\nустановки и их\\nвыходы.\", \"color\": \"black\"}, {\"text\": \"\\nЦентр (X −2028, Z\\n2127, высота 64–68):\\nповреждённые стенки\\nбарокамеры.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Ломай железной\\nкиркой или лучше.\\nЗабирай всё.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЗАЧЕМ ДЕТАЛИ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nИз стенок\\nсобирается\\nбарокамера: куб\\n3×3×3, внутри пусто,\\nодна стенка —\\nклапан.\", \"color\": \"black\"}, {\"text\": \"\\nПерегонная\\nустановка делает из\\nнефти дизель,\\nкеросин, бензин и\\nгаз.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Как чинить детали —\\nнаведи на них в JEI и\\nнажми U.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОРУЖЕЙКА\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЮг вышки (X −2015, Z\\n2161–2165).\", \"color\": \"black\"}, {\"text\": \"\\n8 обычных шкафов:\\nпистолет, винтовка\\nили дробовик — у\\nкаждого шанс 1 из 6,\\nиначе пачки\\nпатронов.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"4 продвинутых шкафа\\n(ниже, высота 62):\\nпистолет-пулемёт,\\nавтомат или тяжёлая\\nвинтовка — шанс 1 из\\n7 каждое, иначе\\nпатроны.\", \"color\": \"black\"}, {\"text\": \"\\nОружие лежит\\nразряженным, патроны\\nк нему — рядом.\\nПеред боем заряди.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ГОРОДОК\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЯщики — инструменты,\\nжелезо, детали.\", \"color\": \"black\"}, {\"text\": \"\\nКухни — еда, вода,\\nсемена.\", \"color\": \"black\"}, {\"text\": \"\\nСпальни — ткань,\\nодежда, бинты.\", \"color\": \"black\"}, {\"text\": \"\\nОфисы — бумага и\\nзаписки колонистов.\", \"color\": \"black\"}, {\"text\": \"\\nЧем сильнее охрана\\nрядом, тем лучше\\nдобыча (звёзды над\\nхотбаром).\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"НЕФТЬ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nНефти на самой вышке\\nнет. Она глубоко под\\nземлёй, на дне мира\\n(высота −50…−63).\", \"color\": \"black\"}, {\"text\": \"\\nКачают её газлифтом\\nPneumaticCraft —\\nквест «Чёрное\\nзолото».\", \"color\": \"black\"}, {\"text\": \"\\nПерегоняют в\\nустановке с вышки —\\nквест «Утончённый\\nвкус».\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"КВЕСТЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nВ книге квестов\\nновый раздел\\n«Нефтяная вышка»:\\nдойти, зачистить\\nохрану, забрать\\nдетали, восстановить\\nперегонку и\\nпроложить к вышке\\nпоезд или рельсы с\\nбазы. Возрождение\\nостаётся на базе.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"За каждый шаг —\\nнаграда.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"СОВЕТЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\n- Вода и еда на 2\\nдня.\", \"color\": \"black\"}, {\"text\": \"\\n- Не стой под\\nифритами.\", \"color\": \"black\"}, {\"text\": \"\\n- Сначала ломай\\nближние спаунеры.\", \"color\": \"black\"}, {\"text\": \"\\n- Ставь сундук\\nрядом: деталей много.\", \"color\": \"black\"}, {\"text\": \"\\n- Внутри темно —\\nбери факелы.\", \"color\": \"black\"}, {\"text\": \"\\nУдачи!\", \"color\": \"black\"}, {\"text\": \"\\n— MAT\", \"color\": \"black\"}]}"
]

var GIFTS = [
  {
    key: 'oilrig_guide_kirka',
    player: 'Kirka1004',
    item: function () {
      return Item.of('minecraft:written_book', { title: 'Нефтяная вышка', author: 'MAT', generation: 0, pages: OIL_PAGES })
    },
    chat: 'Kirka1004 получил книгу «Нефтяная вышка — полевой гайд». В книге квестов новый раздел «Нефтяная вышка».'
  }
]

var TICKS = 0
ServerEvents.tick(event => {
  if (++TICKS % 100 !== 0) return
  var server = event.server
  GIFTS.forEach(g => {
    try {
      var flag = 'forpost_gift_' + g.key
      if (server.persistentData.getBoolean(flag)) return
      var p = server.getPlayerList().getPlayerByName(g.player)
      if (!p) return
      p.give(g.item())
      server.persistentData.putBoolean(flag, true)
      server.getPlayerList().getPlayers().forEach(pl => pl.tell(MAT + '§a' + g.chat))
      console.info('[forpost_gifts] выдано: ' + g.key + ' -> ' + g.player)
    } catch (e) { console.error('[forpost_gifts] ' + g.key + ': ' + e) }
  })
})

})()
