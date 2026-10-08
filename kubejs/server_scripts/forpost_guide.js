// Форпост: «Справочник переселенца» — книга для новичков (управление, крафт, JEI, выживание на Талосе).
// Обычная подписанная книга: работает без обновления клиента.
//  - выдаётся один раз при первом входе (и заново, если вышла новая версия справочника);
//  - стоит на книжной полке в каждом корабле («Искра» и «Рассвет»), полка дозаполняется сама;
//  - /гайд (или /guide) — получить справочник в любой момент.
// Текст книги собран из kubejs-исходника (guide content.txt), страницы ниже сгенерированы автоматически.
// Только var + IIFE (Rhino, общая область видимости скриптов KubeJS).
;(function () {

var GUIDE_VER = 1
var TITLE = 'Справочник переселенца'
var MAT = '§8[MAT]§r '
var TALOS = 'minecraft:overworld'
// книжная полка в корабле относительно точки появления (sx, sy, sz) и свободный слот
var SHELF = { solo: { dx: -2, dy: 0, dz: 2, slot: 2 }, duo: { dx: 3, dy: 0, dz: -2, slot: 2 } }

var PAGES = [
  "{\"text\": \"\", \"extra\": [{\"text\": \"СПРАВОЧНИК\\nПЕРЕСЕЛЕНЦА\\n\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"Для тех, кто первый раз играет в Майнкрафт с модами.\\n\\nЧто нажимать, как крафтить, где смотреть рецепты и как выжить на Талосе.\\n\\n\", \"color\": \"black\"}, {\"text\": \"Листай дальше или жми на главу в оглавлении.\", \"color\": \"dark_gray\", \"italic\": true}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОГЛАВЛЕНИЕ\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\nУправление\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"4\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 4\"}}, {\"text\": \"\\nКак крафтить\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"7\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 7\"}}, {\"text\": \"\\nJEI — все рецепты\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"11\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 11\"}}, {\"text\": \"\\nКнига квестов\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"15\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 15\"}}, {\"text\": \"\\nКоманды сервера\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"18\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 18\"}}, {\"text\": \"\\nВода\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"20\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 20\"}}, {\"text\": \"\\nЖара\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"23\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 23\"}}, {\"text\": \"\\nЕда и питание\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"26\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 26\"}}, {\"text\": \"\\nНочь и мобы\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"29\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 29\"}}, {\"text\": \"\\nПервые шаги\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"32\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 32\"}}, {\"text\": \"\\nЛиства и нитки\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"36\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 36\"}}, {\"text\": \"\\nМеталлы\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"39\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 39\"}}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ОГЛАВЛЕНИЕ\\n\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\nИнструменты\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"42\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 42\"}}, {\"text\": \"\\nСундуки и руины\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"45\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 45\"}}, {\"text\": \"\\nТехника и цель игры\", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"48\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 48\"}}, {\"text\": \"\\nЕсли не знаешь что \", \"color\": \"dark_aqua\", \"underlined\": false, \"clickEvent\": {\"action\": \"change_page\", \"value\": \"50\"}, \"hoverEvent\": {\"action\": \"show_text\", \"contents\": \"Стр. 50\"}}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"УПРАВЛЕНИЕ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nОсновные клавиши\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- W A S D — ходить\", \"color\": \"black\"}, {\"text\": \"\\n- Пробел — прыжок\", \"color\": \"black\"}, {\"text\": \"\\n- Shift — красться (с\\nкрая не упадёшь)\", \"color\": \"black\"}, {\"text\": \"\\n- ЛКМ — бить, ломать\\n(держи кнопку)\", \"color\": \"black\"}, {\"text\": \"\\n- ПКМ — открыть,\\nпоставить,\\nиспользовать\", \"color\": \"black\"}, {\"text\": \"\\n- E — инвентарь\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- Q — выбросить\\nпредмет\", \"color\": \"black\"}, {\"text\": \"\\n- 1–9 или колесо —\\nчто в руке\", \"color\": \"black\"}, {\"text\": \"\\n- F — во вторую руку\", \"color\": \"black\"}, {\"text\": \"\\n- T — чат, / —\\nкоманда\", \"color\": \"black\"}, {\"text\": \"\\n- F5 — вид со\\nстороны\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nВ инвентаре\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Shift+клик —\\nбыстро переложить\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- ПКМ по стопке —\\nвзять половину\", \"color\": \"black\"}, {\"text\": \"\\n- Зажми ЛКМ и\\nпроведи по клеткам\\n— разложить поровну\", \"color\": \"black\"}, {\"text\": \"\\n- Двойной клик —\\nсобрать одинаковые\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"КАК КРАФТИТЬ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКрафт — это сборка\\nновых предметов из\\nдругих.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nСетка\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСетка 2×2 есть прямо\\nв инвентаре (E). Для\\nбольших рецептов\\nнужна сетка 3×3 —\\nверстак.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"В стартовом наборе\\nесть верстак на\\nпалке: возьми его в\\nруку и нажми ПКМ —\\nсетка 3×3 откроется\\nгде угодно.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКак собрать\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n1. Разложи предметы\\nпо клеткам, как в\\nрецепте.\", \"color\": \"black\"}, {\"text\": \"\\n2. Справа появится\\nрезультат — забери\\nего.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Shift+клик по\\nрезультату —\\nсобрать сразу\\nстолько, сколько\\nхватит.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Форма важна\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nКирка — это буква Т\\nиз материала и\\nпалок. Те же\\nпредметы в другом\\nпорядке не\\nсработают. Некоторые\\nрецепты\\nбесформенные —\\nклади как угодно.\", \"color\": \"black\"}, {\"text\": \"\\nУчить рецепты не\\nнужно: всё есть в JEI\\n(следующая глава).\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"JEI — ВСЕ РЕЦЕПТЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nСправа от инвентаря\\n— список всех\\nпредметов игры. Это\\nJEI.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nДве главные\\nкнопки\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nНаведи мышь на любой\\nпредмет (в списке\\nили у себя) и нажми:\", \"color\": \"black\"}, {\"text\": \"\\n- R — как это\\nсделать\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- U — где это\\nиспользуется\", \"color\": \"black\"}, {\"text\": \"\\nСтрелки вверху окна\\nлистают способы:\\nверстак, печь, сито,\\nмашины.\", \"color\": \"black\"}, {\"text\": \"\\nBackspace — назад.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nПоиск\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСтрока под списком.\\nПиши по-русски:\\n«вода», «сито»,\\n«фильтр».\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Начни с @ и названия\\nмода — например\\n@create — будут\\nтолько его предметы.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКнопка +\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nВ окне рецепта нажми\\n+ — JEI сам разложит\\nрецепт в сетку, если\\nу тебя хватает\\nпредметов.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Если рецепта нет\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЗначит предмет\\nдобывают: из сита, с\\nмобов, из сундуков в\\nруинах. Нажми U,\\nчтобы понять, зачем\\nон нужен.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"КНИГА КВЕСТОВ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКнига всегда с\\nтобой. Это план игры\\nпо шагам.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКак пользоваться\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nОткрой её (ПКМ с\\nкнигой в руке).\\nГлавы идут по\\nпорядку: Пролог,\\nзатем Основы\\nвыживания и дальше.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Квест — это задание:\\nчто сделать или\\nпринести. Выполнил —\\nзабери награду в\\nквесте.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЕсли потерял\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nКоманда /книга —\\nвыдаст новую.\\nПрогресс не\\nпропадает.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Играешь с другом\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nКнига → вкладка\\n«Группа» → вступи в\\nгруппу друга. Квесты\\nи награды станут\\nобщими.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nMAT\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nMAT — бортовой ИИ\\nкорабля. Он пишет\\nподсказки в чат с\\nпометкой [MAT]. Читай\\nих.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"КОМАНДЫ СЕРВЕРА\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nПиши в чат (клавиша\\nT или /):\", \"color\": \"black\"}, {\"text\": \"\\n- /base — домой на\\nкорабль\", \"color\": \"black\"}, {\"text\": \"\\n- /base list — все\\nбазы\", \"color\": \"black\"}, {\"text\": \"\\n- /lobby — Купол:\\nсменить базу или\\nкорабль\", \"color\": \"black\"}, {\"text\": \"\\n- /книга — новая\\nкнига квестов\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- /гайд — этот\\nсправочник\", \"color\": \"black\"}, {\"text\": \"\\n- /intro —\\nпосмотреть посадку\\nещё раз\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ВОДА\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКапли справа над\\nполоской еды — это\\nжажда. Если опустеют\\n— начнёшь терять\\nздоровье.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЧистая вода\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nВ стартовом наборе 6\\nбутылок воды и 2\\nбурдюка. Береги их.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Где взять ещё\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Пустая бутылка +\\nблок земли в сетке\\nкрафта = грязная\\nвода.\", \"color\": \"black\"}, {\"text\": \"\\n- Грязную воду\\nположи в печь —\\nполучится чистая.\", \"color\": \"black\"}, {\"text\": \"\\n- Фильтр + бутылка\\nили ведро воды в\\nсетке = вода чище.\", \"color\": \"black\"}, {\"text\": \"\\nГрязная вода опасна:\\nот неё может\\nстошнить.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Гидратор\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nРюкзак с трубкой:\\nнаполни водой, и он\\nпоит сам. Смотри\\nрецепт в JEI.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЖАРА\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nТалос — горячая\\nпустыня. Над\\nхотбаром есть\\nзначок температуры\\nтела. Если он\\nкраснеет — перегрев\\nи урон.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Как не\\nперегреться\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Тень и крыша.\\nВнутри корабля\\nпрохладно.\", \"color\": \"black\"}, {\"text\": \"\\n- Ночью жары нет.\", \"color\": \"black\"}, {\"text\": \"\\n- Пей воду.\", \"color\": \"black\"}, {\"text\": \"\\n- Пустынная одежда:\\nделается из кожи и\\nниток.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- Утеплитель\\nкладётся в\\nотдельный слот и\\nработает вместе с\\nбронёй.\", \"color\": \"black\"}, {\"text\": \"\\nТермометр\\nпоказывает\\nтемпературу вокруг.\", \"color\": \"black\"}, {\"text\": \"\\nДнём не бегай долго\\nпод солнцем.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЕДА И ПИТАНИЕ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЕды пять групп:\\nбелки (мясо),\\nзерновые (хлеб, рис),\\nовощи, фрукты и\\nсладкое.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Ешь разное\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЕсли какой-то\\nгруппы мало — удар\\nслабее, бег\\nмедленнее. Если\\nвсего хватает —\\nбонусы.\", \"color\": \"black\"}, {\"text\": \"\\nПосмотреть, чего не\\nхватает: кнопка с\\nяблоком в инвентаре.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Где брать\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Питательные\\nбрикеты из набора —\\nна крайний случай.\", \"color\": \"black\"}, {\"text\": \"\\n- Гнилая плоть зомби\\n→ вяленое мясо\\nзомби (рецепт в JEI).\", \"color\": \"black\"}, {\"text\": \"\\n- Семена из сита:\\nсажай на землю и\\nполивай.\", \"color\": \"black\"}, {\"text\": \"\\n- Кухни в руинах: там\\nеда и семена.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"НОЧЬ И МОБЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nНочью появляется\\nмного зомби,\\nскелетов и пауков.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЗащита первых\\nдней\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nПервые 60 минут игры\\nты получаешь меньше\\nурона и бьёшь\\nсильнее. Успей\\nсделать оружие.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Как пережить\\nночь\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Сиди в корабле,\\nзакрой шлюз кнопкой.\", \"color\": \"black\"}, {\"text\": \"\\n- Ставь факелы: на\\nсвету мобы не\\nпоявляются.\", \"color\": \"black\"}, {\"text\": \"\\n- Вокруг базы 7\\nчанков — лёгкая\\nзона. Дальше опаснее.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Если умер\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nТвои вещи лежат в\\nтрупе на месте\\nсмерти. Вернись и\\nнажми по нему ПКМ —\\nзаберёшь всё.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ПЕРВЫЕ ШАГИ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nДеревьев и руды\\nпочти нет. Почти всё\\nначинается с сита.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nСито\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n1. Поставь сито на\\nземлю.\", \"color\": \"black\"}, {\"text\": \"\\n2. Вставь сетку: ПКМ\\nсеткой по ситу.\", \"color\": \"black\"}, {\"text\": \"\\n3. Положи блок пыли,\\nземли или гравия:\\nПКМ блоком по ситу.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"4. Жми ПКМ по ситу\\nмного раз.\", \"color\": \"black\"}, {\"text\": \"\\nВыпадет: камешки,\\nкостная мука, семена,\\nсаженцы, кусочки\\nруды.\", \"color\": \"black\"}, {\"text\": \"\\nПыль — это земля\\nвокруг корабля, её\\nкопают лопатой или\\nрукой.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Камень и печь\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n4 камешка =\\nбулыжник. 8\\nбулыжников по кругу\\nв верстаке = печь.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nДерево\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСаженец сажай на\\nземлю (не на пыль).\\n10 раз ПКМ костной\\nмукой — и дерево\\nвыросло.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Земля\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nБочка: брось в неё\\nлиству или саженцы\\n— со временем\\nстанет землёй.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЛИСТВА И НИТКИ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nКрюк\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЛомай листву крюком\\n(делается из палок)\\n— саженцев выпадет\\nбольше, иногда\\nвыпадает шелкопряд.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Шелкопряд\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nПКМ шелкопрядом по\\nлистве — листва\\nстанет паутинной. Из\\nнеё выпадают нитки и\\nновые шелкопряды.\", \"color\": \"black\"}, {\"text\": \"\\nШелкопряд падает\\nтолько с дуба.\\nДубовое семечко ищи\\nв сите по земле.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Зачем нитки\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСетки для сита,\\nпустынная одежда,\\nлуки, шерсть.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"МЕТАЛЛЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nРуда из сита\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nВ сите выпадают\\nкусочки руды. 4\\nкусочка в сетке =\\nблок руды.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nПечь\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСверху — что\\nплавить, снизу —\\nтопливо (уголь,\\nдоски, палки). Справа\\nпоявится слиток.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Молот\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЛомай молотом:\\nбулыжник → гравий →\\nпесок. Из гравия и\\nпеска в сите\\nвыпадает больше\\nразной руды.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Сетки получше\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nНитяная → кремнёвая\\n→ железная →\\nзолотая → алмазная.\\nЧем лучше сетка, тем\\nбольше добычи.\\nРецепты в JEI.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ИНСТРУМЕНТЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nДеревянные и\\nкаменные\\nинструменты здесь\\nпочти бесполезны.\\nНастоящие делают в\\nмастерской Tinkers.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Два верстака\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\n- Конструктор\\nчастей: шаблон +\\nматериал = деталь\\n(рукоять, головка,\\nлезвие).\", \"color\": \"black\"}, {\"text\": \"\\n- Станция сборки: из\\nдеталей собирается\\nинструмент.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"С чего начать\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЛучший ранний\\nматериал — кость:\\nкости падают с\\nскелетов, ещё\\nподойдёт костная\\nмука.\", \"color\": \"black\"}, {\"text\": \"\\nСначала сделай меч и\\nкирку. Для фермы —\\nмотыгу-кирку.\", \"color\": \"black\"}, {\"text\": \"\\nИнструменты Tinkers\\nне ломаются\\nнасовсем: их можно\\nчинить на станции.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"СУНДУКИ И РУИНЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nВ руинах, городах и\\nподземельях стоят\\nсундуки с добычей.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nЧем сильнее\\nохрана — тем\\nлучше лут\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nЕсли рядом спаунер\\nили сильные мобы,\\nпри открытии\\nсундука появятся\\nзвёзды:\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"★ — зомби, скелеты,\\nпауки\", \"color\": \"black\"}, {\"text\": \"\\n★★ — особые мобы,\\nкриперы\", \"color\": \"black\"}, {\"text\": \"\\n★★★ — ифриты,\\nэндермены\", \"color\": \"black\"}, {\"text\": \"\\n★★★★ — боссы\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"По комнатам\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nКухня — еда и вода.\\nСпальня — ткань и\\nодежда. Офис —\\nбумага и записки.\\nЯщики — инструменты\\nи железо.\\nЛаборатория —\\nэлектроника.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ТЕХНИКА И ЦЕЛЬ\\nИГРЫ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nCreate\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nМашины работают от\\nвращения: водяное\\nколесо или ветряк →\\nвал → механизмы.\\nПресс, дробилка,\\nмиксер.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"Нефть\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nНа нефтяной вышке\\nесть нефть.\\nПерегонная\\nустановка\\nPneumaticCraft\\nделает из неё дизель\\nи пластик.\", \"color\": \"black\"}, {\"text\": \"\\n\"}, {\"text\": \"\\nГлавная цель\", \"bold\": true, \"color\": \"dark_green\"}, {\"text\": \"\\nСобрать ракету и\\nулететь на Землю.\\nВесь путь по шагам —\\nв книге квестов.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"ЕСЛИ НЕ ЗНАЕШЬ\\nЧТО ДЕЛАТЬ\", \"bold\": true, \"color\": \"dark_blue\"}, {\"text\": \"\\n\"}, {\"text\": \"\\n- Что делать дальше?\\n→ книга квестов.\", \"color\": \"black\"}, {\"text\": \"\\n- Как сделать\\nпредмет? → наведи и\\nнажми R.\", \"color\": \"black\"}, {\"text\": \"\\n- Зачем этот\\nпредмет? → наведи и\\nнажми U.\", \"color\": \"black\"}, {\"text\": \"\\n- Где вещи после\\nсмерти? → в трупе на\\nместе смерти.\", \"color\": \"black\"}]}",
  "{\"text\": \"\", \"extra\": [{\"text\": \"- Заблудился? →\\n/base.\", \"color\": \"black\"}, {\"text\": \"\\n- Спроси друга в\\nчате (T).\", \"color\": \"black\"}, {\"text\": \"\\nУдачи, переселенец!\", \"color\": \"black\"}, {\"text\": \"\\n— MAT\", \"color\": \"black\"}]}"
]

function guideItem() {
  return Item.of('minecraft:written_book', { title: TITLE, author: 'MAT', generation: 0, forpost_guide: GUIDE_VER, pages: PAGES })
}

function isGuide(st) {
  try { return st && !st.isEmpty() && String(st.id) === 'minecraft:written_book' && st.nbt && String(st.nbt.getString('title')) === TITLE } catch (e) { return false }
}

function giveGuide(player) {
  player.give(guideItem())
  player.persistentData.putInt('forpost_guide', GUIDE_VER)
}

// ---------- полка в корабле ----------
var $Shelf = null
try { $Shelf = Java.loadClass('net.minecraft.world.level.block.entity.ChiseledBookShelfBlockEntity') } catch (e) { $Shelf = null }
var $BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

function shelfDone(server) {
  var raw = server.persistentData.getString('forpost_guide_shelves')
  return raw ? JSON.parse(raw) : {}
}

function fillShelves(server) {
  if (!global.forpostBases || !$Shelf) return
  var level = server.getLevel(TALOS)
  if (!level) return
  var done = shelfDone(server)
  var changed = false
  global.forpostBases(server).forEach(b => {
    if (!b.kind || b.sx === undefined || !SHELF[b.kind]) return
    if (done[String(b.id)] === GUIDE_VER) return
    var s = SHELF[b.kind]
    var pos = new $BlockPos(b.sx + s.dx, b.sy + s.dy, b.sz + s.dz)
    if (!level.isLoaded(pos)) return // чанк не загружен — попробуем позже
    var be = level.getBlockEntity(pos)
    if (!be || !(be instanceof $Shelf)) {
      console.warn('[forpost_guide] база ' + b.id + ': полки нет в ' + pos)
      done[String(b.id)] = GUIDE_VER; changed = true // не ищем бесконечно
      return
    }
    // убираем старую версию справочника и ставим новую в свободный слот
    var slot = -1
    for (var i = 0; i < 6; i++) {
      if (isGuide(be.getItem(i))) { be.removeItem(i, 1) }
    }
    if (be.getItem(s.slot).isEmpty()) slot = s.slot
    for (var j = 0; j < 6 && slot < 0; j++) if (be.getItem(j).isEmpty()) slot = j
    if (slot >= 0) {
      be.setItem(slot, guideItem())
      be.setChanged()
      console.info('[forpost_guide] база ' + b.id + ': справочник на полке, слот ' + slot)
    }
    done[String(b.id)] = GUIDE_VER; changed = true
  })
  if (changed) server.persistentData.putString('forpost_guide_shelves', JSON.stringify(done))
}

var TICKS = 0
ServerEvents.tick(event => {
  if (++TICKS % 200 !== 0) return
  try { fillShelves(event.server) } catch (e) { console.error('[forpost_guide] shelf: ' + e) }
})

// ---------- выдача ----------
PlayerEvents.loggedIn(event => {
  var p = event.player
  if (p.persistentData.getInt('forpost_guide') >= GUIDE_VER) return
  event.server.scheduleInTicks(400, () => {
    var pl = event.server.getPlayerList().getPlayerByName(p.username)
    if (!pl) return
    giveGuide(pl)
    pl.tell(MAT + '§aВыдан «Справочник переселенца»: управление, крафт, где смотреть рецепты, как выжить. Ещё один стоит на полке в корабле. Потерял — §f/гайд§a.')
  })
})

ServerEvents.commandRegistry(event => {
  var Commands = event.commands
  var reg = name => event.register(Commands.literal(name).requires(src => true).executes(ctx => {
    var p = ctx.source.playerOrException
    giveGuide(p)
    p.tell(MAT + '§aСправочник переселенца у тебя в инвентаре. Нажми ПКМ с книгой в руке.')
    return 1
  }))
  reg('гайд'); reg('guide'); reg('справочник')
})

})()
