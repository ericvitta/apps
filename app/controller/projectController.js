const express = require ('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/Project');
const Task = require('../models/Task');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (_req, res) => {
   try {
       const projects = await Project.find().populate(['user', 'tasks']);
       return res.send({ projects});

   }catch (err) {
       return res.status(400).send({ error: 'Erro ao carregar projetos.'});
   }
});

router.get('/:projectId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);
        return res.send({ project});
 
    }catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar projetos.'});
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.create({ title, description, user: req.userId });
      
      await Promise.all(tasks.map(async task => {

          const projectTask = new Task({...task, project: project._id}); 

          await projectTask.save();

         project.tasks.push(projectTask);
    }));
        
        await project.save();  

      return res.send({ project });
    } catch (err) {
        console.log(err);
      return res.status(400).send({ error: 'Erro ao criar novo projeto.' });
    }
});

router.put('/:projectId', async (req, res) => {
    try {
        const { title, description, tasks } = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectId , {
            title,
            description
        }, {new: true});

        project.tasks = [];
        
        await Task.remove({ project: project._id});
      
      await Promise.all(tasks.map(async task => {

          const projectTask = new Task({...task, project: project._id}); 

          await projectTask.save();

         project.tasks.push(projectTask);
         console.log({ tasks });
    }));
        
        await project.save();  

      return res.send({ project });
    } catch (err) {
        console.log(err);
      return res.status(400).send({ error: 'Erro ao criar novo projeto.' });
    }
});

router.delete('/:projectId', async (req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);
        return res.send({ Message:'Projeto removido com sucesso.'});
 
    }catch (err) {
        return res.status(400).send({ error: 'Erro ao deletar projeto.'});
    }
});

module.exports = app => app.use('/projects', router);