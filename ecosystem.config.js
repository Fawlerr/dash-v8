module.exports = {
  apps: [{
    name: 'whatsapp-dashboard',
    script: 'app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Configurações de restart
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Configurações de monitoramento
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    
    // Configurações de autorestart
    autorestart: true,
    
    // Configurações de kill timeout
    kill_timeout: 5000,
    
    // Configurações de wait ready
    wait_ready: true,
    listen_timeout: 10000,
    
    // Configurações de merge logs
    merge_logs: true
  }]
};