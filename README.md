# Форпост 1.0

Сборка Minecraft **1.20.1 · Forge 47.4.20** (основа Desolate Planet, плюс колонии MineColonies, AE2 и свои правки сервера «Форпост»).
Репозиторий — это не архив с модами, а «рецепт»: список модов + конфиги + скрипты. Установщик **packwiz** сам скачивает нужные моды и при каждом запуске подтягивает свежую версию сборки.

**Сервер «Форпост»** уже добавлен в список «Сетевая игра» после первой установки (если у тебя уже был свой список серверов, он не перезаписывается — тогда добавь адрес вручную, он есть в Telegram-группе «Форпост»).

## Самая простая установка (Windows, TLauncher)

1. В TLauncher выбери версию **Forge 1.20.1**, нажми «Установить и играть», дождись главного меню игры и закрой её.
2. Скачай установщик: [Forpost-installer.bat](https://raw.githubusercontent.com/Badyaa/forpost-pack/main/install/Forpost-installer.bat) (правый клик → «Сохранить как…», если браузер просто открыл текст).
3. Дважды кликни скачанный файл. Если Windows пишет «защитил ваш компьютер» — нажми «Подробнее» → «Выполнить в любом случае».
4. В окне выбери папку игры (обычно уже подставлена `.minecraft`) и нажми OK. Дальше всё само: нужная Java, моды, настройки (первый раз ~30 минут, около 650 МБ).
5. Когда напишет «ГОТОВО» — запускай **Forge 1.20.1** из TLauncher, в «Сетевой игре» будет сервер «Форпост». Память для игры: 8 ГБ.

Чтобы обновить сборку позже, просто снова запусти тот же файл.

## Что нужно

- Minecraft 1.20.1 с Forge 47.4.20
- Java 17 (Temurin: <https://adoptium.net/temurin/releases/?version=17>)
- 8 ГБ памяти под игру (в настройках лаунчера: Xmx 8 ГБ), всего в компьютере желательно 16 ГБ

Ссылка на сборку: `https://raw.githubusercontent.com/Badyaa/forpost-pack/main/pack.toml`

## Вариант А: Prism Launcher (лицензия или offline-аккаунт)

1. Prism Launcher → **Добавить инстанс** → Minecraft **1.20.1**, загрузчик **Forge 47.4.20** → назвать «Форпост».
2. Скачай [packwiz-installer-bootstrap.jar](https://github.com/packwiz/packwiz-installer-bootstrap/releases/latest/download/packwiz-installer-bootstrap.jar) и положи в папку `minecraft` инстанса (ПКМ по инстансу → «Папка Minecraft»).
3. Инстанс → **Настройки → Пользовательские команды** → включить → в «Pre-launch command»:

   ```
   "$INST_JAVA" -jar packwiz-installer-bootstrap.jar https://raw.githubusercontent.com/Badyaa/forpost-pack/main/pack.toml
   ```
4. Память в настройках инстанса: максимум 8000 МБ. Запускай — при каждом запуске сборка обновляется сама.

## Вариант Б: TLauncher (без лицензии)

1. В TLauncher выбери версию **Forge 1.20.1** (если нет — поставь Forge 47.4.20 официальным установщиком с files.minecraftforge.net) и один раз запусти игру до главного меню, чтобы создались папки.
2. Открой папку игры (значок папки внизу TLauncher). Положи в неё файлы из папки [`install`](install): `Forpost-update.bat` (Windows) или `Forpost-update.command` (Mac).
3. Дважды щёлкни по файлу — он скачает установщик и все моды (первый раз ~650 МБ). Дальше запускай игру из TLauncher.
4. Когда вышло обновление сборки (смотри в группе) — снова запусти `Forpost-update.bat`.

Для игры без лицензии сервер должен быть в offline-режиме (`online-mode=false`) — это решает владелец сервера.

## Для администратора

- Обновление сборки: поправить моды/конфиги в рабочем инстансе → `python3 tools/sync_from_instance.py "<путь к minecraft инстанса>" --version 1.1` → `git add -A && git commit && git push`.
- Настройки игрока (`*client*` в config, `options.txt`) помечены `preserve` — установщик их не перезаписывает.
- Свои jar (порт AE2Colonies, исправленный ColonyRank, Mekanism и пр.) лежат прямо в `mods/`; остальные моды — ссылки на CurseForge/Modrinth.
