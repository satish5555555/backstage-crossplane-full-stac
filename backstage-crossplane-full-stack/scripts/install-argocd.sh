#!/bin/bash
set -euo pipefail
kubectl apply -f ../argocd/install-argocd.yaml
echo "ArgoCD manifests applied. Wait for pods to be ready and check NodePort for UI (30080)."
