const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Parse incoming JSON data
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://hermesmapapp:jzFAZXVdzEyCfHwh@hermes-cluster.qqt9zti.mongodb.net/hermesmapdb?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Hermes API' });
});

// Data schema
const incidentSchema = new mongoose.Schema({
  type: String,
  reason: String,
  dateCreated: Date,
  deathDate: Date,
  geometry: {
    type: String,
    coordinates: mongoose.Schema.Types.Mixed,
  },
});

const Incident = mongoose.model('Incident', incidentSchema);

const collectionName = "incidents";

// CRUD operations
app.get('/incidents', (req, res) => {
  Incident.find({})
    .then((incidents) => {
      res.json(incidents);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.post('/incidents', (req, res) => {
  const incident = new Incident(req.body);
  incident.save()
    .then((savedIncident) => {
      res.json(savedIncident);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.get('/incidents/:id', (req, res) => {
  Incident.findById(req.params.id)
    .then((incident) => {
      if (incident) {
        res.json(incident);
      } else {
        res.status(404).json({ error: 'Incident not found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.put('/incidents/:id', (req, res) => {
  Incident.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((incident) => {
      res.json(incident);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.delete('/incidents/:id', (req, res) => {
  Incident.findByIdAndDelete(req.params.id)
    .then(() => {
      res.json({ message: 'Incident deleted' });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

app.get('/incidents', (req, res) => {
  const { latitude, longitude, radius } = req.query;

  // Validate query parameters
  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ error: 'Latitude, longitude, and radius are required query parameters.' });
  }

  const centerPoint = {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)],
  };

  // Convert kilometer radius to meters
  const radiusInMeters = parseFloat(radius) * 1000;

  Incident.find({
    geometry: {
      $near: {
        $geometry: centerPoint,
        $maxDistance: radiusInMeters,
      },
    },
  })
    .exec((err, incidents) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.json(incidents);
      }
    });
});


// Start the server
app.listen(3003, () => {
  console.log('Server started on port 3003');
});
