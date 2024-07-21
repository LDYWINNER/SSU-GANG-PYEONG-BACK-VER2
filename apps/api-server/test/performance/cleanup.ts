import { Client } from 'pg';

const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
});

client.connect();

const cleanupData = async () => {
  try {
    await client.query('BEGIN');

    const deleteQueries = [
      'DELETE FROM "user";',
      'DELETE FROM "table";',
      'DELETE FROM "school_schedule";',
      'DELETE FROM "personal_schedule";',
      'DELETE FROM "refresh_token";',
      'DELETE FROM "board";',
      'DELETE FROM "board_post";',
      'DELETE FROM "board_comment";',
      'DELETE FROM "todo_category";',
      'DELETE FROM "todo_task";',
      'DELETE FROM "course";',
      'DELETE FROM "course_review";',
    ];

    for (const query of deleteQueries) {
      await client.query(query);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cleaning up data:', error);
  } finally {
    await client.end();
  }
};

cleanupData()
  .then(() => {
    console.log('Data cleanup completed.');
  })
  .catch((error) => {
    console.error('Cleanup failed:', error);
  });
