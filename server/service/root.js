import rootDAO from '../dao/root.js';

const validateParameters = (obj) => {
  const validateScheme = {
    date: (value) => /^\d{4}(-\d{2}){2}(,\d{4}(-\d{2}){2})?$/.test(value),
    status: (value) => /^[01]$/.test(value),
    teacherIds: (value) => /^(null|\d+(,\d+)*)$/.test(value),
    studentsCount: (value) => /^(null|\d+(,\d+)?)$/.test(value),
    page: (value) => /^\d+$/.test(value),
    lessonsPerPage: (value) => /^\d+$/.test(value),
  };

  return Object.keys(obj)
    .filter((parameter) => !validateScheme[parameter](obj[parameter]));
};

export default (filterParameters) => {
  const {
    date,
    status,
    teacherIds,
    studentsCount,
    page = 1,
    lessonsPerPage = 5,
    ...rest
  } = filterParameters;

  const restParameters = Object.keys(rest);
  if (restParameters.length > 0) {
    throw new Error(`Unknown filter parameter(s): ${restParameters.join(', ')}.`);
  }

  const parametersWithInvalidValue = validateParameters(filterParameters);
  if (parametersWithInvalidValue.length > 0) {
    throw new Error(`Invalid parameter(s) value: ${parametersWithInvalidValue.join(', ')}.`);
  }

  return rootDAO(date, status, teacherIds, studentsCount, page, lessonsPerPage);
};
