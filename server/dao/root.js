import knex from '../db/db.js';

const getMainTable = () => knex('lessons')
  .select(
    'id',
    knex.raw('date::VARCHAR(10)'),
    'title',
    'status',
    knex.raw('COALESCE(visit_count::INTEGER, 0) AS "visitCount"'),
    knex.raw('COALESCE(arr_students, ARRAY[]::JSON[]) AS students'),
    knex.raw('COALESCE(arr_teachers, ARRAY[]::JSON[]) AS teachers'),
  );

const getLessonFilteredTeachersTable = (table, teacherIds) => (
  teacherIds === undefined
    ? table
    : table.join(
      knex('lesson_teachers')
        .select('lesson_id as l_id')
        .distinct()
        .whereIn('teacher_id', teacherIds.split(','))
        .as('lesson_filtered_teachers'),
      'lesson_id',
      'lesson_filtered_teachers.l_id',
    ));

const getLessonArrTeachersTable = (teacherIds) => {
  const table = knex('lesson_teachers')
    .select(
      'lesson_id',
      knex.raw(
        'ARRAY_AGG('
        + 'JSON_BUILD_OBJECT(\'id\', id, \'name\', name) '
        + 'ORDER BY id'
        + ') AS arr_teachers',
      ),
    )
    .join('teachers', 'teacher_id', 'id');

  const tableWithFilter = getLessonFilteredTeachersTable(table, teacherIds);

  return tableWithFilter
    .groupBy('lesson_id')
    .as('lesson_arr_teachers');
};

const joinLessonTeachersTable = (table, teacherIds) => {
  const joinParameters = ['id', 'lesson_arr_teachers.lesson_id'];

  switch (teacherIds) {
    case undefined:
    case 'null':
    case '0':
      return table
        .leftJoin(getLessonArrTeachersTable(), ...joinParameters);
    default:
      return table
        .join(getLessonArrTeachersTable(teacherIds), ...joinParameters);
  }
};

const getLessonArrStudentsTable = () => knex('lesson_students')
  .select(
    'lesson_id',
    knex.raw('SUM(visit::INTEGER) as visit_count'),
    knex.raw(
      'ARRAY_AGG('
      + 'JSON_BUILD_OBJECT(\'id\', id, \'name\', name, \'visit\', visit) '
      + 'ORDER BY id'
      + ') AS arr_students',
    ),
  )
  .join('students', 'student_id', 'id')
  .groupBy('lesson_id')
  .as('lesson_arr_students');

const joinLessonStudentsTable = (table) => table
  .leftJoin(
    getLessonArrStudentsTable(),
    'id',
    'lesson_arr_students.lesson_id',
  );

const filterWhenTeachersIsNull = (table, teacherIds) => (
  teacherIds === 'null' || teacherIds === '0'
    ? table.whereNull('arr_teachers')
    : table
);

const filterStudentsCount = (table, studentsCount) => {
  switch (studentsCount) {
    case 'null':
      return table.whereNull('arr_students');
    case undefined:
      return table;
    default: {
      const [min, max = min] = studentsCount.split(',');

      return min === '0'
        ? table
          .whereRaw(`ARRAY_LENGTH(arr_students, 1) BETWEEN ${min} AND ${max} OR arr_students ISNULL`)
        : table
          .whereRaw(`ARRAY_LENGTH(arr_students, 1) BETWEEN ${min} AND ${max}`);
    }
  }
};

const filterWithDate = (table, date = '') => {
  const [firstDate, lastDate = firstDate] = date.split(',');

  return date === ''
    ? table
    : table.whereBetween('date', [firstDate, lastDate]);
};

const filterWithStatus = (table, status) => (
  status === undefined
    ? table
    : table.where('status', '=', status)
);

export default async (date, status, teacherIds, studentsCount, page, lessonsPerPage) => {
  const limit = lessonsPerPage;
  const offset = (page - 1) * lessonsPerPage;

  const mainTable = getMainTable();
  const tableWithTeachers = joinLessonTeachersTable(mainTable, teacherIds);
  const tableWithStudents = joinLessonStudentsTable(tableWithTeachers, studentsCount);
  const filteredWithStudentsCount = filterStudentsCount(tableWithStudents, studentsCount);
  const filteredWithTeachers = filterWhenTeachersIsNull(filteredWithStudentsCount, teacherIds);
  const filteredWithDate = filterWithDate(filteredWithTeachers, date);
  const filteredWithStatus = filterWithStatus(filteredWithDate, status);
  const limitedData = await filteredWithStatus
    .orderBy(['status', 'id'])
    .limit(limit)
    .offset(offset);

  return limitedData;
};
