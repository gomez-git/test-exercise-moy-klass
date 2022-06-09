import { isMatch } from 'date-fns';
import rootDAO from '../dao/root.js';

const validateParameters = (parameters) => {
  const validationScheme = {
    date: (value) => value.split(',').every((d) => isMatch(d, 'yyyy-MM-dd')),
    status: (value) => /^[01]$/.test(value),
    teacherIds: (value) => /^(null|\d+(,\d+)*)$/.test(value),
    studentsCount: (value) => (
      /^(null|\d+(,\d+)?)$/.test(value) && !(value.split(',')[1] && value.split(',')[0] > value.split(',')[1])
    ),
    page: (value) => /^\d+$/.test(value),
    lessonsPerPage: (value) => /^\d+$/.test(value),
  };

  return Object.entries(parameters)
    .filter(([parameter, value]) => !validationScheme[parameter](value));
};

export default (filterParameters) => {
  const {
    date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5, ...rest
  } = filterParameters;

  const restParameters = Object.keys(rest);
  if (restParameters.length > 0) {
    throw new Error(`Unknown filter parameter(s): ${restParameters.join(', ')}.`);
  }

  const parametersWithInvalidValue = validateParameters(filterParameters);
  if (parametersWithInvalidValue.length > 0) {
    const string = parametersWithInvalidValue
      .map(([parameter, value]) => `${parameter}=${JSON.stringify(value)}`)
      .join(', ');
    throw new Error(`Invalid parameter(s) value: ${string}.`);
  }

  return rootDAO(date, status, teacherIds, studentsCount, page, lessonsPerPage);
};
