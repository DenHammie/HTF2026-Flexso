# Oakhaven local dev image — everything needed to run the TypeScript UI5 apps + CAP backend:
# Node 22, SAP CAP (cds-dk), TypeScript, UI5 Tooling (transpile, linter, types) and the SAPUI5
# framework for every app under src/. You only need Docker.
FROM node:22-alpine

# git: source control inside the VS Code Dev Container.
RUN apk add --no-cache git \
 && git config --global --add safe.directory '*'

# Dependencies live in /usr/src/node_modules, OUTSIDE the mounted project (/usr/src/app):
# Node resolves them by walking up, so the bind mount never hides them.
WORKDIR /usr/src
COPY package.json package-lock.json ./
# The launchpad is a local package ("oakhaven-launchpad": "file:launchpad") — npm ci needs it.
COPY launchpad/package.json launchpad/

# Everything comes from the public npm registry. Guard: the build fails if a private @flexso
# package or a Flexso registry URL ever ends up in the manifests or in node_modules.
RUN if grep -qi 'flexso' package.json package-lock.json; then \
      echo 'ERROR: a @flexso / Flexso registry reference is in the manifests' >&2; exit 1; \
    fi \
 && npm ci --no-audit --no-fund \
 && if [ -e node_modules/@flexso ]; then echo 'ERROR: @flexso package installed' >&2; exit 1; fi \
 && rm -rf launchpad && ln -s /usr/src/app/launchpad launchpad
# ↑ the launchpad link now points at the live, mounted launchpad/ folder of the project.

ENV PATH=/usr/src/node_modules/.bin:$PATH \
    NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /usr/src/app
COPY . .

# Pre-download the SAPUI5 framework declared by EVERY app (src/*/ui5.yaml) and by the launchpad
# into ~/.ui5, so nothing needs a download at runtime. New app → docker compose up --build.
RUN for config in src/*/ui5.yaml launchpad/ui5.yaml; do \
      echo "Preparing UI5 framework for ${config%/ui5.yaml}"; \
      (cd "$(dirname "$config")" && ui5 tree > /dev/null) || exit 1; \
    done

# 4004 = CAP server + UI5 apps, 35729 = cds watch live reload.
EXPOSE 4004 35729

# First start: create + seed the SQLite DB when it is missing, then serve with hot reload.
CMD ["sh", "-c", "[ -f db/oakhaven.sqlite ] || npm run db:reset; exec npm run watch"]
