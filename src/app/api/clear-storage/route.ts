import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>Limpiar localStorage - TechEnglish Pro</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            text-align: center; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        button { 
            background: #3b82f6; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 10px; 
            cursor: pointer; 
            margin: 10px; 
            font-size: 16px;
            transition: all 0.3s ease;
        }
        button:hover { 
            background: #2563eb; 
            transform: translateY(-2px);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 10px;
            background: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 TechEnglish Pro</h1>
        <p>Esta página limpiará el localStorage para forzar el onboarding.</p>
        <button onclick="clearStorage()">🧹 Limpiar localStorage</button>
        <button onclick="goToApp()">🚀 Ir a la App</button>
        <div id="status" class="status"></div>
    </div>
    
    <script>
        function clearStorage() {
            localStorage.removeItem('hasCompletedOnboarding');
            localStorage.removeItem('learning-store');
            document.getElementById('status').innerHTML = '✅ localStorage limpiado correctamente!';
            setTimeout(() => {
                document.getElementById('status').innerHTML = '';
            }, 3000);
        }
        
        function goToApp() {
            window.location.href = '/';
        }
        
        // Show current storage status
        const hasOnboarding = localStorage.getItem('hasCompletedOnboarding');
        const hasStore = localStorage.getItem('learning-store');
        
        if (hasOnboarding || hasStore) {
            document.getElementById('status').innerHTML = '⚠️ Hay datos en localStorage. Usa el botón de limpiar.';
        } else {
            document.getElementById('status').innerHTML = '✅ localStorage está limpio';
        }
    </script>
</body>
</html>
  `, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}