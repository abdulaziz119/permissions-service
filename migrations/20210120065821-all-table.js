var dbm;
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db, callback) {
    db.runSql(`
        -- Create permissions table
    CREATE TABLE IF NOT EXISTS public.permissions (
      id SERIAL PRIMARY KEY,
      api_key TEXT NOT NULL,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      UNIQUE (api_key, module, action)
    );
    `, function (err) {
        if (err) return callback(err);
        callback();
    });
};

exports.down = function (db, callback) {
    db.runSql(`
        -- Drop tables in reverse order of creation to handle dependencies
        DROP TABLE IF EXISTS public.permissions;
    `, function (err) {
        if (err) return callback(err);
        callback();
    });
};

exports._meta = {
    "version": 1
};
