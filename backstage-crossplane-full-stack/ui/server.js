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
  exec(`kubectl apply -f ${tmp}`, (err, stdout, stderr) => {
    if (err) {
      res.status(500).send({error: stderr||err.message});
      return;
    }
    res.send({stdout});
  });
});

app.listen(9090, () => console.log('UI listening on port 9090'));