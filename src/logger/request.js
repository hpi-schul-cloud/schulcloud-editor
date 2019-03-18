module.exports = logger => req => logger.info({	// later log the information
	timestamp: new Date(),
	userId: req.headers.authorization,
	url: req.url,
	data: req.body,
	method: req.method,
	ip: req.ip,
	ips: req.ips,
});
