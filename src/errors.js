const general_error = function (error, message1, detail) {
	return {
    "error": error,
	"reasons": [
	    {
	        "language": "en",
	        "message": message1
	    }
	],
	"details": {
	    "msgId": "Id-f5aab7304f6c754804f70000",
	    "exception message": detail
	}
}}

module.exports = { general_error }
