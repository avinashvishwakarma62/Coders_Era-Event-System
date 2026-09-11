const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authorization token is required"
            });
        }

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization format"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.admin = decoded;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;