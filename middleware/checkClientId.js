
module.exports = function (req, res, next) {
  // Get token from header
  const clientId = req.header('client_id');

  console.log('clientId : ', clientId)

  // Check if not clientId
  if (!clientId) {
    return res.status(401).json({ msg: 'No Client-Id, authorization denied' });
  }

  // Verify token
  try {
    next();
  } catch (err) {
    console.error('something wrong with Client-Id middleware');
    res.status(500).json({ msg: 'Server Error' });
  }
};
