const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
db = null;
const dbpath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//getting movie names from movie table

app.get("/movies/", async (request, response) => {
  const getQuery = `
        SELECT movie_name FROM movie;
    `;
  const moviesArray = await db.all(getQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//getting movie names for specific id from movie table

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `
        SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movie = await db.get(getQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//posting

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postQuery = `
       INSERT INTO 
             movie (director_id,movie_name,lead_actor)
       VALUES
            (${directorId},'${movieName}','${leadActor}');
    `;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//PUT

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const putQuery = `
          UPDATE
              movie
           SET 
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor= '${leadActor}'
           WHERE
             movie_id = ${movieId};
    `;
  await db.run(putQuery);
  response.send("Movie Details Updated");
});

//DELETE

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM 
            movie 
        WHERE
            movie_id = ${movieId};
           
    `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//GET

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
          SELECT 
             * 
          FROM 
            director;
    `;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//GET

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getQuery = `
       SELECT 
          movie_name
        FROM 
          movie
        WHERE
          director_id = ${directorId};
    `;
  const movieArray = await db.all(getQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
