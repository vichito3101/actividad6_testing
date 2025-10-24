export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.message });
    req[source] = value; // usa datos ya saneados
    next();
  };
