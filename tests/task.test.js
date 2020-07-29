const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const User = require('../src/models/user');
const { taskOne, userTwo, taskThree, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toEqual(false);
});

test('Should return two tasks for userOne', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);

    expect(response.body.length).toBe(2);
});

test('Should not delete tasks other users when one of them is deleted', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(200);
    
    const task = await Task.findById(taskThree._id);
    expect(task).not.toBeNull();
});