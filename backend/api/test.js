module.exports = (req, res) => {
  res.json({ status: 'test OK', timestamp: new Date() });
};
