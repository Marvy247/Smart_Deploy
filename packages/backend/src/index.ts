import 'dotenv/config';
import app from './api';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Smart Deploy Backend running on port ${PORT}`);
});
