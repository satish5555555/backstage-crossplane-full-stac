#!/bin/bash
set -euo pipefail
NAMESPACE=crossplane-system
kubectl create namespace $NAMESPACE || true
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm repo update
helm upgrade --install crossplane crossplane-stable/crossplane --namespace $NAMESPACE --set replicas=1 --wait
kubectl -n $NAMESPACE rollout status deploy/crossplane
# Apply CRDs and composition
kubectl apply -f ../crossplane/xrd-compositevpc.yaml
kubectl apply -f ../crossplane/composition-vpc.yaml
kubectl apply -f ../crossplane/providerconfig-aws.yaml || true
echo "Crossplane installed and manifests applied."
