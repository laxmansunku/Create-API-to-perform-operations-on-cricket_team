const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");
let db = null;
const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running At http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DBError: ${error.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// list of players API
app.get("/players/", async (request, response) => {
  const getAllPlayersList = `
    SELECT 
      * 
    FROM 
      cricket_team`;
  const playersArray = await db.all(getAllPlayersList);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
// create new player in team
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetails = `
    INSERT INTO 
        cricket_team(player_name,jersey_number,role)
    VALUES 
        ('${playerName}',
        '${jerseyNumber}',
        '${role}'
        );`;
  await db.run(addPlayerDetails);

  response.send("Player Added to Team");
});

//Return a player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(player);
});

//update details of a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE 
      cricket_team 
    SET 
      player_name = '${playerName}',
      jersey_number = '${jerseyNumber}',
      role = '${role}'
    WHERE 
      player_id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//delete a player from team
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
