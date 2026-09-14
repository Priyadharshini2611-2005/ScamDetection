const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const app = require('../app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/analyze', () => {
  it('should upload an audio file and return a valid analysis report', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'sample.wav');

    const res = await request(app)
      .post('/api/analyze')
      .attach('audio', fixturePath)
      .expect(201);

    const body = res.body;

    // Verify response shape
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('originalFilename', 'sample.wav');
    expect(body).toHaveProperty('voiceScore');
    expect(body).toHaveProperty('behaviorScore');
    expect(body).toHaveProperty('contentScore');
    expect(body).toHaveProperty('trustScore');
    expect(body).toHaveProperty('riskLevel');
    expect(body).toHaveProperty('explanation');
    expect(body).toHaveProperty('transcript');

    // Verify types
    expect(typeof body.voiceScore).toBe('number');
    expect(typeof body.behaviorScore).toBe('number');
    expect(typeof body.contentScore).toBe('number');
    expect(typeof body.trustScore).toBe('number');
    expect(['Low', 'Medium', 'High']).toContain(body.riskLevel);
    expect(typeof body.explanation).toBe('string');
    expect(typeof body.transcript).toBe('string');

    // Scores should be 0-100
    expect(body.voiceScore).toBeGreaterThanOrEqual(0);
    expect(body.voiceScore).toBeLessThanOrEqual(100);
    expect(body.trustScore).toBeGreaterThanOrEqual(0);
    expect(body.trustScore).toBeLessThanOrEqual(100);
  });

  it('should reject a non-audio file', async () => {
    try {
      const res = await request(app)
        .post('/api/analyze')
        .attach('audio', path.join(__dirname, '..', 'package.json'));

      // If we get a response, it should be 415
      expect(res.status).toBe(415);
      expect(res.body).toHaveProperty('error', 'INVALID_FILE_TYPE');
    } catch (err) {
      // Multer may close the connection before Express can respond — ECONNRESET is acceptable
      expect(err.code).toBe('ECONNRESET');
    }
  });

  it('should return 400 when no file is provided', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .expect(400);

    expect(res.body).toHaveProperty('error', 'NO_FILE');
  });
});

describe('GET /api/analyze', () => {
  it('should list analyses', async () => {
    const res = await request(app)
      .get('/api/analyze')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('originalFilename');
    expect(res.body[0]).toHaveProperty('trustScore');
    expect(res.body[0]).toHaveProperty('riskLevel');
  });
});

describe('GET /api/analyze/:id', () => {
  it('should fetch analysis by id', async () => {
    // First, get the list to find an id
    const listRes = await request(app).get('/api/analyze').expect(200);
    const analysisId = listRes.body[0].id;

    const res = await request(app)
      .get(`/api/analyze/${analysisId}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', analysisId);
    expect(res.body).toHaveProperty('voiceScore');
    expect(res.body).toHaveProperty('transcript');
  });

  it('should return 404 for non-existent id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/api/analyze/${fakeId}`)
      .expect(404);
  });

  it('should return 400 for invalid id format', async () => {
    await request(app)
      .get('/api/analyze/not-a-valid-id')
      .expect(400);
  });
});
