import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import request from 'supertest';
import knex from '../server/db/db.js';
import app from '../server/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filepath) => fs.readFile(filepath, 'utf-8');

const query = request(app);

describe('GET /', () => {
  const queries = {
    default: {},
    'default and custom 1': {
      date: '2019-09-03',
      studentsCount: 'null',
    },
    'default and custom 2': {
      teacherIds: 'null',
      studentsCount: '2',
    },
    custom: {
      date: '2019-05-17,2019-09-04',
      status: '1',
      teacherIds: '1,2,3',
      studentsCount: '1,3',
      page: '2',
      lessonsPerPage: '2',
    },
  };

  test.each(
    Object.keys(queries),
  )('with %s parameters', async (parameters) => {
    const queryParams = queries[parameters];
    const address = Object.keys(queryParams)
      .reduce((acc, key) => `${acc}${key}=${queryParams[key]}&`, '/?')
      .slice(0, -1);
    const response = await query.get(address);
    const fixturePath = getFixturePath(`${parameters.replace(/\s/g, '-')}.json`);
    const data = await readFile(fixturePath);
    const expected = JSON.parse(data);

    expect(response.status).toBe(200);
    expect(response.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(response.body).toEqual(expected);
  });
});

describe('negative cases', () => {
  const queryParams = {
    date: '01.02.2020',
    teacherIds: '',
    studentsCount: 'four',
    status: false,
    page: 'first',
    lessonsPerPage: 'five',
  };

  test.each(
    Object.keys(queryParams),
  )('GET with invalid %s', async (parameter) => {
    const address = `/?${parameter}=${queryParams[parameter]}`;
    const response = await query.get(address);

    expect(response.status).toBe(400);
    expect(response.text).toBe(`Invalid parameter(s) value: ${parameter}.`);
  });

  test('GET with unknown parameter', async () => {
    const address = '/?hello=world';
    const response = await query.get(address);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Unknown filter parameter(s): hello.');
  });
});

afterAll(() => knex.destroy());
