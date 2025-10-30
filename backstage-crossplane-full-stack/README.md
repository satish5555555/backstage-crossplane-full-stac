
# Platform POC — Backstage + Crossplane Full Stack (Local, Kind on Podman)

**Package name:** backstage-crossplane-full-stack.zip

## Overview
This package contains a complete **local platform engineering proof-of-concept** that you can run on your Mac (or Linux) using Podman + Kind. It wires together:

- **Kind (Podman backend)** — local Kubernetes cluster (scripts map needed ports)
- **Crossplane v2** — infrastructure orchestration (example: AWS VPC Composition)
- **Backstage (developer portal)** — templates & catalog to integrate Crossplane (scaffold via `npx`)
- **Argo CD** — GitOps continuous delivery for apps & Crossplane bundles
- **Prometheus + Grafana** — monitoring and dashboards
- **Keycloak** — identity provider for Backstage, Argo CD, Grafana (default realm + admin/admin)
- **Simple Express UI** — minimal UI to POST CompositeVPC objects to Crossplane for quick testing

> Important security note: This archive includes a demo Keycloak realm with username **admin** / password **admin** for local testing only. Do **not** use this in production.

---
## Directory structure (exact)


backstage-crossplane-full-stack/
├─ crossplane/                     # XRDs, Compositions, ProviderConfig, demo CR
├─ backstage/                      # Backstage templates + catalog (scaffold manually)
├─ argocd/                         # ArgoCD installation + sample App manifests
├─ monitoring/                     # Prometheus + Grafana helpers
├─ keycloak/                       # Keycloak deployment + realm JSON
├─ ui/                             # Minimal Express UI (port 9090)
├─ scripts/                        # End-to-end install scripts
└─ README.md                       # This file


---
## Files included (high-level)
- crossplane/xrd-compositevpc.yaml — CompositeResourceDefinition (v1 compatible schema)
- crossplane/composition-vpc.yaml — Composition using pipeline steps (function refs)
- crossplane/providerconfig-aws.yaml — ProviderConfig manifest (secret-based)
- crossplane/demo-vpc.yaml — sample CompositeVPC resource to provision
- backstage/templates/vpc-provision-template.yaml — Backstage Scaffolder template to create CompositeVPCs
- backstage/catalog-info.yaml — Backstage component registration
- argocd/install-argocd.yaml — ArgoCD core manifests (minimal)
- argocd/app-crossplane.yaml — ArgoCD App pointing to crossplane manifests (example)
- monitoring/install-prometheus-grafana.sh — helper to install kube-prometheus-stack via Helm
- monitoring/grafana-datasource.yaml — Grafana datasource for Prometheus
- keycloak/keycloak-deployment.yaml — Keycloak deployment + service manifest (simple)
- keycloak/keycloak-realm-platform.json — Pre-configured realm `platform` with admin/admin
- ui/server.js, ui/package.json, ui/public/index.html — minimal UI (port 9090)
- scripts/* — scripts to create kind cluster, install Crossplane, ArgoCD, Keycloak, monitoring, start UI

---
## Quick start (assumptions)
- You are on macOS (Intel/ARM) or Linux with Podman installed and `podman machine` started.
- You have `kubectl`, `kind`, `helm`, `node`/`npm` installed locally.
- You have AWS credentials if you intend to actually provision AWS resources (see Crossplane section).

### 0) Start Podman machine
podman machine start

### 1) Create Kind cluster (mapped ports)
bash scripts/kind-create.sh
# This creates a cluster named 'platform' and maps NodePort ports for UIs.

### 2) Install Crossplane and apply composition
bash scripts/install-crossplane.sh
# This installs Crossplane via Helm, applies XRD and Composition manifests in ./crossplane/

Create AWS secret (only if you want Crossplane to call AWS):
kubectl -n crossplane-system create secret generic aws-creds --from-literal=credentials="[default]
aws_access_key_id=YOUR_AWS_KEY
aws_secret_access_key=YOUR_AWS_SECRET"

### 3) Install ArgoCD
bash scripts/install-argocd.sh
# After installation, ArgoCD UI available on http://localhost:8080 (NodePort service)
# Default admin password can be retrieved from the argocd initial secret.

### 4) Install Keycloak (local test realm)
bash scripts/install-keycloak.sh
# Keycloak UI: http://localhost:8081
# Use username/password admin/admin to login to realm 'platform'

### 5) Install Monitoring (Prometheus + Grafana)
bash scripts/install-monitoring.sh
# Grafana: http://localhost:3000 (admin/admin by default in many charts)

### 6) Start Express UI (test frontend)
bash scripts/start-ui.sh
# UI on http://localhost:9090 — use the form to create CompositeVPCs

### 7) Scaffold Backstage and register templates
npx create-backstage-app@latest backstage-app
cd backstage-app
# copy files from ../backstage/ to backstage-app/ (see README_BACKSTAGE.md in /backstage)
# install plugins (if needed) and add auth config to use Keycloak OIDC
yarn dev
# Backstage UI will be available at http://localhost:7007 by default

Then register the catalog-info.yaml via Backstage UI or the software-catalog plugin.

---
## Usage notes & ports
- Express UI: http://localhost:9090 (calls kubectl apply — ensure kubeconfig points to Kind cluster)
- Backstage: http://localhost:7007 (scaffolded via npx)
- ArgoCD: http://localhost:8080
- Keycloak: http://localhost:8081 (realm platform credential admin/admin)
- Grafana: http://localhost:3000

---
## Troubleshooting (common issues and fixes)

### Crossplane function packages failing to unpack from GHCR or xpkg
Symptoms: cannot unpack package: MANIFEST_UNKNOWN or DENIED in Crossplane logs.
Fixes:
- Make sure the Crossplane Helm release has packageCache.credentials set if pulling from a private registry.
- Prefer xpkg.upbound.io artifacts (public) or host images in a registry you control.
- If TLS/client cert errors appear, inspect Crossplane pod logs and Helm values for XP_PKG_REGISTRY_INSECURE options.

### CrashLoopBackOff for Crossplane pod
- Check logs: kubectl -n crossplane-system logs deploy/crossplane
- If missing TLS certs: ensure Helm values didn't include unintended TLS mounts; a helm upgrade/rollback may help.

### ArgoCD inaccessible
- Check NodePort or port-forwarding: kubectl -n argocd get svc
- Retrieve admin password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode

### Keycloak login fails
- Use admin/admin for local realm 'platform' (demo only). If login fails, check Keycloak pod logs and ensure realm JSON import succeeded.

---
## What changed from earlier attempts (why this works)
1. Function packages point to stable upstream or xpkg; Crossplane helm release configured for package cache credentials when needed.
2. Composition uses pipeline steps compatible with Crossplane v2 pipelines (function refs + render/mark-ready).
3. ProviderConfig uses secretRef with expected key 'credentials' (string containing AWS credentials).
4. Backstage is provided as templates only to keep zip size small; scaffold Backstage locally via npx and copy the templates into it.
5. Scripts map UI ports to host NodePorts so everything is reachable at localhost.

---
## Cleanup
kubectl delete namespace crossplane-system argocd keycloak monitoring || true
kind delete cluster --name platform
podman machine stop

---
## Support
If something fails, collect `kubectl -n <ns> logs deploy/<name>` and paste here.
