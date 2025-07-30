const { spawn } = require('child_process');

/**
 * Test script for YouTube transcript MCP server integration
 * This demonstrates how to extract transcripts from YouTube videos
 */

class YouTubeTranscriptExtractor {
    constructor() {
        this.serverName = 'mcp.config.usrlocalmcp.YouTube Transcript Server';
    }

    /**
     * Extract transcript from YouTube video
     * @param {string} url - YouTube video URL or video ID
     * @param {string} lang - Language code (e.g., 'en', 'es', 'fr')
     * @param {boolean} enableParagraphs - Whether to enable paragraph breaks
     * @returns {Promise<Object>} Transcript data
     */
    async extractTranscript(url, lang = 'en', enableParagraphs = false) {
        console.log(`Extracting transcript for: ${url}`);
        console.log(`Language: ${lang}, Paragraphs: ${enableParagraphs}`);
        
        // This would be the actual MCP server call
        // For demonstration, we'll simulate the response structure
        return {
            videoId: this.extractVideoId(url),
            language: lang,
            paragraphs: enableParagraphs,
            transcript: [
                {
                    start: "0:00",
                    end: "0:05",
                    text: "Welcome to this video tutorial"
                },
                {
                    start: "0:05", 
                    end: "0:10",
                    text: "Today we'll learn about AI and automation"
                },
                {
                    start: "0:10",
                    end: "0:15", 
                    text: "Let's get started with the basics"
                }
            ]
        };
    }

    /**
     * Extract video ID from YouTube URL
     * @param {string} url - YouTube URL
     * @returns {string} Video ID
     */
    extractVideoId(url) {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : url;
    }

    /**
     * Format transcript for display
     * @param {Object} transcriptData - Transcript object
     * @returns {string} Formatted transcript
     */
    formatTranscript(transcriptData) {
        let output = `Video ID: ${transcriptData.videoId}\n`;
        output += `Language: ${transcriptData.language}\n`;
        output += `Paragraphs enabled: ${transcriptData.paragraphs}\n\n`;
        
        transcriptData.transcript.forEach((segment, index) => {
            output += `[${segment.start} - ${segment.end}] ${segment.text}\n`;
        });
        
        return output;
    }
}

// Test the functionality
async function runTest() {
    const extractor = new YouTubeTranscriptExtractor();
    
    // Test URLs
    const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'dQw4w9WgXcQ'
    ];

    console.log('=== YouTube Transcript MCP Server Test ===\n');

    for (const url of testUrls) {
        try {
            console.log(`Testing URL: ${url}`);
            const transcript = await extractor.extractTranscript(url, 'en', true);
            console.log(extractor.formatTranscript(transcript));
            console.log('---\n');
        } catch (error) {
            console.error(`Error processing ${url}:`, error.message);
        }
    }
}

// Run the test
if (require.main === module) {
    runTest().catch(console.error);
}

module.exports = YouTubeTranscriptExtractor;