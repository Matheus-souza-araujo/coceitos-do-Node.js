const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { request, response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error: "User not found!"})
  }

  request.user = user;

  return next();
} 




app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error:'User already exists'})
  }


  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[],
  };

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos.push(todoOperation);

  return response.status(201).json(todoOperation)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const { id } = request.params

  const checkTodo = user.todos.find(todo => todo.id === id)

  if (!checkTodo){
    return response.status(404).json({error: "Todo not found!"})
  }

  checkTodo.title = title,
  checkTodo.deadline = deadline


  return response.json(checkTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } =request;
  const { id } = request.params

  const checkTodo = user.todos.find(todo => todo.id === id);

  if (!checkTodo){
    return response.status(404).json({error: "Todo not found!"})
  }

  const newDone = true

  checkTodo.done = newDone;

  return response.json(checkTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } =request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id);//findIndex retorna a posição no array que o objeto está localizado

  if (todoIndex === -1){
    return response.status(404).json({error: "Todo not found!"})
  }

  user.todos.splice(todoIndex, 1)// primeiro argumento: Por onde quero comecar a excluir; Segundo argumento: quantas posições quero excluir após o inicio

  return response.status(204).send();
});

module.exports = app;