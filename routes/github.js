import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

/**
 * @route POST /api/github/push
 * @description Push changes to GitHub repository
 * @access Public
 */
router.post('/push', async (req, res) => {
  try {
    const { message } = req.body;
    const commitMessage = message || 'Update from Rapid AI Assistant';
    const projectRoot = path.resolve(__dirname, '..');

    // Execute Git commands
    const gitAdd = await executeCommand('git add .', projectRoot);
    const gitCommit = await executeCommand(
      `git commit -m "${commitMessage}"`,
      projectRoot
    );
    const gitPush = await executeCommand(
      'git push origin gh-pages',
      projectRoot
    );

    res.json({
      success: true,
      message: 'Successfully pushed changes to GitHub',
      details: {
        add: gitAdd,
        commit: gitCommit,
        push: gitPush,
      },
    });
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to push changes to GitHub',
    });
  }
});

/**
 * Execute a shell command in the specified directory
 * @param {string} command - The command to execute
 * @param {string} cwd - The working directory
 * @returns {Promise<string>} - Command output
 */
function executeCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error.message}\n${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export default router;
