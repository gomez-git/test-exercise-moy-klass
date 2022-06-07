import knex from '../db/db.js';

const getFirstYearMonthDateAndDay = (date) => {
  const firstDate = new Date(date);

  return {
    firstYear: firstDate.getFullYear(),
    firstMonth: firstDate.getMonth(),
    firstDateOfMonth: firstDate.getDate(),
    firstDayOfWeek: firstDate.getDay(),
  };
};

const getLessonsCountBetweenDates = (date1, date2, days) => {
  const firstDate = new Date(date1);
  const lastDate = new Date(date2);

  const millisecondsCountInDay = 86400000;
  const daysCountBetweenDates = (Math.abs(lastDate - firstDate) / millisecondsCountInDay) + 1;

  const daysCountInWeek = 7;
  const lessonsCountBetweenDates = Math.ceil(daysCountBetweenDates / daysCountInWeek) * days.length;

  return lessonsCountBetweenDates;
};

const getMaxLessonsDuration = (year, month, date) => {
  const startDate = new Date(year, month, date);
  const endDate = new Date(year + 1, month, date);
  const millisecondsCountInDay = 86400000;

  return (endDate - startDate) / millisecondsCountInDay;
};

const getDates = (days, firstDate, { lessonsCount, lastDate }) => {
  const {
    firstYear, firstMonth, firstDateOfMonth, firstDayOfWeek,
  } = getFirstYearMonthDateAndDay(firstDate);
  const daysCountInWeek = 7;

  const lessonsCountBetweenDates = getLessonsCountBetweenDates(firstDate, lastDate, days);

  const maxLessonsDuration = getMaxLessonsDuration(firstYear, firstMonth, firstDateOfMonth);
  const maxLessonsCount = 300;

  const limitedLessonCounts = (lessonsCount ?? lessonsCountBetweenDates) > maxLessonsCount
    ? maxLessonsCount
    : lessonsCount ?? lessonsCountBetweenDates;
  const weeksCount = Math.ceil(limitedLessonCounts / days.length) + 1;

  const dates = [...Array(weeksCount)]
    .map(() => days)
    .flatMap((daysArr, week) => daysArr.map((dayOfWeek) => dayOfWeek + (week * daysCountInWeek)))
    .filter((day) => day >= firstDayOfWeek && day < (firstDayOfWeek + maxLessonsDuration))
    .map((day) => new Date(firstYear, firstMonth, firstDateOfMonth - firstDayOfWeek + day))
    .map((date) => date.toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' }))
    .slice(0, limitedLessonCounts);

  return lastDate && lessonsCount === undefined
    ? dates.filter((date) => date <= lastDate)
    : dates;
};

const buildLessons = (title, dates) => dates
  .map((date) => ({ title, date, status: 0 }));

const buildLessonTeachers = (lessonIds, teacherIds) => lessonIds
  .flatMap(({ id: lessonId }) => teacherIds
    .map((teacherId) => ({
      lesson_id: lessonId,
      teacher_id: teacherId,
    })));

export default async (teacherIds, title, days, firstDate, lessonsCount, lastDate) => {
  const dates = getDates(days, firstDate, { lessonsCount, lastDate });
  const lessons = buildLessons(title, dates);
  const trx = await knex.transaction();
  const lessonIds = await trx('lessons')
    .insert(lessons, 'id')
    .then(async (ids) => {
      const lessonTeachers = buildLessonTeachers(ids, teacherIds);
      await trx('lesson_teachers').insert(lessonTeachers);

      return ids.map(({ id }) => id);
    })
    .catch(async (error) => {
      await trx.rollback();
      throw error;
    });

  await trx.commit();

  return lessonIds;
};
