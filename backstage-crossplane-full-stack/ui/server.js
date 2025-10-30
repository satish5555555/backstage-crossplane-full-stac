const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/provision', (req, res) => {
  const name = req.body.name || 'poc-vpc-1';
  const cidr = req.body.cidr || '10.50.0.0/16';

  const yaml = `apiVersion: xinfra.example.org/v1
kind: CompositeVPC
metadata:
  name: ${name}
spec:
  forProvider:
    cidrBlock: "${cidr}"
    region: "us-east-1"
  compositionRef:
    name: vpc.aws.xinfra.example.org
`;

  const tmp = path.join(__dirname, `${name}.yaml`);
  fs.writeFileSync(tmp, yaml);

  console.log(`🧩 Applying ${tmp} to cluster...`);
  exec(`kubectl apply --validate=false -f ${tmp}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ kubectl error: ${stderr || err.message}`);
      res.status(500).send({ error: stderr || err.message });
      return;
    }
    console.log(`✅ VPC applied successfully:\n${stdout}`);
    res.send({ stdout });
  });
});

// Auto-port fallback logic
const DEFAULT_PORT = 9090;
const server = app.listen(DEFAULT_PORT, () => {
  console.log(`🚀 UI listening on http://localhost:${DEFAULT_PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = DEFAULT_PORT + 1;
    console.warn(`⚠️ Port ${DEFAULT_PORT} in use. Retrying on ${newPort}...`);
    app.listen(newPort, () => console.log(`🚀 UI listening on http://localhost:${newPort}`));
  } else {
    throw err;
  }
});

