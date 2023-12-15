const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

/*const hasPriorityAndStatusProperties = (requestQuery) => {
    return(
        requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
};

const hasPriorityProperties = (requestQuery) => {
    return requestQuery.priority !== undefined;
};

const hasStatusProperties = (requestQuery) => {
    return requestQuery.status !== undefined
}; */

// API call GET todoId

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
     SELECT
      *
    FROM 
     todo
    WHERE 
     id : ${todoId};
    `;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});

// posting an new Todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `
     INSERT INTO 
      todo (id , todo , priority , status)
      VALUES 
      (${id} , '${todo}' ,'${priority}' , '${status}' );
    `;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

// Deleting an todo

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
     DELETE FROM 
      todo 
      WHERE 
       id = ${todoId};
    `;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

// Api PUT

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT 
    * 
    FROM
    todo 
    WHERE 
    id = ${todoId};
    `;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const UpdatedTodoQuery = `
    UPDATED 
    todo 
    SET 
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
    WHERE 
    id = ${todoId};
    `;

  await database.run(UpdatedTodoQuery);
  response.send(`${updateColumn} Updated `);
});

module.exports = app;
