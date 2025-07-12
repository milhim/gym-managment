const handler = require('./api/index.js');

// Mock request and response objects
const mockRequest = {
    method: 'GET',
    url: '/api/v1/health',
    headers: {}
};

const mockResponse = {
    statusCode: 200,
    headers: {},
    body: '',
    headersSent: false,

    status: function (code) {
        this.statusCode = code;
        return this;
    },

    json: function (data) {
        this.body = JSON.stringify(data);
        console.log('Response:', this.statusCode, this.body);
        return this;
    },

    send: function (data) {
        this.body = data;
        console.log('Response:', this.statusCode, this.body);
        return this;
    }
};

// Test the serverless function
async function testServerlessFunction() {
    try {
        console.log('Testing serverless function...');
        console.log('Request:', mockRequest.method, mockRequest.url);

        await handler(mockRequest, mockResponse);

        console.log('Test completed successfully!');

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testServerlessFunction(); 