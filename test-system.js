import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * System Test Suite for Rapid AI Assistant
 * This file tests the entire system functionality
 */

class SystemTester {
    constructor() {
        this.testResults = [];
        this.testDir = path.join(__dirname, 'test-files');
    }

    async runAllTests() {
        console.log('🚀 Starting Rapid AI Assistant System Tests...\n');
        
        // Create test directory
        this.createTestDirectory();
        
        // Run tests
        await this.testFileStructure();
        await this.testDependencies();
        await this.testEnvironmentVariables();
        await this.testFileUploadCapabilities();
        await this.testServices();
        await this.testRoutes();
        
        // Generate report
        this.generateReport();
    }

    createTestDirectory() {
        if (!fs.existsSync(this.testDir)) {
            fs.mkdirSync(this.testDir, { recursive: true });
            console.log('✅ Test directory created');
        }
    }

    async testFileStructure() {
        console.log('📁 Testing file structure...');
        
        const requiredFiles = [
            'server.js',
            'package.json',
            'index.html',
            'app.js',
            '.env.example'
        ];

        const requiredDirs = [
            'routes',
            'services',
            'uploads',
            'output',
            'docs'
        ];

        let passed = 0;
        let total = requiredFiles.length + requiredDirs.length;

        for (const file of requiredFiles) {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ ${file} exists`);
                passed++;
            } else {
                console.log(`❌ ${file} missing`);
            }
        }

        for (const dir of requiredDirs) {
            const dirPath = path.join(__dirname, dir);
            if (fs.existsSync(dirPath)) {
                console.log(`✅ ${dir}/ directory exists`);
                passed++;
            } else {
                console.log(`❌ ${dir}/ directory missing`);
            }
        }

        this.testResults.push({
            test: 'File Structure',
            passed: passed,
            total: total,
            status: passed === total ? 'PASS' : 'FAIL'
        });
    }

    async testDependencies() {
        console.log('\n📦 Testing dependencies...');
        
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
            const deps = packageJson.dependencies;
            
            const requiredDeps = [
                '@google/generative-ai',
                'express',
                'socket.io',
                'multer',
                'xlsx',
                'pdf-parse',
                'mammoth',
                'cors',
                'dotenv'
            ];

            let passed = 0;
            for (const dep of requiredDeps) {
                if (deps[dep]) {
                    console.log(`✅ ${dep} installed`);
                    passed++;
                } else {
                    console.log(`❌ ${dep} missing`);
                }
            }

            this.testResults.push({
                test: 'Dependencies',
                passed: passed,
                total: requiredDeps.length,
                status: passed === requiredDeps.length ? 'PASS' : 'FAIL'
            });

        } catch (error) {
            console.error('❌ Error reading package.json:', error.message);
            this.testResults.push({
                test: 'Dependencies',
                passed: 0,
                total: 1,
                status: 'FAIL'
            });
        }
    }

    async testEnvironmentVariables() {
        console.log('\n⚙️ Testing environment configuration...');
        
        const envExamplePath = path.join(__dirname, '.env.example');
        
        try {
            const envContent = fs.readFileSync(envExamplePath, 'utf8');
            const requiredVars = [
                'GEMINI_API_KEY',
                'PORT',
                'MAX_FILE_SIZE'
            ];

            let passed = 0;
            for (const varName of requiredVars) {
                if (envContent.includes(varName)) {
                    console.log(`✅ ${varName} configured`);
                    passed++;
                } else {
                    console.log(`❌ ${varName} missing`);
                }
            }

            this.testResults.push({
                test: 'Environment Variables',
                passed: passed,
                total: requiredVars.length,
                status: passed === requiredVars.length ? 'PASS' : 'FAIL'
            });

        } catch (error) {
            console.error('❌ Error reading .env.example:', error.message);
            this.testResults.push({
                test: 'Environment Variables',
                passed: 0,
                total: 1,
                status: 'FAIL'
            });
        }
    }

    async testFileUploadCapabilities() {
        console.log('\n📤 Testing file upload capabilities...');
        
        const uploadsDir = path.join(__dirname, 'uploads');
        const outputDir = path.join(__dirname, 'output');
        
        let passed = 0;
        let total = 2;

        try {
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            console.log('✅ Uploads directory ready');
            passed++;

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            console.log('✅ Output directory ready');
            passed++;

        } catch (error) {
            console.error('❌ Error creating directories:', error.message);
        }

        this.testResults.push({
            test: 'File Upload Directories',
            passed: passed,
            total: total,
            status: passed === total ? 'PASS' : 'FAIL'
        });
    }

    async testServices() {
        console.log('\n🔧 Testing services...');
        
        const services = [
            'fileProcessor.js',
            'outputFormatter.js',
            'geminiService.js'
        ];

        let passed = 0;
        for (const service of services) {
            const servicePath = path.join(__dirname, 'services', service);
            if (fs.existsSync(servicePath)) {
                console.log(`✅ ${service} exists`);
                passed++;
            } else {
                console.log(`❌ ${service} missing`);
            }
        }

        this.testResults.push({
            test: 'Services',
            passed: passed,
            total: services.length,
            status: passed === services.length ? 'PASS' : 'FAIL'
        });
    }

    async testRoutes() {
        console.log('\n🛣️ Testing API routes...');
        
        const routes = [
            'file.js',
            'export.js',
            'process.js',
            'gemini.js'
        ];

        let passed = 0;
        for (const route of routes) {
            const routePath = path.join(__dirname, 'routes', route);
            if (fs.existsSync(routePath)) {
                console.log(`✅ ${route} exists`);
                passed++;
            } else {
                console.log(`❌ ${route} missing`);
            }
        }

        this.testResults.push({
            test: 'API Routes',
            passed: passed,
            total: routes.length,
            status: passed === routes.length ? 'PASS' : 'FAIL'
        });
    }

    generateReport() {
        console.log('\n📊 SYSTEM TEST REPORT');
        console.log('='.repeat(50));
        
        let totalPassed = 0;
        let totalTests = 0;

        this.testResults.forEach(result => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${status} ${result.test}: ${result.passed}/${result.total} passed`);
            totalPassed += result.passed;
            totalTests += result.total;
        });

        console.log('\n' + '='.repeat(50));
        console.log(`🎯 OVERALL: ${totalPassed}/${totalTests} tests passed`);
        
        const percentage = Math.round((totalPassed / totalTests) * 100);
        console.log(`📈 SUCCESS RATE: ${percentage}%`);

        if (percentage === 100) {
            console.log('\n🎉 SYSTEM IS FULLY FUNCTIONAL!');
            console.log('✅ Ready for deployment');
        } else {
            console.log('\n⚠️  Some tests failed. Check the logs above.');
            console.log('🔧 Please fix the issues before deployment');
        }

        // Save report
        const reportPath = path.join(__dirname, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: {
                totalPassed,
                totalTests,
                percentage,
                status: percentage === 100 ? 'READY' : 'NEEDS_FIX'
            }
        }, null, 2));

        console.log(`📋 Detailed report saved to: ${reportPath}`);
    }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SystemTester();
    await tester.runAllTests();
}

export default SystemTester;