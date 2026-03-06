import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
const isGitHubActions = process.env.GITHUB_ACTIONS === 'true'
const pagesBase = isGitHubActions && repositoryName ? `/${repositoryName}/` : '/'

export default defineConfig({
  base: pagesBase,
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://webxsj.worktile.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 从自定义头中读取 Cookie 并设置为真正的 Cookie 头
            const customCookie = req.headers['x-worktile-cookie']
            if (customCookie) {
              proxyReq.setHeader('Cookie', customCookie)
              // 删除自定义头，避免泄露给目标服务器
              proxyReq.removeHeader('x-worktile-cookie')
            }
          })
        }
      }
    }
  }
})
