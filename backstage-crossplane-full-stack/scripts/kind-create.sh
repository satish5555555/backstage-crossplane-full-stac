#!/bin/bash
set -euo pipefail
cat <<EOF | kind create cluster --name platform --image kindest/node:v1.31.0 --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 9090
    hostPort: 9090
  - containerPort: 8080
    hostPort: 8080
  - containerPort: 3000
    hostPort: 3000
  - containerPort: 8081
    hostPort: 8081
EOF
echo "Kind cluster 'platform' created with ports mapped to host."
