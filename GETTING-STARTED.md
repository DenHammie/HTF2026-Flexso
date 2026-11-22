# Getting started — Oakhaven (HTF 2026)

Welcome to Oakhaven! This guide takes you from an empty laptop to the running app.
**You only need Docker.** Node.js, TypeScript, SAP CAP and SAPUI5 all come inside the Docker
container — you do not install them yourself, and you do not need any experience with them.

Once it runs, the **[README](README.md#-oakhaven-in-10-minutes)** explains how everything fits together.

---

## 1. What you are going to run

| Part | What it is | Where it lives |
| --- | --- | --- |
| **Backend** | SAP CAP services (Node.js + TypeScript) on a small SQLite database | `srv/`, `db/` |
| **Oakhaven app** | SAPUI5 web app (TypeScript) that shows all the village data | `src/oakhaven-app/` |
| Your apps | Every UI5 app you add under `src/` is served automatically and gets a launchpad tile | `src/<your-app>/` |
| **Launchpad** | Local SAP Fiori launchpad: one tile per app (not an app itself) | `launchpad/` |

---

## 2. Install (one time)

1. **Docker**
   - **Windows / macOS:** install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
     On Windows keep the default **WSL 2** backend. Start Docker Desktop and wait until it says
     *Engine running*.
   - **Linux:** install Docker Engine **and** the Docker Compose plugin
     (`docker compose version` must work).
2. **Git** — <https://git-scm.com/downloads>.
3. **Visual Studio Code** (recommended) — <https://code.visualstudio.com/> plus the
   **Dev Containers** extension (`ms-vscode-remote.remote-containers`).

Check that Docker works — open a terminal (PowerShell on Windows) and run:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

> **Windows tip:** run `git config --global core.autocrlf true` once, before you clone.

---

## 3. Get the code

```bash
git clone <repository-url> oakhaven
cd oakhaven
```

Every `docker compose …` command below is run **from this `oakhaven` folder**.

---

## 4. Start it

Pick one of the two ways.

### Option A — VS Code Dev Container (recommended)

1. Open the `oakhaven` folder in VS Code.
2. VS Code asks *"Reopen in Container"* → click it.
   (Or press `F1` → **Dev Containers: Reopen in Container**.)
3. The first time this takes a few minutes: Docker builds the image and downloads SAPUI5.
   Later starts take seconds.
4. Open **http://localhost:4004/launchpad/index.html** in your browser.

You now work *inside* the container: autocomplete for TypeScript, UI5 and CDS works, and the
VS Code terminal (`` Ctrl+` ``) has every tool installed.

### Option B — plain Docker in a terminal

```bash
docker compose up --build --watch
```

- The **first** run builds the image (a few minutes, needs internet once).
- Wait for the line `server listening on { url: 'http://localhost:4004' }`.
- Open **http://localhost:4004/launchpad/index.html**.

Next time, `docker compose up --watch` is enough (no `--build` needed).

**Stop:** press `Ctrl+C` in that terminal, or run `docker compose down` from another one.

### What happens when you save a file

| You change… | What to do |
| --- | --- |
| a **UI5 file** (`src/…`) | refresh the browser |
| a **backend file** (`srv/…`, `db/schema.cds`, `.cdsrc.json`) | nothing — the server restarts by itself (watch the terminal) |
| a **CSV file** (`db/data/…`) or the data model | run `npm run db:reset` (see below) |
| `package.json` | the image is rebuilt (with `--watch`) |

---

## 5. First look around

| URL | What you see |
| --- | --- |
| http://localhost:4004/launchpad/index.html | **The Oakhaven launchpad** — a tile per app |
| http://localhost:4004/app/oakhaven/index.html | The Oakhaven app on its own |
| http://localhost:4004 | CAP's start page: all services, entities and apps |
| http://localhost:4004/odata/v4/water-supply/WaterPipes | Raw pipe data (JSON) |
| http://localhost:4004/odata/v4/food-stock/StockItems | Raw stock data (JSON) |
| http://localhost:4004/odata/v4/water-supply/$metadata | Everything the water service offers (XML) |

The Oakhaven app has one tab per kind of data — water pipes, sensors, repairs, landmarks, food
stock — and the painted village map.

> 💡 Firefox and Chrome show JSON nicely. Try query options in the address bar:
> `?$select=pipeID,currentFlowRate`, `?$expand=sensors`, `?$filter=pipelineType eq 'branch'`,
> `?$orderby=currentQuantity`.

---

## Your first 30 minutes

A checklist for the whole team. When every box is ticked, you are ready to build.

- [ ] **Everyone runs the app.** `docker compose up --build --watch` works on at least two laptops,
      and the launchpad opens at http://localhost:4004/launchpad/index.html.
- [ ] **You know the data.** Click through every tab of the Oakhaven app. Which tables are there,
      and what does each field mean? The README explains every field, with units.
- [ ] **You made one change and saw it.** Follow *From question to screen* in the README: change
      the worked example (for example, show *weeks* since maintenance instead of days), save,
      refresh the browser, see it. Then put it back.
- [ ] **Your AI assistant knows the project.** Open the repo in VS Code with your assistant. It reads
      `AGENTS.md` automatically; ask it to explain `srv/water-supply-service.ts` to you.
- [ ] **You met the villagers.** On the HTF platform, open *Challenges* → *Crisis in Oakhaven* and
      ask each villager **one** good first question. Write down what you learn.
- [ ] **You split the work.** Who talks to which villager, who builds what? Done with a villager? Hand in and call a coach.

> 💡 **Good first questions** are about the villager's day and their pain, not about screens:
> *"When do you start worrying?"*, *"What do you do first in the morning?"*, *"What went wrong last
> week?"* The tip under each chat gives you one more.

---

## 6. Everyday commands

**In the Dev Container terminal** type the command as shown.
**With plain Docker** (option B), put `docker compose exec app` in front while the app runs —
for example `docker compose exec app npm run typecheck`.

| What | Command |
| --- | --- |
| Reset the database to the start data | `npm run db:reset` |
| Check your TypeScript for errors | `npm run typecheck` |
| Check your UI5 apps for mistakes | `npm run lint:ui5` |
| Build the project (`gen/` folder) | `npm run build` |
| Open a shell inside the container | `docker compose exec app sh` *(plain Docker only)* |
| See the server log | `docker compose logs -f app` *(plain Docker only)* |

> New npm packages cannot be added during the hackathon on your own — ask the organisers.

---

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| `Cannot connect to the Docker daemon` / `docker API … not found` | Start Docker Desktop and wait for *Engine running*. |
| `port is already allocated` / `EADDRINUSE 4004` | Something else uses port 4004. Stop it (or the other `docker compose up`), then start again. |
| The first page load is slow | Normal once after a start: TypeScript is compiled on the first request, and the launchpad loads a lot of SAPUI5 the first time. |
| Backend change not picked up (plain Docker) | Did you start with `--watch`? Otherwise run `docker compose restart app`. On Windows/OneDrive the container does not see file events — `--watch` is what makes the restart work. |
| My CSV change does not show | Run `npm run db:reset`, then refresh the browser. |
| UI change does not show | Hard refresh (`Ctrl+Shift+R`) — the browser may cache the old file. |
| A new app has no tile | Restart: `docker compose up --build --watch`. Check its `ui5.yaml` and `manifest.json` (see README → *Add a new UI5 app*). |
| White screen in a UI5 app | Open DevTools (`F12`) → Console. Most common cause: a missing or wrong `@namespace` comment in a `.ts` file. Then run `npm run lint:ui5` and `npm run typecheck`. |
| `SQLITE_ERROR: no such table/column` | The database is older than your data model: `npm run db:reset`. |
| Launchpad console shows `homepage-af-dep.js` 404 | Harmless — an optional SAP preload file. |
| Files created by Docker are owned by `root` (Linux only) | `sudo chown -R $USER db gen` |
| Start completely fresh | `docker compose down --rmi local`, delete `db/oakhaven.sqlite`, then `docker compose up --build --watch` |

Still stuck? Show the output of `docker compose logs app` to an organiser.
