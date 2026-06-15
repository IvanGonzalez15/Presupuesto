const db = require('./db');

const getCurrentDatabase = async () => {
  const [[row]] = await db.query('SELECT DATABASE() AS databaseName');
  return row.databaseName;
};

const findWrongElementoProjectForeignKeys = async (databaseName) => {
  const [rows] = await db.query(
    `SELECT kcu.CONSTRAINT_NAME AS constraintName
     FROM information_schema.KEY_COLUMN_USAGE kcu
     WHERE kcu.TABLE_SCHEMA = ?
       AND kcu.TABLE_NAME = 'elementos'
       AND kcu.COLUMN_NAME = 'id'
       AND kcu.REFERENCED_TABLE_NAME = 'proyectos'
       AND kcu.REFERENCED_COLUMN_NAME = 'id'`,
    [databaseName]
  );

  return rows.map((row) => row.constraintName);
};

const hasCorrectElementoProjectForeignKey = async (databaseName) => {
  const [rows] = await db.query(
    `SELECT 1
     FROM information_schema.KEY_COLUMN_USAGE kcu
     WHERE kcu.TABLE_SCHEMA = ?
       AND kcu.TABLE_NAME = 'elementos'
       AND kcu.COLUMN_NAME = 'Id_proyecto'
       AND kcu.REFERENCED_TABLE_NAME = 'proyectos'
       AND kcu.REFERENCED_COLUMN_NAME = 'id'
     LIMIT 1`,
    [databaseName]
  );

  return rows.length > 0;
};

const ensureElementoProjectForeignKey = async () => {
  const databaseName = await getCurrentDatabase();
  if (!databaseName) return;

  const wrongConstraints = await findWrongElementoProjectForeignKeys(databaseName);
  for (const constraintName of wrongConstraints) {
    await db.query(`ALTER TABLE elementos DROP FOREIGN KEY \`${constraintName}\``);
    console.log(`Clave foránea incorrecta eliminada de elementos: ${constraintName}`);
  }

  const hasCorrectConstraint = await hasCorrectElementoProjectForeignKey(databaseName);
  if (!hasCorrectConstraint) {
    await db.query(
      `ALTER TABLE elementos
       ADD CONSTRAINT Id_proyecto_fk
       FOREIGN KEY (Id_proyecto) REFERENCES proyectos(id)`
    );
    console.log('Clave foránea elementos.Id_proyecto -> proyectos.id verificada.');
  }
};

module.exports = { ensureElementoProjectForeignKey };
