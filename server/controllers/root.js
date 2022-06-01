import rootService from '../service/root.js';

export default async (req, res) => {
  try {
    const obj = await rootService(req.query);
    res.json(obj);
  } catch (error) {
    console.error(error.message); // eslint-disable-line no-console
    res.status(400).send(error.message);
  }
};
