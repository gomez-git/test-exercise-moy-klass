import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import request from 'supertest';
import app from '../server/app.js';
import knex from '../server/db/db.js';

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
    Object.entries(queries),
  )('with %s parameters', async (name, parameters) => {
    const address = Object.entries(parameters)
      .reduce((acc, [key, value]) => `${acc}${key}=${value}&`, '/?')
      .slice(0, -1);
    const response = await query.get(address);
    const fixturePath = getFixturePath(`${name.replace(/\s/g, '-')}.json`);
    const data = await readFile(fixturePath);
    const expected = JSON.parse(data);

    expect(response.status).toBe(200);
    expect(response.get('Content-Type')).toEqual('application/json; charset=utf-8');
    expect(response.body).toEqual(expected);
  });
});

describe('GET negative cases', () => {
  const queryParams = {
    date: ['01.02.2020', '2020-02-01,2020-02-30', ''],
    teacherIds: ['one', '[1,2,3,4]', ''],
    studentsCount: ['four', '1,2,3', ''],
    status: ['false', '2', ''],
    page: ['first', 'last', ''],
    lessonsPerPage: ['five', 'null', ''],
  };

  test.each([1, 2, 3])('case %s with invalid parameters', async (i) => {
    const parameters = Object.entries(queryParams);
    const address = parameters
      .reduce((acc, [parameter, value]) => `${acc}${parameter}=${value[i - 1]}&`, '/?')
      .slice(0, -1);
    const response = await query.get(address);
    const string = parameters
      .map(([parameter, value]) => `${parameter}=${JSON.stringify(value[i - 1])}`)
      .join(', ');

    expect(response.status).toBe(400);
    expect(response.text).toBe(`Error -> Invalid parameter(s) value: ${string}.`);
  });

  test('with unknown parameter', async () => {
    const address = '/?hello=world';
    const response = await query.get(address);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Error -> Unknown filter parameter(s): hello.');
  });
});

describe('POST /lessons', () => {
  const postParameters = {
    'lessonsCount with lastDate': {
      teacherIds: [1, 2],
      title: 'Pink Color',
      days: [0, 3, 6],
      firstDate: '2020-01-01',
      lessonsCount: 10,
      lastDate: '2020-02-29',
    },
    'limit 1 year': {
      teacherIds: [3],
      title: 'Gray Color',
      days: [1],
      firstDate: '2022-06-01',
      lastDate: '2023-07-01',
    },
    'limit 300 lessons': {
      teacherIds: [4],
      title: 'Grey Color',
      days: [1, 2, 3, 4, 5, 6],
      firstDate: '2021-02-11',
      lessonsCount: 313,
    },
  };

  const expectedIds = {
    'lessonsCount with lastDate': [...Array(10)].map((_, i) => i + 11),
    'limit 1 year': [...Array(52)].map((_, i) => i + 21),
    'limit 300 lessons': [...Array(300)].map((_, i) => i + 73),
  };

  test.each(
    Object.entries(postParameters),
  )('%s', async (name, parameters) => {
    const response = await query
      .post('/lessons')
      .send(parameters);
    const expected = expectedIds[name];

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expected);
  });

  test.each(
    Object.keys(postParameters),
  )('GET ids from lessons %s with status 0', async (name) => {
    const { title } = postParameters[name];
    const actual = await knex('lessons')
      .select('id')
      .where('title', title)
      .andWhere('status', 0)
      .then((ids) => ids.map(({ id }) => id));
    const expected = expectedIds[name];

    expect(actual).toEqual(expected);
  });

  test.each(
    Object.keys(postParameters),
  )('GET ids from lessons %s with status 1', async (name) => {
    const { title } = postParameters[name];
    const actual = await knex('lessons')
      .select('id')
      .where('title', title)
      .andWhere('status', 1);
    const expected = [];

    expect(actual).toEqual(expected);
  });

  test.each(
    Object.keys(postParameters),
  )('GET ids from lessons %s', async (name) => {
    const { teacherIds } = postParameters[name];
    const actual = await knex('lesson_teachers')
      .select('lesson_id as id')
      .whereIn('teacher_id', teacherIds)
      .andWhere('lesson_id', '>', 10)
      .then((ids) => ids.map(({ id }) => id));
    const expected = expectedIds[name];
    const expectedLength = expected.length * teacherIds.length;

    expect(actual).toHaveLength(expectedLength);
    expect(new Set(actual)).toEqual(new Set(expected));
  });
});

describe('POST negative cases', () => {
  const invalidPostParameters = {
    teacherIds: [1, [], ['1'], [1.23]],
    title: [1, null, { title: 'unknown' }, true],
    days: [1, [], ['1'], [7]],
    firstDate: ['2020/01/19', 20201920, '2021-02-29', ''],
    lessonsCount: [undefined, '1', 1.23, { count: 15 }],
    lastDate: [undefined, new Date(), ['2020', '02', '20'], '18-02-2020'],
  };

  test.each([1, 2, 3, 4, 5])('case %s', async (i) => {
    const parameters = Object.keys(invalidPostParameters)
      .reduce((acc, parameter) => ({
        ...acc,
        [parameter]: invalidPostParameters[parameter][i - 1],
      }), {});
    const response = await query
      .post('/lessons')
      .send(parameters);
    const string = Object.entries(invalidPostParameters)
      .map(([parameter, value]) => `${parameter}=${JSON.stringify(value[i - 1])}`)
      .join(', ');

    expect(response.status).toBe(400);
    expect(response.text).toBe(`Error -> Invalid parameter(s) value: ${string}.`);
  });

  test('with invalid data type: array', async () => {
    const response = await query
      .post('/lessons')
      .send([]);

    expect(response.status).toBe(400);
    expect(response.text).toBe(`Error -> Invalid parameters type: ${JSON.stringify([])}.`);
  });

  test('with unknown parameter', async () => {
    const response = await query
      .post('/lessons')
      .send({ hello: 'world' });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Error -> Unknown parameter(s): hello.');
  });
});

afterAll(() => knex.destroy());
