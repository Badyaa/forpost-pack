#!/bin/bash
# Заливает сборку на GitHub (Badyaa/forpost-pack). Запуск: двойной щелчок в Finder.
cd "$(dirname "$0")/.."
echo "=== Заливка «Форпост» на GitHub ==="
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then gh auth setup-git; fi
if git push -u origin main; then
  echo; echo "ГОТОВО: https://github.com/Badyaa/forpost-pack"
else
  echo
  echo "Не получилось войти. Git просит имя и пароль: имя = Badyaa, пароль = токен (не пароль от аккаунта)."
  echo "Токен на 7 дней: https://github.com/settings/personal-access-tokens/new"
  echo "  Repository access: Only select repositories -> forpost-pack; Permissions -> Contents: Read and write."
  echo "Потом запусти этот файл ещё раз и вставь токен вместо пароля."
fi
read -p "Нажми Enter, чтобы закрыть..."
