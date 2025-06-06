const { exec } = require('child_process');
require('dotenv').config();

const ssh_host = process.env.SSH_HOST;
const ssh_password = process.env.SSH_PASSWORD;

function getCloudflaredConfig(callback) {
  const command = `sshpass -p ${ssh_password} ssh -o StrictHostKeyChecking=no ${ssh_host} cat /etc/cloudflared/config.yml`;
  console.log("Executing command:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return callback(error, null);
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return callback(new Error(stderr), null);
    }
    callback(null, stdout);
  });
}

module.exports = { getCloudflaredConfig };