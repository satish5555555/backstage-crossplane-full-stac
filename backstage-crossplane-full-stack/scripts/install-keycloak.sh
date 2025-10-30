#!/bin/bash
set -euo pipefail
kubectl apply -f ../keycloak/keycloak-deployment.yaml
# Wait for Keycloak; then import realm (optional)
echo "Keycloak installed in namespace keycloak. Realm import step (if needed) can be executed with kubectl exec + kcadm or using admin CLI."
