// This module is the core engine for interacting with Gemini
import { ask } from './gemini.js';

export async function generateContent(project, prompt) {
    if (!project || !prompt) {
        throw new Error('Project and prompt are required.');
    }

    const filesData = [];
    if (project.files && project.files.length > 0) {
        for (const file of project.files) {
            // Basic text extraction for now. OCR/other processing would happen before this.
            const content = await file.text();
            filesData.push({ name: file.name, type: file.type, content });
        }
    }

    let fullPrompt = `User Prompt: ${prompt}\n\n`;

    if (project.selectedTemplate) {
        fullPrompt += `Template (${project.selectedTemplate.name}):\n---\n${project.selectedTemplate.content}\n---\n\n`;
    }

    if (filesData.length > 0) {
        fullPrompt += `Files:\n${filesData.map(f => `--- File: ${f.name} ---\n${f.content}`).join('\n\n')}\n\n`;
    }

    fullPrompt += `Instruction: Based on the user prompt, and using the provided template and files, generate the required output.`;

    return await ask(fullPrompt);
}

// No render function needed for this module as it's a utility.