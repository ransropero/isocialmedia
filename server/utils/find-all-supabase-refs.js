const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const findSupabaseUrlsInAllTables = async () => {
    try {
        const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Get all tables and columns
        const [tables] = await sequelize.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND data_type IN ('character varying', 'text', 'json', 'jsonb')
        `);

        console.log(`Checking ${tables.length} string/json columns for Supabase URLs...`);

        const results = [];
        for (const row of tables) {
            const tableName = row.table_name;
            const columnName = row.column_name;

            try {
                // Search for supabase.co in each column
                const [rows] = await sequelize.query(`
                    SELECT "${columnName}" as value, id
                    FROM "${tableName}"
                    WHERE CAST("${columnName}" as text) LIKE '%supabase.co%'
                `);

                if (rows.length > 0) {
                    console.log(`Table "${tableName}" Column "${columnName}": Found ${rows.length} refs.`);
                    results.push({ tableName, columnName, count: rows.length });
                }
            } catch (err) {
                // Silently skip if table doesn't have ID or column doesn't exist
            }
        }

        if (results.length === 0) {
            console.log('No more Supabase URLs found in the database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Find Error:', error);
        process.exit(1);
    }
};

findSupabaseUrlsInAllTables();
