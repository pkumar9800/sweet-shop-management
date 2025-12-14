import "../config.js";
import connectDB from "./utils/db.connection.js";
import app from "./app.js";
import seedAdmin from './utils/admin.seed.js';

const port = process.env.PORT || 8000;

connectDB()
  .then(async () => {
    if (process.env.NODE_ENV !== "dev") {
      console.log("Checking for Admin Seeding...");
      await seedAdmin();
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(console.error);