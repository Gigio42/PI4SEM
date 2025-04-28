/* dev-start.js
   Script para iniciar tanto o backend quanto o frontend em desenvolvimento
*/
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const os = require('os');

// Determina qual comando shell usar com base no sistema operacional
const isWindows = os.platform() === 'win32';

// Define os caminhos para os diretórios
const rootDir = path.resolve(__dirname);
const backendDir = path.join(rootDir, 'back-end');
const frontendDir = path.join(rootDir, 'front-end');

console.log('\x1b[36m%s\x1b[0m', '🚀 Iniciando ambiente de desenvolvimento...');
console.log('\x1b[33m%s\x1b[0m', `🔧 Backend: ${backendDir} (porta 3000)`);
console.log('\x1b[33m%s\x1b[0m', `🔧 Frontend: ${frontendDir} (porta 3001)`);

// Função para iniciar um processo
function startProcess(name, dir, command) {
  // No Windows, usamos uma abordagem diferente para lidar com diretórios com caracteres especiais
  const options = {
    cwd: dir,  // Definir o diretório de trabalho diretamente
    stdio: 'pipe',
    shell: true
  };
  
  console.log('\x1b[36m%s\x1b[0m', `🚀 Iniciando ${name}...`);
  console.log('\x1b[90m%s\x1b[0m', `📝 Comando: ${command} (em ${dir})`);
  
  // Executamos o comando diretamente no diretório de trabalho definido
  const proc = spawn(isWindows ? 'npm.cmd' : 'npm', command.split(' '), options);
  
  // Configura prefixo colorido para cada processo
  const prefix = name === 'Backend' ? '\x1b[32m[Backend]\x1b[0m ' : '\x1b[35m[Frontend]\x1b[0m ';
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(Boolean);
    lines.forEach(line => console.log(`${prefix}${line}`));
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split(/\r?\n/).filter(Boolean);
    lines.forEach(line => console.error(`${prefix}\x1b[31m${line}\x1b[0m`));
  });
  
  proc.on('close', (code) => {
    if (code !== 0) {
      console.log(`\x1b[31m${name} encerrado com código ${code}\x1b[0m`);
    } else {
      console.log(`\x1b[32m${name} encerrado normalmente\x1b[0m`);
    }
  });
  
  return proc;
}

// Inicia os processos
const backendProcess = startProcess('Backend', backendDir, 'run start:dev');
const frontendProcess = startProcess('Frontend', frontendDir, 'run dev -- -p 3001');

// Configura manipulação de entrada do terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Adiciona manipulação para encerrar ambos os processos quando o script principal é encerrado
process.on('SIGINT', () => {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Encerrando processos...');
  
  if (isWindows) {
    // No Windows, precisamos usar taskkill para matar os processos filhos
    spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
    spawn('taskkill', ['/pid', frontendProcess.pid, '/f', '/t']);
  } else {
    // No Unix, podemos usar sinais
    backendProcess.kill('SIGINT');
    frontendProcess.kill('SIGINT');
  }
  
  rl.close();
  process.exit(0);
});

console.log('\x1b[36m%s\x1b[0m', '✅ Ambiente de desenvolvimento iniciado! Pressione Ctrl+C para encerrar ambos os processos.');
