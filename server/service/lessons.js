import { isMatch } from 'date-fns';
import lessonsDAO from '../dao/lessons.js';

const validateParameters = (parameters) => {
  const validationScheme = {
    teacherIds: (values) => (
      Array.isArray(values) && values.length !== 0
        ? values.every((value) => typeof value === 'number' && /^\d+$/.test(value))
        : false
    ),
    title: (value) => typeof value === 'string',
    days: (values) => (
      Array.isArray(values) && values.length !== 0
        ? values.every((value) => typeof value === 'number' && /^[0-6]$/.test(value))
        : false
    ),
    firstDate: (value) => isMatch(value, 'yyyy-MM-dd'),
    lessonsCount: (value) => (
      value === undefined
        ? parameters.lastDate !== undefined
        : typeof value === 'number' && /^\d+$/.test(value)
    ),
    lastDate: (value) => (
      value === undefined
        ? parameters.lessonsCount !== undefined
        : isMatch(value, 'yyyy-MM-dd')
    ),
  };

  return Object.keys(validationScheme)
    .filter((parameter) => !validationScheme[parameter](parameters[parameter]));
};

export default (parameters) => {
  if (Array.isArray(parameters)) {
    throw new Error(`Invalid parameters type: ${JSON.stringify(parameters)}.`);
  }

  const {
    teacherIds, title, days, firstDate, lessonsCount, lastDate, ...rest
  } = parameters;

  const restParameters = Object.keys(rest);
  if (restParameters.length > 0) {
    throw new Error(`Unknown parameter(s): ${restParameters.join(', ')}.`);
  }

  const parametersWithInvalidValue = validateParameters(parameters);
  if (parametersWithInvalidValue.length > 0) {
    const string = parametersWithInvalidValue
      .map((parameter) => `${parameter}=${JSON.stringify(parameters[parameter])}`)
      .join(', ');

    throw new Error(`Invalid parameter(s) value: ${string}.`);
  }

  return lessonsDAO(teacherIds, title, days, firstDate, lessonsCount, lastDate);
};
