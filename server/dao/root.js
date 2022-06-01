import knex from '../db/db.js';

const getRawWhereDateQuery = (date) => {
  if (date === undefined) {
    return '';
  }
  const [firstDate, lastDate = firstDate] = date.split(',');
  return `WHERE date BETWEEN '${firstDate}' AND '${lastDate}' `;
};

const getRawWhereStatusQuery = (status) => (status === undefined
  ? ''
  : `WHERE status = ${status} `);

const getRawWhereStudentsCountQuery = (studentsCount) => {
  if (studentsCount === undefined) {
    return '';
  }
  const [min, max = min] = studentsCount.split(',');
  return studentsCount === 'null'
    ? 'WHERE ARRAY_LENGTH(students, 1) ISNULL '
    : `WHERE ARRAY_LENGTH(students, 1) BETWEEN ${min} AND ${max} `;
};

const getRawWhereTeachersQuery = (teacherIds) => {
  if (teacherIds === undefined) {
    return '';
  }
  return teacherIds === 'null'
    ? 'WHERE teachers ISNULL '
    : 'WHERE teachers NOTNULL ';
};

const getLessonVisitCountStudentsTable = () => knex('lesson_students')
  .select('lesson_id', knex.raw('count(visit)::integer as visit_count'))
  .where('visit', '=', 'true')
  .groupBy('lesson_id');

const getLessonArrStudentsTable = () => knex('lesson_students')
  .select(
    'lesson_id',
    knex.raw('array_agg(student_id) as students'),
  )
  .groupBy('lesson_id')
  .as('lesson_arr_students');

const getLessonFilteredTeachersTable = (table, teacherIds) => (
  teacherIds === undefined || teacherIds === 'null'
    ? table
    : table.join(
      knex('lesson_teachers')
        .select('lesson_id as id')
        .whereIn('teacher_id', teacherIds.split(','))
        .as('lesson_filtered_teachers'),
      'lesson_id',
      'lesson_filtered_teachers.id',
    ));

const getLessonArrTeachersTable = (teacherIds) => {
  const table = knex('lesson_teachers')
    .select('lesson_id', knex.raw('array_agg(distinct teacher_id) as teachers'));

  const tableWithFilter = getLessonFilteredTeachersTable(table, teacherIds);

  return tableWithFilter
    .groupBy('lesson_id')
    .as('lesson_arr_teachers');
};

const getDataFromDB = async (rawWhereQueryAll, teacherIds, lessonsPerPage, page) => {
  const data = await knex('lessons')
    .with('lesson_visit_count_students', getLessonVisitCountStudentsTable())
    .select(
      'id',
      knex.raw('date::varchar(10)'),
      'title',
      'status',
      'visit_count AS visitCount',
      'students',
      'teachers',
    )
    .leftJoin('lesson_visit_count_students', 'id', 'lesson_visit_count_students.lesson_id')
    .leftJoin(getLessonArrStudentsTable(), 'id', 'lesson_arr_students.lesson_id')
    .leftJoin(getLessonArrTeachersTable(teacherIds), 'id', 'lesson_arr_teachers.lesson_id')
    .whereRaw(rawWhereQueryAll)
    .orderBy(['status', 'id'])
    .limit(lessonsPerPage)
    .offset((page - 1) * lessonsPerPage);

  return data;
};

const fillStudentsAndTeachers = async (data) => {
  const promises = data
    .map(async ({ students, teachers, ...rest }) => ({
      ...rest,
      students: (students ? await knex('students').whereIn('id', students) : students),
      teachers: (teachers ? await knex('teachers').whereIn('id', teachers) : teachers),
    }));

  const filledData = await Promise.all(promises);

  return filledData;
};

export default async (date, status, teacherIds, studentsCount, page, lessonsPerPage) => {
  const rawWhereQueryDate = getRawWhereDateQuery(date);
  const rawWhereQueryStatus = getRawWhereStatusQuery(status);
  const rawWhereQueryStudentsCount = getRawWhereStudentsCountQuery(studentsCount);
  const rawWhereQueryTeachers = getRawWhereTeachersQuery(teacherIds);
  const rawWhereQueryAll = (
    `${rawWhereQueryTeachers}${rawWhereQueryDate}${rawWhereQueryStatus}${rawWhereQueryStudentsCount}`
  ).replace('WHERE ', '').replace(/WHERE/g, 'AND');

  const dataFromDB = await getDataFromDB(rawWhereQueryAll, teacherIds, lessonsPerPage, page);
  const filledData = await fillStudentsAndTeachers(dataFromDB);

  return filledData;
};
