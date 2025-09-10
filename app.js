const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const app = express();

app.use(express.json());

app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API de Movies" });
});

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://genuine-rabanadas-638b0f.netlify.app",
];

app.get("/movies", (req, res) => {
  const origin = req.header("origin");
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  // Si no hay género, devuelve todas las películas
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((m) => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  return res.json(movie);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;
  const result = validatePartialMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex((m) => m.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data,
  };
  movies[movieIndex] = updatedMovie;
  res.json(updatedMovie);
});

app.delete("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  const { id } = req.params;
  const movieIndex = movies.findIndex((m) => m.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }
  movies.splice(movieIndex, 1);
  res.status(204).end();
});

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  if (allowedOrigins.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
  }
  res.status(204).end();
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
