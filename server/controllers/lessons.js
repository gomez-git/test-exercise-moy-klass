import lessonsService from '../service/lessons.js';

export default async (req, res) => {
  try {
    const ids = await lessonsService(req.body);
    res.status(201).json(ids);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    res.status(400).send(`Error -> ${error.message}`);
  }
};
