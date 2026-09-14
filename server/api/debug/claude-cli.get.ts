import { accessSync, constants as fsConstants, existsSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(() => {
  const possiblePaths = [
    '/opt/homebrew/bin/claude',
    '/usr/local/bin/claude',
    '/usr/bin/claude',
  ]

  const results = possiblePaths.map((path) => ({
    path,
    exists: existsSync(path),
    accessible: checkAccess(path),
  }))

  const pathSearch = process.env.PATH
    ? process.env.PATH.split(':').map((dir) => {
        const claudePath = join(dir, 'claude')
        return {
          path: claudePath,
          exists: existsSync(claudePath),
          accessible: checkAccess(claudePath),
        }
      }).filter(r => r.exists)
    : []

  return {
    possiblePaths: results,
    pathEnvironment: process.env.PATH,
    pathSearch: pathSearch.slice(0, 5), // First 5 results
    claudeCliPathEnv: process.env.CLAUDE_CLI_PATH || null,
    recommendation: results.find(r => r.accessible)?.path || pathSearch.find(r => r.accessible)?.path || null,
  }
})

function checkAccess(filePath: string): boolean {
  try {
    accessSync(filePath, fsConstants.F_OK)
    if (process.platform !== 'win32') {
      accessSync(filePath, fsConstants.X_OK)
    }
    return true
  } catch {
    return false
  }
}
