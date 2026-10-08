#!/usr/bin/env python3
"""
Собирает packwiz-проект «Форпост» из инстанса Prism.

  python3 tools/sync_from_instance.py "<путь к minecraft-папке инстанса>" [--version 1.0]

Что делает:
  * mods/.index/*.pw.toml (Prism) -> mods/*.pw.toml (CurseForge / Modrinth, side=both)
  * jar без записи в .index или с изменённым хешем (свои/пропатченные) -> кладёт в mods/ как есть
  * config, kubejs, defaultconfigs, resourcepacks, shaderpacks -> как обычные файлы
  * пересчитывает index.toml и pack.toml (sha256)
Повторный запуск безопасен: репозиторий пересобирается с нуля (кроме .git, README, tools).
"""
import os, re, sys, shutil, hashlib, argparse

ap = argparse.ArgumentParser()
ap.add_argument("instance")
ap.add_argument("--version", default=None)
ap.add_argument("--out", default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
a = ap.parse_args()
SRC, OUT = a.instance, a.out

KEEP = {".git", ".github", "README.md", "tools", "LICENSE", ".gitignore", "docs", "install"}
INCLUDE_DIRS = ["config", "kubejs", "defaultconfigs", "resourcepacks", "shaderpacks"]
SKIP_NAMES = {".DS_Store", "Thumbs.db"}
SKIP_PARTS = ("_backup", "crash_assistant", "/logs/")
SKIP_EXT = (".bak", ".log", ".tmp", ".old")
# файлы, которые игрок мог настроить под себя: не перезаписывать, если уже есть
PRESERVE_PATTERNS = [r"^config/DistantHorizons", r"^config/embeddium", r"^config/oculus", r"^config/jei/",
                     r"^config/.*client", r"^config/xaero", r"^config/journeymap", r"^config/sodium", r"^config/iris",
                     r"^shaderpacks/", r"^options\.txt$"]
# лицензия "All Rights Reserved": свой (пропатченный) jar в публичный репозиторий не кладём, ставим оригинал по ссылке
NO_REDIST = {"ColonyRank-1.20.1-2.0.1.jar"}
RENAME = {"Iglee's Library-1.20.1-1.2.7.jar": "IgleesLibrary-1.20.1-1.2.7.jar"}

def sha(path, algo="sha256"):
    h = hashlib.new(algo)
    with open(path, "rb") as f:
        for ch in iter(lambda: f.read(1 << 20), b""):
            h.update(ch)
    return h.hexdigest()

def q(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'

def get(t, key, section=None):
    if section:
        m = re.search(r"\[" + re.escape(section) + r"\](.*?)(?:\n\[|\Z)", t, re.S)
        if not m: return None
        t = m.group(1)
    m = re.search(r"^" + re.escape(key) + r"\s*=\s*(?:'([^']*)'|\"([^\"]*)\"|(\d+))", t, re.M)
    if not m: return None
    return next(g for g in m.groups() if g is not None)

# --- очистка вывода
for n in os.listdir(OUT):
    if n in KEEP or n.startswith("."): continue
    p = os.path.join(OUT, n)
    try:
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    except PermissionError:
        pass  # удаление запрещено (например, в папке с ограничением) - просто перезапишем файлы поверх
os.makedirs(os.path.join(OUT, "mods"), exist_ok=True)

# --- моды
idx_dir = os.path.join(SRC, "mods", ".index")
jars = {f for f in os.listdir(os.path.join(SRC, "mods")) if f.endswith(".jar")}
meta_ok, local = {}, []
for fn in sorted(os.listdir(idx_dir)):
    if not fn.endswith(".pw.toml"): continue
    t = open(os.path.join(idx_dir, fn), encoding="utf8").read()
    fname = get(t, "filename")
    if fname not in jars: continue
    hf, h = get(t, "hash-format", "download"), get(t, "hash", "download")
    if sha(os.path.join(SRC, "mods", fname), hf) != h and fname not in NO_REDIST:
        local.append(fname); continue          # пропатчен -> шлём сам файл
    mode, url = get(t, "mode", "download"), get(t, "url", "download")
    name = get(t, "name") or fname
    out = ["filename = " + q(fname), "name = " + q(name), 'side = "both"', "", "[download]"]
    if mode == "url": out.append("url = " + q(url))
    out += ["hash-format = " + q(hf), "hash = " + q(h)]
    if mode == "metadata:curseforge": out.append("mode = 'metadata:curseforge'")
    cf_p, cf_f = get(t, "project-id", "update.curseforge"), get(t, "file-id", "update.curseforge")
    mr_m, mr_v = get(t, "mod-id", "update.modrinth"), get(t, "version", "update.modrinth")
    if cf_p: out += ["", "[update]", "[update.curseforge]", "file-id = %s" % cf_f, "project-id = %s" % cf_p]
    elif mr_m: out += ["", "[update]", "[update.modrinth]", "mod-id = " + q(mr_m), "version = " + q(mr_v)]
    meta_ok[fname] = True
    open(os.path.join(OUT, "mods", fn), "w", encoding="utf8").write("\n".join(out) + "\n")
for j in sorted(jars):
    if j in meta_ok: continue
    if j not in local: local.append(j)
for j in local:
    shutil.copy2(os.path.join(SRC, "mods", j), os.path.join(OUT, "mods", RENAME.get(j, j)))

# --- обычные папки
def want(rel):
    if os.path.basename(rel) in SKIP_NAMES or rel.endswith(SKIP_EXT): return False
    return not any(s in "/" + rel for s in SKIP_PARTS)
for d in INCLUDE_DIRS:
    for root, _, files in os.walk(os.path.join(SRC, d)):
        for f in files:
            full = os.path.join(root, f); rel = os.path.relpath(full, SRC).replace(os.sep, "/")
            if not want(rel): continue
            dst = os.path.join(OUT, rel); os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(full, dst)
# секреты: вебхук Discord в публичный репозиторий не попадает
wp = os.path.join(OUT, "config", "colonyrank-discord.properties")
if os.path.exists(wp):
    t = open(wp, encoding="utf8").read()
    open(wp, "w", encoding="utf8").write(re.sub(r"(?m)^webhookUrl=.*$", "webhookUrl=", t))
# минимальный options.txt (язык и ресурспак); применяется только если у игрока его ещё нет
with open(os.path.join(OUT, "options.txt"), "w", encoding="utf8") as f:
    f.write('lang:ru_ru\nresourcePacks:["vanilla","mod_resources","file/Mob Grinding Utils Vanillafied.zip"]\n')

# --- index.toml / pack.toml
entries = []
for root, _, files in os.walk(OUT):
    relroot = os.path.relpath(root, OUT)
    if relroot.split(os.sep)[0] in KEEP | {".git"}: continue
    for f in files:
        full = os.path.join(root, f); rel = os.path.relpath(full, OUT).replace(os.sep, "/")
        if rel in ("pack.toml", "index.toml") or rel.split("/")[0] in KEEP or rel == "README.md" or f == ".gitignore": continue
        entries.append(rel)
entries.sort()
lines = ['hash-format = "sha256"', ""]
for rel in entries:
    lines += ["[[files]]", 'file = "%s"' % rel, 'hash = "%s"' % sha(os.path.join(OUT, rel))]
    if rel.endswith(".pw.toml"): lines.append("metafile = true")
    elif any(re.search(p, rel) for p in PRESERVE_PATTERNS): lines.append("preserve = true")
    lines.append("")
open(os.path.join(OUT, "index.toml"), "w", encoding="utf8").write("\n".join(lines))

ver = a.version
pt = os.path.join(OUT, "pack.toml")
if not ver:
    ver = (get(open(pt, encoding="utf8").read(), "version") if os.path.exists(pt) else None) or "1.0"
open(pt, "w", encoding="utf8").write(
    'name = "Форпост"\nauthor = "Vadim"\nversion = "%s"\npack-format = "packwiz:1.1.0"\n\n[index]\nfile = "index.toml"\n'
    'hash-format = "sha256"\nhash = "%s"\n\n[versions]\nforge = "47.4.20"\nminecraft = "1.20.1"\n'
    % (ver, sha(os.path.join(OUT, "index.toml"))))
print("готово: версия %s, файлов в индексе %d (модов-ссылок %d, своих jar %d)" % (ver, len(entries), len(meta_ok), len(local)))
print("свои/пропатченные jar:", *local, sep="\n  ")
