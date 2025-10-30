#!/bin/bash
set -euo pipefail
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
kubectl create namespace monitoring || true
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring --set grafana.service.type=NodePort --set grafana.service.nodePort=30000 || helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring --set grafana.service.type=NodePort --set grafana.service.nodePort=30000
echo "Installed kube-prometheus-stack; Grafana NodePort on 30000 (access via NodePort)"
