import "../config.js";
import connectDB from "./utils/db.connection.js";
import app from "./app.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(console.error);