import { MongoClient } from 'mongodb';
import { createInterface } from 'readline';
import { Cuenta } from './cuenta';
const conexión = new MongoClient('mongodb://localhost:27017', {useNewUrlParser: true});
const baseCajero = 'cajero';

const r1 = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'CAJERO>'
});

function ayuda() {
    console.log('Menú de comandos: ');
    console.log('ayuda: Este mensaje');
}

conexión.connect().then(async () => {
    console.log('Conectado a la DB ' + baseCajero);
    const bd = conexión.db(baseCajero);
    console.log('Aplicación de Cajero piola, ingrese un comando');
    r1.prompt();

    r1.on('line', async (linea: string) => {
        const arr = linea.split(' ');
        if (arr.length > 1) {
            switch(arr[0]) {
                case 'crear': {
                    const nuevaCuenta: Cuenta = {
                        numero: +arr[1],
                        clave: +arr[3],
                        nombre: arr[2],
                        saldo: 0
                    }
                    const cuentas = bd.collection('cuentas');
                    try {
                        const cuentaExiste = await cuentas.findOne({numero: nuevaCuenta.numero});
                        if (cuentaExiste) {
                            console.log('Ya existe una cuenta con ese número: ' + JSON.stringify(cuentaExiste));
                        } else {
                            await cuentas.insertOne(nuevaCuenta);
                            console.log('Cuenta creada!');
                        }
                    } catch (err) {
                        console.log(err);
                    }
                    break;
                }
                default:
                case 'ayuda': {
                    ayuda();
                    break;
                }
            }
        } else {
            switch(linea) {
                default:
                case 'ayuda': {
                    ayuda();
                    break;
                }
                case 'salir': {
                    r1.close();
                    break;
                }
                case 'listar': {
                    try {
                        const cuentas = await bd.collection('cuentas').find().toArray();
                        console.log(cuentas);
                    } catch (err) {
                        console.log(err);
                    }                   
                }
            }
        }
        r1.prompt();
    });
    r1.on('close', () => {
        console.log('Cerrando conexión a base de datos..');
        conexión.close();
        process.exit();
    });
});
