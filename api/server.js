const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 8081;

app.use(express.json());

app.use(cors());

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prueba'
};

// Prueba de conexión
function testConnection(callback) {
    const connection = mysql.createConnection(dbConfig);
    connection.connect(err => {
        if (err) {
            console.error('Error al conectar a la base de datos:', err);
            callback(err, null, null); 
        }
        console.log('Conectado con éxito a la base de datos!');
        callback(null, connection); 
    });
}


app.get('/test-connection', (req, res) => {
    testConnection(res);
});

// Get en la bd
app.get('/autores', (req, res) => {
    testConnection((err, connection) => {
        if (err) {
            res.status(500).send('Error al conectar a la base de datos: ' + err);
            return;
        }

        connection.query('SELECT * FROM usuario', (err, results) => { 
            if (err) {
                console.error('Error al realizar la consulta:', err);
                res.status(500).send('Error al realizar la consulta: ' + err);
                return;
            }
            console.log('Resultado de la consulta:', results);
            res.json(results);

            connection.end(() => console.log('Conexión cerrada'));
        });
    });
});


// Delete en la bd
app.delete('/autores/:id', (req, res) => {
    const { id } = req.params; 

    testConnection((err, connection) => {
        if (err) {
            res.status(500).send('Error al conectar a la base de datos: ' + err);
            return;
        }

        const query = 'DELETE FROM usuario WHERE id = ?';
        connection.query(query, [id], (err, results) => {
            if (err) {
                console.error('Error al realizar la consulta:', err);
                res.status(500).send('Error al intentar eliminar el autor: ' + err);
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Autor no encontrado con el ID: ' + id);
            } else {
                console.log('Autor eliminado con éxito');
                res.send('Autor eliminado con éxito');
            }

            connection.end(() => console.log('Conexión cerrada'));
        });
    });
});

// Insert en la bd
app.post('/autores', (req, res) => {
    // const { nombre } = req.body; 
    const { id, nombre } = req.body; 

    if (!nombre) {
        return res.status(400).send('El nombre del autor es obligatorio');
    }


    testConnection((err, connection) => {
        if (err) {
            res.status(500).send('Error al conectar a la base de datos: ' + err);
            return;
        }

        const query = 'INSERT INTO usuario (id, nombre) VALUES (?, ?)';
        connection.query(query, [id, nombre], (err, results) => {
            if (err) {
                console.error('Error al realizar la consulta:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('El ID proporcionado ya está en uso');
                }
                res.status(500).send('Error al intentar añadir el autor: ' + err);
                return;
            }
            console.log('Autor añadido con éxito');
            res.status(201).send({ id, nombre });

            connection.end(() => console.log('Conexión cerrada'));
        });
    });
});

// Modificacion en la bd
app.put('/autores/:id', (req, res) => {
    const { id } = req.params; // Obtenemos el id
    const { nombre } = req.body; // Obtenemos el nuevo nombre

    if (!nombre) {
        return res.status(400).send('El nombre del autor es obligatorio para la actualización');
    }

    testConnection((err, connection) => {
        if (err) {
            res.status(500).send('Error al conectar a la base de datos: ' + err);
            return;
        }

        const query = 'UPDATE usuario SET nombre = ? WHERE id = ?';
        connection.query(query, [nombre, id], (err, results) => {
            if (err) {
                console.error('Error al realizar la consulta:', err);
                res.status(500).send('Error al intentar actualizar el autor: ' + err);
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).send('Autor no encontrado con el ID: ' + id);
            } else {
                console.log('Autor actualizado con éxito');
                res.send('Autor actualizado con éxito');
            }

            connection.end(() => console.log('Conexión cerrada'));
        });
    });
});



app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});


//Crear package.json: npm init -y
