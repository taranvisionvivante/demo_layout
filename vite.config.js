import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const processEnv = {}
  Object.keys(env).forEach((key) => {
    if (key.startsWith('REACT_APP_') || key.startsWith('VITE_')) {
      processEnv[key] = env[key]
    }
  })

  return {
    plugins: [
      react({
        include: '**/*.{js,jsx}',
      }),
    ],

    // 🚨 KEY FIX: disable OXC for .js so JSX works
    esbuild: false,

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 3000,
      open: true,
    },

    build: {
      outDir: 'build',
      sourcemap: true,
    },

    define: {
      'process.env': JSON.stringify(processEnv),
    },
  }
})