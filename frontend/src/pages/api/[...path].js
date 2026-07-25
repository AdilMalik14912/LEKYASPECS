const app = require('../../../../backend/src/app');

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default function handler(req, res) {
  return app(req, res);
}
