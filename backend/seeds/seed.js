require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Service = require('../src/models/Service');
const Package = require('../src/models/Package');
const Client = require('../src/models/Client');
const Vehicle = require('../src/models/Vehicle');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

const seed = async () => {
  await connectDB();
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}),
    Service.deleteMany({}),
    Package.deleteMany({}),
    Client.deleteMany({}),
    Vehicle.deleteMany({})
  ]);

  const admin = await User.create({
    name: 'Administrador',
    email: 'admin@carwashoso.com',
    password: 'Admin123!',
    role: 'admin'
  });

  const [gerente, cajero] = await Promise.all([
    User.create({ name: 'Gerente Demo', email: 'gerente@carwashoso.com', password: 'Gerente123!', role: 'gerente' }),
    User.create({ name: 'Cajero Demo', email: 'cajero@carwashoso.com', password: 'Cajero123!', role: 'cajero' })
  ]);

  const [lavado, encerado, aspirado, pulido, antilluvia] = await Promise.all([
    Service.create({ name: 'Lavado Exterior', description: 'Lavado completo del exterior', price: 80, duration: 20, type: 'individual' }),
    Service.create({ name: 'Encerado', description: 'Encerado a mano', price: 150, duration: 30, type: 'individual' }),
    Service.create({ name: 'Aspirado Interior', description: 'Aspirado completo del interior', price: 60, duration: 15, type: 'individual' }),
    Service.create({ name: 'Pulido', description: 'Pulido de pintura', price: 300, duration: 60, type: 'individual' }),
    Service.create({ name: 'Antilluvia', description: 'Tratamiento antilluvia en cristales', price: 200, duration: 30, type: 'adicional' })
  ]);

  await Promise.all([
    Package.create({
      name: 'Paquete Básico',
      description: 'Lavado exterior y aspirado',
      price: 120,
      services: [lavado._id, aspirado._id],
      rainGuaranteeHours: 0
    }),
    Package.create({
      name: 'Paquete Completo',
      description: 'Lavado, aspirado y encerado con garantía 24h',
      price: 250,
      services: [lavado._id, aspirado._id, encerado._id],
      rainGuaranteeHours: 24
    }),
    Package.create({
      name: 'Paquete Premium',
      description: 'Todos los servicios con garantía 48h',
      price: 500,
      services: [lavado._id, aspirado._id, encerado._id, pulido._id],
      rainGuaranteeHours: 48
    })
  ]);

  const [client1, client2] = await Promise.all([
    Client.create({ name: 'Juan Pérez', phone: '555-1234', email: 'juan@example.com' }),
    Client.create({ name: 'María González', phone: '555-5678', email: 'maria@example.com' })
  ]);

  await Promise.all([
    Vehicle.create({ plate: 'ABC123', brand: 'Toyota', model: 'Corolla', color: 'Blanco', year: 2020, client: client1._id }),
    Vehicle.create({ plate: 'XYZ789', brand: 'Honda', model: 'Civic', color: 'Negro', year: 2021, client: client1._id }),
    Vehicle.create({ plate: 'DEF456', brand: 'Nissan', model: 'Sentra', color: 'Rojo', year: 2019, client: client2._id })
  ]);

  console.log('✅ Seed completed successfully!');
  console.log('Admin: admin@carwashoso.com / Admin123!');
  console.log('Gerente: gerente@carwashoso.com / Gerente123!');
  console.log('Cajero: cajero@carwashoso.com / Cajero123!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
